"""One-off: download Thonburian Whisper (Whisper large-v3 fine-tuned on Thai speech)
and convert it into the format faster-whisper runs.

  pip install transformers torch
  python MGT520/tools/convert_thai_model.py

Writes MGT520/models/whisper-th-large-v3-ct2/ (about 3 GB, git-ignored). Then use it with
  python MGT520/tools/extract_video.py --model thai
"""

import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # MGT520/
REPO = "biodatlab/whisper-th-large-v3-combined"
OUT = ROOT / "models" / "whisper-th-large-v3-ct2"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--repo", default=REPO, help="Hugging Face model to convert")
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()

    from ctranslate2.converters import TransformersConverter
    from transformers import WhisperProcessor

    if args.out.exists():
        shutil.rmtree(args.out)
    print(f"downloading and converting {args.repo} (several GB, takes a while) ...", flush=True)
    TransformersConverter(args.repo, load_as_float16=True).convert(
        str(args.out), quantization="float16"
    )
    # faster-whisper needs these next to model.bin: large-v3 uses 128 mel bins,
    # and without preprocessor_config.json it would assume 80 and output garbage
    WhisperProcessor.from_pretrained(args.repo).save_pretrained(str(args.out))
    for needed in ("model.bin", "preprocessor_config.json", "tokenizer.json"):
        if not (args.out / needed).exists():
            raise SystemExit(f"conversion incomplete: {needed} missing in {args.out}")
    print(f"done -> {args.out}\nnow run: python MGT520/tools/extract_video.py --model thai")


if __name__ == "__main__":
    main()
