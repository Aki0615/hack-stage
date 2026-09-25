"use client";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { StopCandidate } from "@/lib/types";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
  school: { lat: number; lng: number };
  stops: StopCandidate[];
  selectedLabel?: number;                    // 選択中の停留所
  onSelect?: (label: number) => void;        // 停留所を押したとき
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

export function BusMap({ school, stops, selectedLabel, onSelect }: Props) {
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
      <Map defaultCenter={school} defaultZoom={15} mapId="DEMO_MAP_ID" disableDefaultUI
           className="h-full min-h-80 w-full overflow-hidden rounded-panel">
        {/* 学校 */}
        <AdvancedMarker position={school}>
          <div className="rounded-field border-2 border-black bg-primary px-3 py-1 text-h4 font-extrabold">学校</div>
        </AdvancedMarker>

        {/* 停留所 */}
        {stops.map((s) => (
          <AdvancedMarker key={s.label} position={{ lat: s.lat, lng: s.lng }} onClick={() => onSelect?.(s.label)}>
            <StopPin stop={s} selected={s.label === selectedLabel} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
