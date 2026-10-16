"""Rename every file inside a folder (and its sub-folders) to
"<folder name><sep><original name>".

  python MGT520/tools/prefix_rename.py "D:/VDO/split"              # split/a.mp4 -> split/split_a.mp4
  python MGT520/tools/prefix_rename.py "D:/VDO/split" --parent     # use each file's own folder name
  python MGT520/tools/prefix_rename.py "D:/VDO/split" --sep " - "  # split - a.mp4
  python MGT520/tools/prefix_rename.py "D:/VDO/split" --dry-run    # only show what would change
  python MGT520/tools/prefix_rename.py "D:/VDO/split" --undo       # put the old names back

Files that already start with the prefix are left alone, so running it twice is safe.
Every rename is recorded in <folder>/rename_log.tsv, which --undo reads.
"""

import argparse
import sys
import time
from pathlib import Path

LOG_NAME = "rename_log.tsv"
SKIP = {LOG_NAME, "desktop.ini", "thumbs.db", ".ds_store"}


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


def plan(root, sep, per_parent):
    moves = []
    for path in sorted(p for p in root.rglob("*") if p.is_file()):
        if path.name.lower() in SKIP or path.name.startswith("."):
            continue
        prefix = (path.parent if per_parent else root).name + sep
        if path.name.startswith(prefix):
            continue
        moves.append((path, path.with_name(prefix + path.name)))
    return moves


def apply(moves, root, dry_run, log_mode="a"):
    clashes = [new for _, new in moves if new.exists()]
    if clashes:
        sys.exit("these names already exist, nothing was renamed:\n  " +
                 "\n  ".join(str(c.relative_to(root)) for c in clashes))
    for old, new in moves:
        print(f"  {old.relative_to(root)}  ->  {new.name}", flush=True)
    if dry_run:
        print(f"{len(moves)} file(s) would be renamed (dry run, nothing changed)")
        return
    done = 0
    with open(root / LOG_NAME, log_mode, encoding="utf-8") as log:
        for old, new in moves:
            retry(lambda: old.rename(new), old.name)
            log.write(f"{old.relative_to(root)}\t{new.relative_to(root)}\n")
            log.flush()
            done += 1
    print(f"{done} file(s) renamed, log: {root / LOG_NAME}")


def undo(root, dry_run):
    log = root / LOG_NAME
    if not log.exists():
        sys.exit(f"no {LOG_NAME} in {root}, nothing to undo")
    lines = [l.rstrip("\n").split("\t") for l in log.read_text(encoding="utf-8").splitlines() if l]
    moves = [(root / new, root / old) for old, new in reversed(lines) if (root / new).exists()]
    for cur, back in moves:
        print(f"  {cur.relative_to(root)}  ->  {back.name}", flush=True)
    if dry_run:
        print(f"{len(moves)} file(s) would be restored (dry run, nothing changed)")
        return
    for cur, back in moves:
        if back.exists():
            sys.exit(f"stopped: {back} already exists")
        retry(lambda: cur.rename(back), cur.name)
    log.unlink()
    print(f"{len(moves)} file(s) restored")


def main():
    # Windows writes piped output as cp1252, which has no Thai
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", type=Path)
    ap.add_argument("--sep", default="_", help="text between the folder name and the old name (default _)")
    ap.add_argument("--parent", action="store_true",
                    help="prefix with each file's own folder instead of the top folder")
    ap.add_argument("--dry-run", action="store_true", help="show the new names without renaming")
    ap.add_argument("--undo", action="store_true", help="restore the names recorded in rename_log.tsv")
    args = ap.parse_args()

    root = args.folder.resolve()
    if not root.is_dir():
        sys.exit(f"not a folder: {args.folder}")
    if args.undo:
        undo(root, args.dry_run)
        return
    moves = plan(root, args.sep, args.parent)
    if not moves:
        print("nothing to rename (all files already have the prefix)")
        return
    apply(moves, root, args.dry_run)


if __name__ == "__main__":
    main()
