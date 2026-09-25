from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.services import clustering

router = APIRouter()

@router.post("/plans/{plan_id}/stops/generate")
def generate_stops(plan_id: str):
    # ① Supabaseから、座標変換に成功した児童（ok）のデータだけを取り出す
    students = supabase.table("students").select("*").eq("plan_id", plan_id).eq("geocode_status", "ok").execute().data

    if not students:
        raise HTTPException(status_code=400, detail="地図上で確認できた児童がいません")

    # ② 先ほど作ったプログラムで、半径250mで停留所候補を計算する
    stops = clustering.build_stops(students, radius_m=250)

    # ③ DB保存用の形にデータを整える
    rows = []
    for s in stops:
        reason = f"{s['student_count']}名の家のほぼ真ん中にあり、平均{s['avg_walk_m']}m、長くても{s['max_walk_m']}mの距離で利用できます。"
        rows.append({
            "plan_id": plan_id,
            "label": s["label"],
            "lat": s["lat"],
            "lng": s["lng"],
            "student_count": s["student_count"],
            "avg_walk_m": s["avg_walk_m"],
            "max_walk_m": s["max_walk_m"],
            "reason": reason,
            "warnings": s["warnings"]
        })

    # ④ 古い候補を消してから、新しい候補をSupabaseに保存する
    supabase.table("stop_candidates").delete().eq("plan_id", plan_id).execute()
    supabase.table("stop_candidates").insert(rows).execute()

    # ⑤ 結果を返す
    return {"message": "停留所候補を生成しました", "stop_count": len(rows), "stops": rows}
