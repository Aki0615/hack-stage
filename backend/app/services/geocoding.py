import requests
from app import config

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

def geocode(address: str) -> dict:
    """1件の住所を座標にする"""
    res = requests.get(GEOCODE_URL, params={
        "address": address,
        "key": config.GOOGLE_MAPS_API_KEY,
        "language": "ja",
        "region": "jp",
    })
    data = res.json()

    if data["status"] != "OK":
        return {"status": "failed", "lat": None, "lng": None}

    first = data["results"][0]
    lat = first["geometry"]["location"]["lat"]
    lng = first["geometry"]["location"]["lng"]

    if first["geometry"]["location_type"] == "ROOFTOP":
        return {"status": "ok", "lat": lat, "lng": lng}
    return {"status": "low_accuracy", "lat": lat, "lng": lng}

def geocode_all(records: list[dict]) -> list[dict]:
    """全員分を順番に座標にする"""
    for r in records:
        if r["address"] == "":
            result = {"status": "failed", "lat": None, "lng": None}
        else:
            result = geocode(r["address"])

        r["status"] = result["status"]
        r["lat"] = result["lat"]
        r["lng"] = result["lng"]

        if r["status"] == "failed":
            r["issues"].append({"field": "address",
                                "message": "住所を地図上で確認できませんでした"})
        if r["status"] == "low_accuracy":
            r["issues"].append({"field": "address",
                                "message": "場所がおおよそしかわかりませんでした。番地を確認してください"})
    return records
