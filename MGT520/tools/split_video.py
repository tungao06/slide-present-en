"""Split every .mp4 in a folder into halves, and halves of halves, until each piece
is smaller than --max-mb (default 20 MB).

Pieces are cut without re-encoding (fast, no quality loss). Cuts land on the nearest
keyframe, so neighbouring pieces can overlap by a second or two, but nothing is lost.

  python MGT520/tools/split_video.py                          # MGT520/videos -> MGT520/videos_split
  python MGT520/tools/split_video.py "D:/some/folder" --max-mb 50
  python MGT520/tools/split_video.py --out "D:/split" --recursive
  python MGT520/tools/split_video.py "D:/folder/one video.mp4"   # just one file

Output: <out>/<video name>/<video name> part 01 (00-00-00).mp4, numbered in time order.
Needs ffmpeg/ffprobe on PATH.
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # MGT520/
MIN_PIECE_S = 2  # never cut finer than this; a piece this short that is still too big is kept


def ts(seconds, sep="-"):
    s = int(seconds)
    return f"{s // 3600:02d}{sep}{s % 3600 // 60:02d}{sep}{s % 60:02d}"


def run(cmd):
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if proc.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd[:3])} ... failed:\n{proc.stderr[-1500:]}")
    return proc.stdout


def duration(video):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "csv=p=0", str(video)]).strip())


def retry(action, what, tries=10):
    """Cloud-synced folders (iCloud, OneDrive) briefly lock files they are uploading."""
    for attempt in range(tries):
        try:
            return action()
        except PermissionError:
            if attempt == tries - 1:
                raise
            print(f"  {what} is locked (cloud sync?), retrying ...", flush=True)
            time.sleep(min(2 ** attempt, 15))


def cut(video, start, length, dest):
    run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", f"{start:.3f}", "-i", str(video),
         "-t", f"{length:.3f}", "-map", "0", "-c", "copy", "-avoid_negative_ts", "make_zero",
         str(dest)])


def split(video, start, length, limit, bytes_per_s, work, pieces):
    """Halve [start, start+length) until a cut of it fits under `limit` bytes.
    Pieces are appended in time order."""
    # don't write a piece that is clearly too big; just halve it
    if length * bytes_per_s < limit * 0.95 or length <= MIN_PIECE_S:
        tmp = work / f"tmp_{len(pieces):04d}_{start:.0f}.mp4"
        cut(video, start, length, tmp)
        if tmp.stat().st_size < limit or length <= MIN_PIECE_S:
            if tmp.stat().st_size >= limit:
                print(f"  warning: {ts(start, ':')} is {tmp.stat().st_size / 1e6:.1f} MB "
                      f"but can't be cut shorter than {MIN_PIECE_S}s", flush=True)
            pieces.append((start, tmp))
            return
        tmp.unlink()
    half = length / 2
    split(video, start, half, limit, bytes_per_s, work, pieces)
    split(video, start + half, length - half, limit, bytes_per_s, work, pieces)


def process(video, out_root, limit):
    size = video.stat().st_size
    if size < 1024:
        print(f"skip {video.name}: only a Git LFS pointer, not the real video")
        return
    if size < limit:
        print(f"skip {video.name}: already {size / 1e6:.1f} MB")
        return
    total = duration(video)
    out_dir = out_root / video.stem
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.mp4"):
        retry(old.unlink, old.name)
    print(f"== {video.name} ({size / 1e6:.0f} MB, {ts(total, ':')})", flush=True)

    # cut in a local temp folder: the output may be in iCloud/OneDrive, which locks
    # each new file while uploading it and would block the trial cuts
    with tempfile.TemporaryDirectory(prefix="split_video_") as work:
        pieces = []
        split(video, 0.0, total, limit, size / total, Path(work), pieces)
        width = max(2, len(str(len(pieces))))
        for i, (start, tmp) in enumerate(pieces, 1):
            final = out_dir / f"{video.stem} part {i:0{width}d} ({ts(start)}).mp4"
            retry(lambda: shutil.move(str(tmp), str(final)), final.name)
            print(f"  {final.name}  {final.stat().st_size / 1e6:.1f} MB", flush=True)
    print(f"  {len(pieces)} pieces -> {out_dir}")


def main():
    # Windows writes piped output as cp1252, which has no Thai
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", nargs="?", type=Path, default=ROOT / "videos", help="folder to scan, or a single .mp4")
    ap.add_argument("--max-mb", type=float, default=20, help="each piece must be smaller than this")
    ap.add_argument("--out", type=Path, default=ROOT / "videos_split", help="where the pieces go")
    ap.add_argument("--recursive", action="store_true", help="also scan sub-folders")
    args = ap.parse_args()

    out_root = args.out.resolve()
    if args.folder.is_file():
        videos = [args.folder]
    elif args.folder.is_dir():
        pattern = "**/*" if args.recursive else "*"
        videos = sorted(p for p in args.folder.glob(pattern)
                        if p.is_file() and p.suffix.lower() == ".mp4"
                        and out_root not in p.resolve().parents)
    else:
        sys.exit(f"not found: {args.folder}")
    if not videos:
        sys.exit(f"no .mp4 files in {args.folder}")

    limit = int(args.max_mb * 1_000_000)
    failed = []
    for video in videos:
        try:
            process(video, out_root, limit)
        except Exception as err:
            print(f"  FAILED {video.name}: {err}", flush=True)
            failed.append(video.name)
    if failed:
        sys.exit(f"{len(failed)} video(s) failed: {', '.join(failed)}")


if __name__ == "__main__":
    main()
