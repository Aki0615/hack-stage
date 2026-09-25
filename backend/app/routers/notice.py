from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.services import notice

router = APIRouter()

@router.post("/plans/{plan_id}/notice")
def generate_notice(plan_id: str):
    # 1. 児童データの取得（okの人のみ）
    students = supabase.table("students").select("*").eq("plan_id", plan_id).eq("geocode_status", "ok").execute().data
    if not students:
        raise HTTPException(400, "地図上で確認できた児童がいません")

    # 2. ルート案（efficiency）のデータを取得
    route_data = supabase.table("route_plans").select("*").eq("plan_id", plan_id).eq("strategy", "efficiency").execute().data
    if not route_data:
        raise HTTPException(400, "先にルート案（/routes/generate）を生成してください")

    route_plan = route_data[0]["data"]
    stops = route_plan.get("stops", [])

    # 3. 全員分の案内文を生成
    results = notice.create_all_notices(students, stops, route_plan)
    return results
