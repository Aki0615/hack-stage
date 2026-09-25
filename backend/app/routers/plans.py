from fastapi import APIRouter, UploadFile, File, HTTPException
from app.db import supabase
from app.services import csv_parser, validator, geocoding
from app.mock import load_mock

router = APIRouter()

# 新規計画作成（モック）
@router.post("/plans")
def create_plan():
    return load_mock("plan")

# CSVインポート・Geocoding処理
@router.post("/plans/{plan_id}/csv")
def import_csv(plan_id: str, file: UploadFile = File(...)):

    df = csv_parser.read_csv_file(file.file.read())
    mapping = csv_parser.detect_columns(list(df.columns))
    if "name" not in mapping.values() or "address" not in mapping.values():
        raise HTTPException(400, "氏名または住所の列が見つかりませんでした")
    records = csv_parser.to_records(df, mapping)
    records = validator.validate(records)
    records = geocoding.geocode_all(records)

    supabase.table("students").delete().eq("plan_id", plan_id).execute()
    rows = []
    for r in records:
        rows.append({
            "plan_id": plan_id, "name": r["name"], "grade": r["grade"],
            "address": r["address"], "use_morning": r["use_morning"],
            "use_evening": r["use_evening"], "note": r["note"],
            "lat": r["lat"], "lng": r["lng"], "geocode_status": r["status"],
        })
    supabase.table("students").insert(rows).execute()


    needs_check = [r for r in records if len(r["issues"]) > 0]
    return {
        "total": len(records),
        "ok_count": len(records) - len(needs_check),
        "needs_check_count": len(needs_check),
        "column_mapping": mapping,
        "records": records,
    }
