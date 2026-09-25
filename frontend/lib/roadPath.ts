// 停留所を順に回って学校へ向かう、道路に沿った道順を Google の Routes API で取る
// 同じ道順を何度も取らないよう、一度取った結果はページを開いている間だけ覚えておく
type Point = { lat: number; lng: number };

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const cache = new Map<string, Promise<Point[]>>();

export function fetchRoadPath(points: Point[]): Promise<Point[]> {
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");
  if (!cache.has(key)) {
    const request = requestRoadPath(points);
    // 失敗した結果は覚えない（設定を直したあとにもう一度取れるように）
    request.catch(() => cache.delete(key));
    cache.set(key, request);
  }
  return cache.get(key)!;
}

async function requestRoadPath(points: Point[]): Promise<Point[]> {
  const toWaypoint = (p: Point) => ({ location: { latLng: { latitude: p.lat, longitude: p.lng } } });
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY ?? "",
      "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: toWaypoint(points[0]),
      destination: toWaypoint(points[points.length - 1]),
      intermediates: points.slice(1, -1).map(toWaypoint),   // 途中の停留所（順番どおりに回る）
      travelMode: "DRIVE",
    }),
  });
  const data = await res.json();
  const encoded = data.routes?.[0]?.polyline?.encodedPolyline;
  if (!res.ok || !encoded) {
    throw new Error(data.error?.message ?? "道順を取得できませんでした");
  }
  return decodePolyline(encoded);
}

// Google の「エンコードされたポリライン」を緯度経度の配列に戻す
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm
function decodePolyline(encoded: string): Point[] {
  const points: Point[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    for (const axis of ["lat", "lng"] as const) {
      let result = 0;
      let shift = 0;
      let byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === "lat") lat += delta;
      else lng += delta;
    }
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}
