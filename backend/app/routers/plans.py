from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.db import supabase
from app.services import csv_parser, validator, geocoding

router = APIRouter()

# 学校の名前と位置（画面から送られてこないときに使う）
SCHOOL_NAME = "さくら小学校"
SCHOOL_LAT = 35.1709
SCHOOL_LNG = 136.8815

class PlanCreate(BaseModel):
    bus_count: int
    bus_capacity: int
    school_name: str = SCHOOL_NAME
    school_lat: float = SCHOOL_LAT
    school_lng: float = SCHOOL_LNG

# 新規計画作成：バスの条件と学校の位置を保存して、idを返す
@router.post("/plans")
def create_plan(body: PlanCreate):
    if body.bus_count < 1 or body.bus_capacity < 1:
        raise HTTPException(400, "バスの台数と定員は1以上にしてください")
    saved = supabase.table("plans").insert(body.model_dump()).execute().data[0]
    return {"id": saved["id"]}

# CSVインポート・Geocoding処理
@router.post("/plans/{plan_id}/csv")
def import_csv(plan_id: str, file: UploadFile = File(...)):

    df = csv_parser.read_csv_file(file.file.read(), file.filename or "")
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
