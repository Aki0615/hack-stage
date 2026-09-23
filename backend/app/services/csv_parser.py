import io
import pandas as pd

COLUMN_ALIASES = {
    "name":        ["氏名", "名前", "児童氏名", "生徒名", "児童・生徒名"],
    "grade":       ["学年"],
    "address":     ["住所", "自宅住所", "居住地", "ご住所"],
    "use_morning": ["登校", "朝バス", "登校利用"],
    "use_evening": ["下校", "帰りバス", "下校利用"],
    "note":        ["備考", "メモ", "希望の停留所・備考"],
}

def read_csv_file(raw: bytes) -> pd.DataFrame:
    try:
        df = pd.read_csv(io.BytesIO(raw), encoding="utf-8-sig", dtype=str)
    except UnicodeDecodeError:
        df = pd.read_csv(io.BytesIO(raw), encoding="cp932", dtype=str)
    df = df.dropna(how="all")
    df = df.fillna("")
    return df

def detect_columns(columns: list[str]) -> dict:
    mapping = {}
    for col in columns:
        for key, aliases in COLUMN_ALIASES.items():
            if col.strip() in aliases:
                mapping[col] = key
    return mapping

def to_bool(value: str):
    if value in ["利用する", "はい", "○"]:
        return True
    if value in ["利用しない", "いいえ", "×"]:
        return False
    return None

def to_records(df: pd.DataFrame, mapping: dict) -> list[dict]:
    df = df.rename(columns=mapping)
    records = []
    row_number = 2
    for row in df.to_dict("records"):
        records.append({
            "row": row_number,
            "name": row.get("name", "").strip(),
            "grade": row.get("grade", "").strip(),
            "address": row.get("address", "").strip(),
            "use_morning": to_bool(row.get("use_morning", "").strip()),
            "use_evening": to_bool(row.get("use_evening", "").strip()),
            "note": row.get("note", "").strip(),
        })
        row_number += 1
    return records
