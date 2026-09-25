"use client";
import { useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { StopCandidate } from "@/lib/types";
import { fetchRoadPath } from "@/lib/roadPath";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
// 地図の見た目はGoogle Cloudの「マップのスタイル」で決まる（scripts/map-style.json を読み込んで作る）
// 未設定のときは、スタイルなしの仮のIDで表示する
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

type Point = { lat: number; lng: number };

// ルート線。色はデザイントークンのCSS変数名で渡す（例："--color-info"）
export type RouteLineData = { colorVar: string; points: Point[] };

type Props = {
  school: Point;
  stops: StopCandidate[];
  selectedLabel?: number;                    // 選択中の停留所
  onSelect?: (label: number) => void;        // 停留所を押したとき
  lines?: RouteLineData[];                   // ルート線（ルート比較画面で使う）
};

// 停留所の丸いピン（注意がある場所はピンク）
function StopPin({ stop, selected }: { stop: StopCandidate; selected: boolean }) {
  return (
    <div className={`grid size-10 place-items-center rounded-full border-2 border-black text-h4 font-extrabold
                     ${stop.warnings.length > 0 ? "bg-warn" : "bg-white"} ${selected ? "scale-125" : ""}`}>
      {stop.label}
    </div>
  );
}

export function BusMap({ school, stops, selectedLabel, onSelect, lines = [] }: Props) {
  // 地図のキーがないときは、番号だけ押せる枠を出す（デモ・開発用）
  if (!API_KEY) {
    return (
      <div className="flex h-full min-h-80 flex-col items-center justify-center gap-6 rounded-panel bg-gray p-6 text-center">
        <p className="text-h3">地図を表示するには .env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください</p>
        <div className="flex gap-4">
          {stops.map((s) => (
            <button key={s.label} type="button" onClick={() => onSelect?.(s.label)} aria-label={`停留所${s.label}`}>
              <StopPin stop={s} selected={s.label === selectedLabel} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map defaultCenter={school} defaultZoom={15} mapId={MAP_ID} disableDefaultUI clickableIcons={false}
           className="h-full min-h-80 w-full overflow-hidden rounded-panel">
        {/* 学校 */}
        <AdvancedMarker position={school}>
          <div className="rounded-field border-2 border-black bg-primary px-3 py-1 text-h4 font-extrabold">学校</div>
        </AdvancedMarker>

        {/* ルート線（停留所の下に引く） */}
        {lines.map((line, i) => <RouteLine key={i} line={line} />)}

        {/* 停留所 */}
        {stops.map((s) => (
          <AdvancedMarker key={s.label} position={{ lat: s.lat, lng: s.lng }} onClick={() => onSelect?.(s.label)}>
            <StopPin stop={s} selected={s.label === selectedLabel} />
          </AdvancedMarker>
        ))}
        {/* 学校と停留所がすべて入るように縮尺を合わせる */}
        <FitBounds points={[school, ...stops]} />
      </Map>
    </APIProvider>
  );
}

// デザイントークンのCSS変数から色を取り出す（地図の線はCSSクラスを使えないため）
function tokenColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// 地図に線を引く部品（画面には何も表示せず、地図に線を足すだけ）
// 道路に沿った道順を取って線を引く。取れないときは停留所どうしを直線で結ぶ
function RouteLine({ line }: { line: RouteLineData }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    let drawn: google.maps.Polyline[] = [];
    let cancelled = false;

    // 墨色の太い線の上に、色の線を重ねる（パステルでも見えるように）
    function draw(path: { lat: number; lng: number }[]) {
      if (cancelled) return;
      drawn = [
        new google.maps.Polyline({ path, strokeColor: tokenColor("--color-black"), strokeWeight: 9, map }),
        new google.maps.Polyline({ path, strokeColor: tokenColor(line.colorVar), strokeWeight: 5, map }),
      ];
    }

    fetchRoadPath(line.points)
      .then(draw)
      .catch((e) => {
        console.warn("道路に沿った道順を取れなかったため、直線で表示します:", e.message);
        draw(line.points);
      });

    // 線が変わるときに、古い線を消す
    return () => {
      cancelled = true;
      drawn.forEach((p) => p.setMap(null));
    };
  }, [map, line]);
  return null;
}

// 渡した地点がすべて入るように、地図の位置と縮尺を合わせる部品
// 地点が変わったときだけ合わせ直す（停留所を選んだだけでは動かさない）
function FitBounds({ points }: { points: Point[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (!map || key === "") return;
    const bounds = new google.maps.LatLngBounds();
    key.split("|").forEach((p) => {
      const [lat, lng] = p.split(",").map(Number);
      bounds.extend({ lat, lng });
    });
    map.fitBounds(bounds, 60);
  }, [map, key]);
  return null;
}
