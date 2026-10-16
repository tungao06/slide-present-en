"""Turn class videos into slide frames + a timestamped Thai transcript.

For each video it writes MGT520/extracted/<video name>/:
  frames/NNNN_HH-MM-SS.jpg  a frame on every slide change (and at least every --interval s)
  transcript.srt            subtitles with timestamps
  transcript.txt            plain text, one line per segment, with [HH:MM:SS]
  notes.md                  each frame followed by what was said until the next frame
                            (the file to hand to Claude / another AI for summarising)

Usage:
  pip install faster-whisper
  python MGT520/tools/extract_video.py                      # all videos in MGT520/videos
  python MGT520/tools/extract_video.py "MGT520/videos/03-ภาวะผู้นำ ep1.mp4"
  python MGT520/tools/extract_video.py --model small        # faster, less accurate
  python MGT520/tools/extract_video.py --frames-only        # skip transcription

Needs ffmpeg on PATH (Windows: `winget install Gyan.FFmpeg`).
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # MGT520/
VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".m4v", ".webm"}


def ts(seconds, sep=":"):
    s = int(seconds)
    return f"{s // 3600:02d}{sep}{s % 3600 // 60:02d}{sep}{s % 60:02d}"


def srt_ts(seconds):
    ms = int(round(seconds * 1000))
    return f"{ms // 3600000:02d}:{ms % 3600000 // 60000:02d}:{ms % 60000 // 1000:02d},{ms % 1000:03d}"


def extract_frames(video, out_dir, scene, interval, min_gap, width):
    """Grab a frame on each scene change (at most one per `min_gap` s),
    or once `interval` seconds pass without one."""
    frames_dir = out_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for old in frames_dir.glob("*.jpg"):
        old.unlink()
    select = (
        f"select='isnan(prev_selected_t)"
        f"+gt(scene\\,{scene})*gte(t-prev_selected_t\\,{min_gap})"
        f"+gte(t-prev_selected_t\\,{interval})'"
    )
    vf = f"{select},scale='min({width},iw)':-2,showinfo"
    cmd = [
        "ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(video),
        "-vf", vf, "-fps_mode", "vfr", "-q:v", "3",
        str(frames_dir / "tmp_%05d.jpg"),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if proc.returncode != 0:
        sys.exit(f"ffmpeg failed on {video}:\n{proc.stderr[-2000:]}")
    times = [float(t) for t in re.findall(r"pts_time:([\d.]+)", proc.stderr)]
    tmp = sorted(frames_dir.glob("tmp_*.jpg"))
    frames = []
    for i, (path, t) in enumerate(zip(tmp, times), 1):
        final = frames_dir / f"{i:04d}_{ts(t, '-')}.jpg"
        path.rename(final)
        frames.append((t, final))
    return frames


def transcribe(video, model_name, language):
    from faster_whisper import WhisperModel

    model = WhisperModel(model_name, device="auto", compute_type="int8")
    segments, info = model.transcribe(
        str(video), language=language, vad_filter=True, beam_size=5
    )
    result = []
    for seg in segments:
        text = seg.text.strip()
        if text:
            result.append((seg.start, seg.end, text))
            print(f"  [{ts(seg.start)}] {text}", flush=True)
    return result


def write_transcript(out_dir, segments):
    with open(out_dir / "transcript.srt", "w", encoding="utf-8") as f:
        for i, (start, end, text) in enumerate(segments, 1):
            f.write(f"{i}\n{srt_ts(start)} --> {srt_ts(end)}\n{text}\n\n")
    with open(out_dir / "transcript.txt", "w", encoding="utf-8") as f:
        for start, _, text in segments:
            f.write(f"[{ts(start)}] {text}\n")


def write_notes(out_dir, title, frames, segments):
    """Pair each frame with the speech that follows it, up to the next frame."""
    lines = [f"# {title}", ""]
    if not segments:
        lines.append("_No transcript (run without --frames-only to add one)._\n")
    bounds = [t for t, _ in frames[1:]] + [float("inf")]
    for (t, path), until in zip(frames, bounds):
        rel = path.relative_to(out_dir).as_posix()
        lines.append(f"## [{ts(t)}]")
        lines.append(f"![{ts(t)}]({rel.replace(' ', '%20')})")
        lines.append("")
        said = [text for start, _, text in segments if t <= start < until]
        if said:
            lines.append(" ".join(said))
            lines.append("")
    (out_dir / "notes.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("videos", nargs="*", type=Path, help="default: every video in MGT520/videos")
    ap.add_argument("--out", type=Path, default=ROOT / "extracted")
    ap.add_argument("--model", default="large-v3", help="whisper model: tiny/base/small/medium/large-v3")
    ap.add_argument("--language", default="th")
    ap.add_argument("--scene", type=float, default=0.1, help="slide-change sensitivity, lower = more frames")
    ap.add_argument("--min-gap", type=float, default=3, help="min seconds between slide-change frames")
    ap.add_argument("--interval", type=float, default=60, help="max seconds between frames")
    ap.add_argument("--width", type=int, default=1280, help="max frame width in px")
    ap.add_argument("--frames-only", action="store_true")
    args = ap.parse_args()

    videos = args.videos or sorted(
        p for p in (ROOT / "videos").iterdir() if p.suffix.lower() in VIDEO_EXTS
    )
    for video in videos:
        if video.stat().st_size < 1024:
            print(f"skip {video.name}: only a Git LFS pointer, run `git lfs pull` first")
            continue
        out_dir = args.out / video.stem
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"== {video.name}")
        frames = extract_frames(video, out_dir, args.scene, args.interval, args.min_gap, args.width)
        print(f"  {len(frames)} frames")
        segments = []
        if not args.frames_only:
            segments = transcribe(video, args.model, args.language)
            write_transcript(out_dir, segments)
        write_notes(out_dir, video.stem, frames, segments)
        print(f"  -> {out_dir}")


if __name__ == "__main__":
    main()
