from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.services import routing

router = APIRouter()

SUMMARY = {
    "efficiency": "停留所を少なくして、バスの所要時間を短くした案です。",
    "fairness":   "停留所を細かく置いて、どの児童も歩く距離が短くなるようにした案です。",
    "safety":     "注意が必要な場所の近くに停留所を置かないようにした案です。",
}

def stop_reason_template(stop: dict) -> str:
    return (f"{stop['student_count']}名の家のほぼ真ん中にあり、"
            f"平均{stop['avg_walk_m']}m、長くても{stop['max_walk_m']}mの距離で利用できます。")

@router.post("/plans/{plan_id}/routes/generate")
def generate_routes(plan_id: str):
    # ① 計画と児童（座標がわかった人だけ）を読む
    plan_data = supabase.table("plans").select("*").eq("id", plan_id).execute().data
    if not plan_data:
        raise HTTPException(404, "計画が見つかりません")
    plan = plan_data[0]
    
    students = supabase.table("students").select("*").eq("plan_id", plan_id).eq("geocode_status", "ok").execute().data
    if not students:
        raise HTTPException(400, "地図上で確認できた児童がいません")

    # ② 3つのルート案を作る
    school = {"lat": plan["school_lat"], "lng": plan["school_lng"]}
    results = routing.make_three_plans(school, students, plan["bus_count"], plan["bus_capacity"])
    if not results:
        raise HTTPException(400, "条件を満たすルートが作れませんでした。バスの台数か定員を確認してください")

    # ③ 文章を付ける
    for r in results:
        r["summary"] = SUMMARY[r["strategy"]]
        for s in r["stops"]:
            s["reason"] = stop_reason_template(s)

    # ④ 古い案を消して保存し、保存で付いたidを持たせる
    supabase.table("route_plans").delete().eq("plan_id", plan_id).execute()
    for r in results:
        saved = supabase.table("route_plans").insert(
            {"plan_id": plan_id, "strategy": r["strategy"], "data": r}).execute().data[0]
        r["id"] = saved["id"]
        
    return results
