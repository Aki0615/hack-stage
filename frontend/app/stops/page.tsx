"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { StepNav } from "@/components/layout/StepNav";
import { Panel } from "@/components/ui/Panel";
import { BusMap } from "@/components/map/BusMap";
import { generateStops } from "@/lib/api";
import { loadData } from "@/lib/storage";
import { SCHOOL } from "@/lib/steps";
import type { StopCandidate } from "@/lib/types";

export default function StopsPage() {
  const router = useRouter();
  const [stops, setStops] = useState<StopCandidate[]>([]);
  const [selected, setSelected] = useState(1);
  const [error, setError] = useState("");

  // 画面を開いたら停留所候補を作る
  useEffect(() => {
    generateStops(loadData("planId"))
      .then((data) => setStops(data))
      .catch((e) => setError(e.message));
  }, []);

  const stop = stops.find((s) => s.label === selected);

  return (
    <PageFrame step={2} title="停留所の候補" description="番号を押すと、そこを選んだ理由が見られます">
      {error && <p className="rounded-field bg-warn p-3 text-h3 font-bold">{error}</p>}
      {stops.length === 0 && !error && <p className="text-h3">停留所の候補を作っています…</p>}

      {stops.length > 0 && (
        <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[950fr_575fr] lg:grid-rows-[minmax(0,1fr)]">
          <BusMap school={SCHOOL} stops={stops} selectedLabel={selected} onSelect={setSelected} />

          {stop && (
            <Panel title={`停留所${stop.label}`} className="min-h-0 overflow-y-auto">
              <div className="text-h3">
                <p>対象：{stop.student_count}名</p>
                <p>平均の距離：直線で約{stop.avg_walk_m}m</p>
                <p>最大の距離：直線で約{stop.max_walk_m}m</p>
              </div>
              <div className="rounded-field bg-info p-4">
                <p className="text-h4 font-extrabold">この候補にした理由</p>
                <p className="text-h5">{stop.reason}</p>
              </div>
              {stop.warnings.map((w) => (
                <p key={w} className="rounded-field bg-warn p-4 text-h5 font-bold">⚠ {w}</p>
              ))}
            </Panel>
          )}
        </div>
      )}

      <StepNav backHref="/result" nextLabel="ルート案を作る" onNext={() => router.push("/routes")}
               nextDisabled={stops.length === 0} />
    </PageFrame>
  );
}
