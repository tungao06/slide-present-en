"""Turn class videos into slide frames + a timestamped Thai transcript.

Tuned for accuracy over speed. For each video it writes MGT520/extracted/<video name>/:
  frames/NNNN_HH-MM-SS.jpg  one full-resolution frame per slide, grabbed after the
                            slide has settled (not mid-transition); at least one per --interval s
  transcript.srt            subtitles with timestamps
  transcript.txt            one line per segment, [HH:MM:SS]; lines Whisper is unsure of
                            are marked [?] so they can be checked against the video
  notes.md                  each frame followed by what was said until the next frame
                            (the file to hand to Claude / another AI for summarising)

Usage:
  pip install faster-whisper pypdf
  python MGT520/tools/extract_video.py                      # all videos in MGT520/videos
  python MGT520/tools/extract_video.py "MGT520/videos/03-ภาวะผู้นำ ep1.mp4"
  python MGT520/tools/extract_video.py --fast               # much faster, a bit less accurate
  python MGT520/tools/extract_video.py --frames-only        # skip transcription

Needs ffmpeg on PATH (Windows: `winget install Gyan.FFmpeg`).
"""

import argparse
import os
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # MGT520/
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


def transcribe(video, model_name, language, precision, prompt):
    audio = load_audio(video)
    try:
        return _transcribe(audio, model_name, language, "auto", precision, prompt)
    except RuntimeError as err:
        if not re.search(r"cublas|cudnn|cuda", str(err), re.I):
            raise
        print(f"  GPU unavailable ({err}).\n"
              "  Falling back to CPU, which is much slower. To use the GPU:\n"
              "    pip install nvidia-cublas-cu12 nvidia-cudnn-cu12", flush=True)
        cpu_precision = "int8" if precision == "int8" else "float32"
        return _transcribe(audio, model_name, language, "cpu", cpu_precision, prompt)


def _transcribe(audio, model_name, language, device, precision, prompt):
    add_nvidia_dlls()
    from faster_whisper import WhisperModel

    model = WhisperModel(model_name, device=device, compute_type=precision)
    segments, _ = model.transcribe(
        audio,
        language=language,
        beam_size=5,
        best_of=5,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
        initial_prompt=prompt or None,
        # stops one misheard line from snowballing into repeated garbage
        condition_on_previous_text=False,
    )
    result = []
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        unsure = seg.avg_logprob < -0.8 or seg.compression_ratio > 2.4
        result.append((seg.start, seg.end, text, unsure))
        print(f"  [{ts(seg.start)}]{' [?]' if unsure else ''} {text}", flush=True)
    return result


def write_transcript(out_dir, segments):
    with open(out_dir / "transcript.srt", "w", encoding="utf-8") as f:
        for i, (start, end, text, _) in enumerate(segments, 1):
            f.write(f"{i}\n{srt_ts(start)} --> {srt_ts(end)}\n{text}\n\n")
    with open(out_dir / "transcript.txt", "w", encoding="utf-8") as f:
        for start, _, text, unsure in segments:
            f.write(f"[{ts(start)}]{' [?]' if unsure else ''} {text}\n")


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
                for start, _, text, unsure in segments if t <= start < until]
        if said:
            lines.append(" ".join(said))
            lines.append("")
    (out_dir / "notes.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("videos", nargs="*", type=Path, help="default: every video in MGT520/videos")
    ap.add_argument("--out", type=Path, default=ROOT / "extracted")
    ap.add_argument("--model", default="large-v3", help="whisper model: small/medium/large-v3")
    ap.add_argument("--precision", default=None,
                    help="compute type; default float16 on GPU, float32 on CPU (most accurate)")
    ap.add_argument("--fast", action="store_true", help="int8 precision: ~2-3x faster on CPU")
    ap.add_argument("--language", default="th")
    ap.add_argument("--prompt", help="extra terms to help Whisper spell names/jargon")
    ap.add_argument("--scene", type=float, default=0.1, help="slide-change sensitivity, lower = more frames")
    ap.add_argument("--min-gap", type=float, default=3, help="min seconds between slide-change frames")
    ap.add_argument("--settle", type=float, default=1.5, help="seconds after a change to grab the frame")
    ap.add_argument("--interval", type=float, default=60, help="max seconds between frames")
    ap.add_argument("--width", type=int, default=0, help="max frame width in px (0 = original)")
    ap.add_argument("--frames-only", action="store_true")
    args = ap.parse_args()

    precision = args.precision
    if not precision:
        try:
            import ctranslate2
            gpu = ctranslate2.get_cuda_device_count() > 0
        except Exception:
            gpu = False
        precision = "int8" if args.fast else ("float16" if gpu else "float32")

    videos = args.videos or sorted(
        p for p in (ROOT / "videos").iterdir() if p.suffix.lower() in VIDEO_EXTS
    )
    for video in videos:
        if video.stat().st_size < 1024:
            print(f"skip {video.name}: only a Git LFS pointer, copy the real video here first")
            continue
        out_dir = args.out / video.stem
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"== {video.name}")
        frames = extract_frames(video, out_dir, args.scene, args.interval,
                                args.min_gap, args.settle, args.width)
        print(f"  {len(frames)} frames")
        segments = []
        if not args.frames_only:
            topic = re.sub(r"^\d+-|\s*ep\d+$", "", video.stem)
            terms = slide_vocabulary(video)
            prompt = ", ".join([f"วิชา MGT520 เรื่อง{topic}", *terms, *([args.prompt] if args.prompt else [])])
            print(f"  precision={precision}, prompt: {prompt[:120]}...")
            segments = transcribe(video, args.model, args.language, precision, prompt)
            write_transcript(out_dir, segments)
            flagged = sum(s[3] for s in segments)
            print(f"  {len(segments)} segments, {flagged} marked [?]")
        write_notes(out_dir, video.stem, frames, segments)
        print(f"  -> {out_dir}")


if __name__ == "__main__":
    main()
