def check_record(r: dict) -> list[dict]:
    issues = []
    if r["name"] == "":
        issues.append({"field": "name", "message": "氏名が空欄です"})
    if r["address"] == "":
        issues.append({"field": "address", "message": "住所が空欄です"})
    if r["grade"] == "":
        issues.append({"field": "grade", "message": "学年がわかりません"})
    if r["use_morning"] is None:
        issues.append({"field": "use_morning", "message": "登校で利用するかわかりません"})
    if r["use_evening"] is None:
        issues.append({"field": "use_evening", "message": "下校で利用するかわかりません"})
    return issues

def validate(records: list[dict]) -> list[dict]:
    seen = []
    for r in records:
        r["issues"] = check_record(r)
        key = r["name"] + r["address"]
        if key in seen:
            r["issues"].append({"field": "name", "message": "同じ申込が2回以上あります"})
        seen.append(key)
    return records
