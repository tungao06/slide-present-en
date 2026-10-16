"""One-off: download Thonburian Whisper (Whisper large-v3 fine-tuned on Thai speech)
and convert it into the format faster-whisper runs.

  pip install transformers torch
  python MGT520/tools/convert_thai_model.py

Writes MGT520/models/whisper-th-large-v3-ct2/ (about 3 GB, git-ignored). Then use it with
  python MGT520/tools/extract_video.py --model thai
"""

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # MGT520/
REPO = "biodatlab/whisper-th-large-v3-combined"
OUT = ROOT / "models" / "whisper-th-large-v3-ct2"
NEEDED = ("model.bin", "preprocessor_config.json", "tokenizer.json")


def main():
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--repo", default=REPO, help="Hugging Face model to convert")
    ap.add_argument("--out", type=Path, default=OUT)
    ap.add_argument("--force", action="store_true", help="convert again even if model.bin exists")
    args = ap.parse_args()

    from huggingface_hub import hf_hub_download

    if args.force or not (args.out / "model.bin").exists():
        from ctranslate2.converters import TransformersConverter

        if args.out.exists():
            shutil.rmtree(args.out)
        print(f"downloading and converting {args.repo} (several GB, takes a while) ...", flush=True)
        TransformersConverter(args.repo, load_as_float16=True).convert(
            str(args.out), quantization="float16"
        )
    else:
        print(f"model.bin already in {args.out}, only checking the side files")

    # faster-whisper reads these next to model.bin: large-v3 uses 128 mel bins, and
    # without preprocessor_config.json it assumes 80. Copy the repo's own files
    # (transformers' save_pretrained renames them in newer versions).
    for name in ("preprocessor_config.json", "tokenizer.json"):
        shutil.copyfile(hf_hub_download(args.repo, name), args.out / name)
    missing = [n for n in NEEDED if not (args.out / n).exists()]
    if missing:
        raise SystemExit(f"conversion incomplete: {', '.join(missing)} missing in {args.out}")
    print(f"done -> {args.out}\nnow run: python MGT520/tools/extract_video.py")


if __name__ == "__main__":
    main()
