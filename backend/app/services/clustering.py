import math
from sklearn.cluster import DBSCAN
from app.services.distance import distance_m

# デモ地域の注意が必要な場所（後で皆さんの地域の座標に変更できます）
DANGER_SPOTS = [
    {"name": "さくら通り交差点", "lat": 35.1700, "lng": 136.8900},
    {"name": "駅前ロータリー", "lat": 35.1712, "lng": 136.8820},
]

def make_warnings(stop: dict) -> list[str]:
    """停留所候補の注意点を文章のリストで返す"""
    warnings = []
    for spot in DANGER_SPOTS:
        d = distance_m(stop["lat"], stop["lng"], spot["lat"], spot["lng"])
        if d < 150:
            warnings.append(f"{spot['name']}の近くです。横断や待ち場所を現地で確認してください")
    if stop["max_walk_m"] > 400:
        warnings.append("徒歩400mを超える児童がいます")
    return warnings


def make_groups(students: list[dict], radius_m: float) -> dict:
    """近くの家どうしをグループにする。結果は {グループ番号: [児童, ...]}"""
    points = []
    for s in students:
        points.append([math.radians(s["lat"]), math.radians(s["lng"])])

    model = DBSCAN(
        eps=radius_m / 6371000,      # 距離を元にグループ分けの基準を設定
        min_samples=1,
        metric="haversine",
    )
    labels = model.fit_predict(points)

    groups = {}
    for student, label in zip(students, labels):
        if label not in groups:
            groups[label] = []
        groups[label].append(student)
    return groups


def make_stop(members: list[dict]) -> dict:
    """1つのグループから停留所候補を作る"""
    # グループの真ん中の座標を計算する
    lat = sum(m["lat"] for m in members) / len(members)
    lng = sum(m["lng"] for m in members) / len(members)

    # 各家から停留所までの距離
    walks = []
    for m in members:
        walks.append(distance_m(m["lat"], m["lng"], lat, lng))

    return {
        "lat": lat,
        "lng": lng,
        "members": members,
        "student_ids": [m["id"] for m in members],
        "student_count": len(members),
        "walks": walks,
        "avg_walk_m": int(sum(walks) / len(walks)),
        "max_walk_m": int(max(walks)),
    }


def build_stops(students: list[dict], radius_m: float = 250) -> list[dict]:
    """停留所候補のリストを作る（人数の多い順に番号を振る）"""
    groups = make_groups(students, radius_m)
    stops = []
    for members in groups.values():
        stops.append(make_stop(members))

    stops.sort(key=lambda s: s["student_count"], reverse=True)
    for i, stop in enumerate(stops):
        stop["label"] = i + 1
        stop["warnings"] = make_warnings(stop)
    return stops
