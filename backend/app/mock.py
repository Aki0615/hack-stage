import json
from pathlib import Path
# backend/app/mock.py からみて、二つ上のhack-stage/shared/mockを指す
MOCK_DIR = Path(__file__).parent.parent.parent / "shared" / "mock"

def load_mock(name: str):
    """shared/mock/名前.json を読み込んで返す"""
    with open(MOCK_DIR / f"{name}.json",encoding="utf-8") as f:
        return json.load(f)