def generate_notice_text(student: dict, stop: dict, route: dict) -> str:
    bus_info = None
    stop_time = ""
    for b in route.get("buses", []):
        for s in b.get("stops", []):
            if s["stop_label"] == stop["label"]:
                bus_info = b["bus"]
                stop_time = s["time"]
                break
        if bus_info:
            break

    return (
        f"{student['name']} 保護者様\n\n"
        f"スクールバスの運行計画が決定しました。\n"
        f"お子様の乗車停留所および時間は以下の通りです。\n\n"
        f"■ 停留所番号: 第 {stop['label']} 便停留所\n"
        f"■ お迎え予定時刻: 朝 {stop_time} 頃\n"
        f"■ バス号車: 第 {bus_info} 号車\n"
        f"■ 停留所の位置（緯度経度）: 緯度 {stop['lat']}, 経度 {stop['lng']}\n"
        f"■ ご案内・理由: {stop.get('reason', '')}\n\n"
        f"安全な運行にご協力をお願いいたします。"
    )

def create_all_notices(students: list[dict], stops: list[dict], route: dict) -> list[dict]:
    notices = []
    for student in students:
        assigned_stop = None
        for stop in stops:
            if student["id"] in stop.get("student_ids", []):
                assigned_stop = stop
                break
        if not assigned_stop and stops:
            assigned_stop = stops[0]

        text = ""
        if assigned_stop:
            text = generate_notice_text(student, assigned_stop, route)
        else:
            text = f"{student['name']} 保護者様\n\n割り当てられた停留所が見つかりませんでした。"

        notices.append({
            "student_name": student["name"],
            "text": text,
        })
    return notices
