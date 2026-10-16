"""Turn class videos into slide frames + a timestamped Thai transcript.

Tuned for accuracy over speed. For each video it writes MGT520/extracted/<video name>/:
  frames/NNNN_HH-MM-SS.jpg  one full-resolution frame per slide, grabbed after the
                            slide has settled (not mid-transition); at least one every 30 s
  transcript.srt            subtitles with timestamps
  transcript.txt            one line per segment, [HH:MM:SS]; lines Whisper is unsure of
                            are marked [?] so they can be checked against the video
  notes.md                  each frame followed by what was said until the next frame
                            (the file to hand to Claude / another AI for summarising)

Usage:
  pip install faster-whisper pypdf
  python MGT520/tools/extract_video.py                      # all videos in MGT520/videos
  python MGT520/tools/extract_video.py "MGT520/videos/03-ภาวะผู้นำ ep1.mp4"
  python MGT520/tools/extract_video.py --check-gpu          # test the GPU setup only
  python MGT520/tools/extract_video.py --frames-only        # skip transcription

Needs ffmpeg on PATH (Windows: `winget install Gyan.FFmpeg`).
"""

import argparse
import os
import re
import subprocess
import sys
import traceback
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # MGT520/
THAI_MODEL = ROOT / "models" / "whisper-th-large-v3-ct2"  # built by convert_thai_model.py
VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".m4v", ".webm"}
COMMON_WORDS = {"that", "this", "with", "from", "have", "your", "they", "will", "what",
                "when", "which", "their", "there", "about", "into", "more", "than", "http",
                "https", "www", "html", "slide"}


def ts(seconds, sep=":"):
    s = int(seconds)
    return f"{s // 3600:02d}{sep}{s % 3600 // 60:02d}{sep}{s % 60:02d}"


def srt_ts(seconds):
    ms = int(round(seconds * 1000))
    return f"{ms // 3600000:02d}:{ms % 3600000 // 60000:02d}:{ms % 60000 // 1000:02d},{ms % 1000:03d}"


def run(cmd):
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if proc.returncode != 0:
        sys.exit(f"command failed: {' '.join(cmd)}\n{proc.stderr[-2000:]}")
    return proc


def duration(video):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "csv=p=0", str(video)]).stdout
    return float(out.strip())


def extract_frames(video, out_dir, scene, interval, min_gap, settle, width):
    """Find slide changes, then grab each slide `settle` s after it appears
    so fades and build animations have finished."""
    frames_dir = out_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for old in frames_dir.glob("*.jpg"):
        old.unlink()

    select = (
        f"select='isnan(prev_selected_t)"
        f"+gt(scene\\,{scene})*gte(t-prev_selected_t\\,{min_gap})"
        f"+gte(t-prev_selected_t\\,{interval})'"
    )
    proc = run(["ffmpeg", "-hide_banner", "-nostdin", "-i", str(video),
                "-an", "-vf", f"{select},showinfo", "-f", "null", "-"])
    times = [float(t) for t in re.findall(r"pts_time:([\d.]+)", proc.stderr)]
    end = duration(video)

    scale = ["-vf", f"scale='min({width},iw)':-2"] if width else []
    frames = []
    for i, t in enumerate(times):
        nxt = times[i + 1] if i + 1 < len(times) else end
        at = max(t, min(t + settle, nxt - 0.2, end - 0.2))
        path = frames_dir / f"{i + 1:04d}_{ts(t, '-')}.jpg"
        run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", f"{at:.3f}", "-i", str(video),
             "-frames:v", "1", *scale, "-q:v", "2", str(path)])
        frames.append((t, path))
    return frames


def slide_vocabulary(video, limit=60):
    """English terms from the matching lecture PDF (same NN- prefix), fed to Whisper
    so names and jargon the teacher says in English are spelled right."""
    try:
        from pypdf import PdfReader
    except ImportError:
        return []
    prefix = re.match(r"(\d+)-", video.stem)
    pdfs = sorted((ROOT / "lectures").glob(f"{prefix.group(1)}-*.pdf")) if prefix else []
    words = Counter()
    for pdf in pdfs:
        for page in PdfReader(pdf).pages:
            text = re.sub(r"\S*(https?://|www\.)\S*(\s*\S*-\n\S*)*", " ", page.extract_text() or "")
            for w in re.findall(r"[A-Za-z][A-Za-z'-]{2,}[A-Za-z]", text):
                if w.lower() not in COMMON_WORDS:
                    words[w] += 1
    return [w for w, _ in words.most_common(limit)]


def load_audio(video, rate=16000):
    """Decode audio with ffmpeg rather than faster-whisper's PyAV, whose API
    breaks between versions."""
    import numpy as np

    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostdin", "-i", str(video), "-vn",
         "-ac", "1", "-ar", str(rate), "-f", "s16le", "-"],
        capture_output=True,
    )
    if proc.returncode != 0:
        sys.exit(f"ffmpeg could not read audio from {video}:\n"
                 f"{proc.stderr.decode('utf-8', 'replace')[-2000:]}")
    return np.frombuffer(proc.stdout, np.int16).astype(np.float32) / 32768.0


def add_nvidia_dlls():
    """On Windows, `pip install nvidia-cublas-cu12 nvidia-cudnn-cu12` puts the CUDA DLLs
    under site-packages/nvidia/*/bin, which Windows does not search by itself."""
    if os.name != "nt":
        return
    for base in sys.path:
        for bin_dir in Path(base).glob("nvidia/*/bin"):
            os.add_dll_directory(str(bin_dir))
            os.environ["PATH"] = f"{bin_dir}{os.pathsep}{os.environ['PATH']}"


GPU_HELP = """\
  Fix (in this order, re-run with --check-gpu after each step):
    1. pip install -U faster-whisper ctranslate2 nvidia-cublas-cu12 "nvidia-cudnn-cu12>=9,<10"
    2. Update the NVIDIA driver (GeForce Experience / nvidia.com/drivers); CUDA 12 needs driver 525+
    3. Check the card shows up: nvidia-smi
  Or run on CPU (hours instead of minutes) with --cpu"""


def load_model(model_name, precision, use_cpu):
    """Load Whisper on the GPU and prove CUDA really works before any long job starts."""
    import numpy as np

    add_nvidia_dlls()
    import ctranslate2
    from faster_whisper import WhisperModel

    if use_cpu:
        device, precision = "cpu", precision or "float32"
    else:
        if ctranslate2.get_cuda_device_count() == 0:
            sys.exit("No CUDA GPU found by ctranslate2.\n" + GPU_HELP)
        device, precision = "cuda", precision or "float16"
    print(f"loading {model_name} on {device} ({precision}) ...", flush=True)
    try:
        model = WhisperModel(model_name, device=device, compute_type=precision)
        # the CUDA libraries load lazily on the first encode, so run one now
        noise = np.random.default_rng(0).normal(0, 0.01, 16000 * 2).astype(np.float32)
        list(model.transcribe(noise, language="th", vad_filter=False)[0])
    except RuntimeError as err:
        if device == "cuda":
            sys.exit(f"GPU failed: {err}\n" + GPU_HELP)
        raise
    print(f"{device} OK", flush=True)
    return model


REPEAT = re.compile(r"(.{2,40}?)(?:\s*\1){3,}")


def collapse_repeats(text):
    """'สวัสดีครับ สวัสดีครับ สวัสดีครับ ...' (a Whisper loop on silence) -> one copy."""
    return REPEAT.sub(r"\1", text)


def transcribe(model, video, language, prompt, beam, batch, sequential):
    """Default: cut the audio at the teacher's pauses (VAD, very lenient so quiet speech
    stays in), then decode the pieces in GPU batches. The Thai model gives no timestamps
    of its own, so plain decoding would cut every 30 s even mid-word."""
    from faster_whisper import BatchedInferencePipeline

    options = dict(language=language, beam_size=beam, initial_prompt=prompt or None)
    audio = load_audio(video)
    if sequential:
        segments, _ = model.transcribe(audio, best_of=beam, vad_filter=False,
                                       condition_on_previous_text=False, **options)
    else:
        segments, _ = BatchedInferencePipeline(model).transcribe(
            audio, batch_size=batch, vad_filter=True,
            vad_parameters={"threshold": 0.25, "min_silence_duration_ms": 300, "speech_pad_ms": 400},
            **options,
        )
    result = []
    for seg in segments:
        raw = seg.text.strip()
        text = collapse_repeats(raw)
        if not text:
            continue
        # low confidence or looping text: keep it, but flag for checking
        unsure = text != raw or seg.avg_logprob < -1.0 or seg.compression_ratio > 2.4
        result.append((seg.start, seg.end, text, unsure, round(seg.avg_logprob, 3)))
        print(f"  [{ts(seg.start)}]{' [?]' if unsure else ''} {text}", flush=True)
    return result


def write_transcript(out_dir, segments):
    with open(out_dir / "transcript.srt", "w", encoding="utf-8") as f:
        for i, (start, end, text, *_) in enumerate(segments, 1):
            f.write(f"{i}\n{srt_ts(start)} --> {srt_ts(end)}\n{text}\n\n")
    with open(out_dir / "transcript.txt", "w", encoding="utf-8") as f:
        for start, _, text, unsure, _ in segments:
            f.write(f"[{ts(start)}]{' [?]' if unsure else ''} {text}\n")
    # per-segment confidence, to tune the [?] threshold later
    with open(out_dir / "segments.tsv", "w", encoding="utf-8") as f:
        f.write("start\tend\tavg_logprob\tunsure\ttext\n")
        for start, end, text, unsure, logprob in segments:
            f.write(f"{start:.2f}\t{end:.2f}\t{logprob}\t{int(unsure)}\t{text}\n")


def write_notes(out_dir, title, frames, segments):
    """Pair each frame with the speech that follows it, up to the next frame."""
    lines = [f"# {title}", ""]
    if segments:
        lines += ["_[?] = ช่วงที่ระบบถอดเสียงไม่มั่นใจ ควรเทียบกับวิดีโอ_", ""]
    else:
        lines += ["_No transcript (run without --frames-only to add one)._", ""]
    bounds = [t for t, _ in frames[1:]] + [float("inf")]
    for (t, path), until in zip(frames, bounds):
        rel = path.relative_to(out_dir).as_posix()
        lines.append(f"## [{ts(t)}]")
        lines.append(f"![{ts(t)}]({rel.replace(' ', '%20')})")
        lines.append("")
        said = [("[?] " if unsure else "") + text
                for start, _, text, unsure, _ in segments if t <= start < until]
        if said:
            lines.append(" ".join(said))
            lines.append("")
    (out_dir / "notes.md").write_text("\n".join(lines), encoding="utf-8")


def thai_model_ready():
    return all((THAI_MODEL / f).exists()
               for f in ("model.bin", "preprocessor_config.json", "tokenizer.json"))


def main():
    # Windows writes piped output (e.g. `| tee log.txt`) as cp1252, which has no Thai
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("videos", nargs="*", type=Path, help="default: every video in MGT520/videos")
    ap.add_argument("--out", type=Path, default=ROOT / "extracted")
    ap.add_argument("--model", default="auto",
                    help="auto (Thai model if built, else large-v3), thai, or large-v3")
    ap.add_argument("--precision", default=None,
                    help="compute type; default float16 on GPU, float32 on CPU")
    ap.add_argument("--beam", type=int, default=10, help="beam size; higher = slower, slightly more accurate")
    ap.add_argument("--cpu", action="store_true", help="run on CPU instead of the GPU (much slower)")
    ap.add_argument("--check-gpu", action="store_true", help="only test that the GPU works, then exit")
    ap.add_argument("--language", default="th")
    ap.add_argument("--prompt", help="extra terms to help Whisper spell names/jargon")
    ap.add_argument("--no-prompt", action="store_true",
                    help="don't feed slide vocabulary to Whisper (default for --model thai)")
    ap.add_argument("--batch", type=int, default=8, help="pieces decoded at once on the GPU; lower if out of memory")
    ap.add_argument("--sequential", action="store_true",
                    help="decode the whole audio in fixed 30 s windows instead of cutting at pauses")
    ap.add_argument("--scene", type=float, default=0.1, help="slide-change sensitivity, lower = more frames")
    ap.add_argument("--min-gap", type=float, default=3, help="min seconds between slide-change frames")
    ap.add_argument("--settle", type=float, default=1.5, help="seconds after a change to grab the frame")
    ap.add_argument("--interval", type=float, default=30, help="max seconds between frames")
    ap.add_argument("--width", type=int, default=0, help="max frame width in px (0 = original)")
    ap.add_argument("--frames-only", action="store_true")
    args = ap.parse_args()

    auto_prompt = not args.no_prompt
    if args.model == "auto":
        if thai_model_ready():
            args.model = "thai"
        else:
            args.model = "large-v3"
            print("note: Thai model not built, using large-v3. For better Thai run once:\n"
                  "  pip install transformers torch && python MGT520/tools/convert_thai_model.py")
    if args.model == "thai":
        if not thai_model_ready():
            sys.exit("Thai model not built (or incomplete). Run once:\n"
                     "  pip install transformers torch\n"
                     "  python MGT520/tools/convert_thai_model.py")
        args.model = str(THAI_MODEL)
        # fine-tuned without prompts; a prompt tends to make it skip or repeat text
        auto_prompt = False

    model = None
    if not args.frames_only or args.check_gpu:
        model = load_model(args.model, args.precision, args.cpu)
    if args.check_gpu:
        return

    videos = args.videos or sorted(
        p for p in (ROOT / "videos").iterdir() if p.suffix.lower() in VIDEO_EXTS
    )
    failed = []
    for video in videos:
        if video.stat().st_size < 1024:
            print(f"skip {video.name}: only a Git LFS pointer, copy the real video here first")
            continue
        out_dir = args.out / video.stem
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "error.txt").unlink(missing_ok=True)
        print(f"== {video.name}")
        try:
            process_video(video, out_dir, args, model, auto_prompt)
        except (Exception, SystemExit):
            # keep going with the other videos; the traceback is saved next to the output
            err = traceback.format_exc()
            (out_dir / "error.txt").write_text(err, encoding="utf-8")
            print(f"  FAILED, see {out_dir / 'error.txt'}\n{err}", flush=True)
            failed.append(video.name)
    if failed:
        sys.exit(f"{len(failed)} video(s) failed: {', '.join(failed)}")


def process_video(video, out_dir, args, model, auto_prompt):
    frames = extract_frames(video, out_dir, args.scene, args.interval,
                            args.min_gap, args.settle, args.width)
    print(f"  {len(frames)} frames")
    segments = []
    if not args.frames_only:
        topic = re.sub(r"^\d+-|\s*ep\d+$", "", video.stem)
        parts = [f"วิชา MGT520 เรื่อง{topic}", *slide_vocabulary(video)] if auto_prompt else []
        prompt = ", ".join(parts + ([args.prompt] if args.prompt else []))
        if prompt:
            print(f"  prompt: {prompt[:120]}...")
        segments = transcribe(model, video, args.language, prompt,
                              args.beam, args.batch, args.sequential)
        write_transcript(out_dir, segments)
        flagged = sum(s[3] for s in segments)
        print(f"  {len(segments)} segments, {flagged} marked [?]")
    write_notes(out_dir, video.stem, frames, segments)
    print(f"  -> {out_dir}")

if __name__ == "__main__":
    main()
