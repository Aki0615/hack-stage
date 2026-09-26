from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import supabase
from app.services import notice

router = APIRouter()

class NoticeRequest(BaseModel):
    route_id: str | int | None = None   # 先生が選んだ案（なければ効率の案）

@router.post("/plans/{plan_id}/notice")
def generate_notice(plan_id: str, body: NoticeRequest | None = None):
    # 1. 先生が選んだルート案を取得する
    query = supabase.table("route_plans").select("*").eq("plan_id", plan_id)
    if body and body.route_id:
        query = query.eq("id", body.route_id)
    else:
        query = query.eq("strategy", "efficiency")
    route_data = query.execute().data
    if not route_data:
        raise HTTPException(400, "先にルート案（/routes/generate）を生成してください")

    # 2. 保護者の皆さまへ送る案内文を1つ作る（差出人は計画の学校名）
    plan = supabase.table("plans").select("school_name").eq("id", plan_id).execute().data
    school_name = plan[0]["school_name"] if plan else "学校"
    return {"notice": notice.create_notice(route_data[0]["data"], school_name)}
