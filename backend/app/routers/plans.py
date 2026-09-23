from fastapi import APIRouter, UploadFile, File, HTTPException
from app.mock import load_mock
from app.services import csv_parser, validator
from app import config

router = APIRouter()

@router.post("/plans")
def create_plan():
    return load_mock("plan")

@router.post("/plans/{plan_id}/csv")
def import_csv(plan_id: str, file: UploadFile = File(...)):
    # USE_MOCKがtrueなら今まで通りダミーを返す（保険）
    if config.USE_MOCK:
        return load_mock("import")

    # ① CSVを読む
    df = csv_parser.read_csv_file(file.file.read())

    # ② 列名を対応づける
    mapping = csv_parser.detect_columns(list(df.columns))
    if "name" not in mapping.values() or "address" not in mapping.values():
        raise HTTPException(400, "氏名または住所の列が見つかりませんでした")

    # ③ 1人ずつのデータにして、問題を調べる
    records = csv_parser.to_records(df, mapping)
    records = validator.validate(records)

    # 画面に返す集計
    needs_check = [r for r in records if len(r["issues"]) > 0]
    return {
        "total": len(records),
        "ok_count": len(records) - len(needs_check),
        "needs_check_count": len(needs_check),
        "column_mapping": mapping,
        "records": records,
    }

@router.post("/plans/{plan_id}/stops/generate")
def generate_stops(plan_id: str):
    return load_mock("stops")

@router.post("/plans/{plan_id}/routes/generate")
def generate_routes(plan_id: str):
    return load_mock("routes")

@router.post("/plans/{plan_id}/notice")
def generate_notice(plan_id: str):
    return load_mock("notice")
