"""A zene/ mappában lévő hangfájlokból elkészíti a tracks.json listát."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTS = {".mp3", ".m4a", ".ogg", ".wav", ".flac", ".aac"}

files = sorted(
    p.relative_to(ROOT).as_posix()
    for p in (ROOT / "zene").rglob("*")
    if p.is_file() and p.suffix.lower() in EXTS
)
(ROOT / "tracks.json").write_text(json.dumps(files, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(files)} szám a tracks.json-ben")
