"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { StepNav } from "@/components/layout/StepNav";
import { Panel } from "@/components/ui/Panel";
import { BusMap } from "@/components/map/BusMap";
import { generateStops } from "@/lib/api";
import { RestartGuide } from "@/components/layout/RestartGuide";
import { hasData, loadData } from "@/lib/storage";
import { DEFAULT_SCHOOL, loadSchool } from "@/lib/school";
import type { StopCandidate } from "@/lib/types";

export default function StopsPage() {
  const router = useRouter();
  const [stops, setStops] = useState<StopCandidate[]>([]);
  const [selected, setSelected] = useState(1);
  const [error, setError] = useState("");
  const [school, setSchool] = useState(DEFAULT_SCHOOL);
  const [missing, setMissing] = useState(false);   // 停留所も計画もない

  // 画面を開いたら、取り込み画面で作った停留所候補を出す（なければここで作る）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSchool(loadSchool());
    if (!hasData("stops") && !hasData("planId")) {
      setMissing(true);
      return;
    }
    const saved: StopCandidate[] | null = loadData("stops");
    if (saved) {
      setStops(saved);
      return;
    }
    generateStops(loadData("planId"))
      .then((data) => setStops(data))
      .catch((e) => setError(e.message));
  }, []);

  const stop = stops.find((s) => s.label === selected);

  return (
    <PageFrame step={2} title="停留所の候補" description="候補地点をクリックすると、その停留所の詳しい情報が見られます。"
               buddy={{ text: "ピンを押すと、その場所を選んだ理由がわかるよ" }}
               card={false}>
      {missing && <RestartGuide />}
      {error && <p className="rounded-field bg-warn p-3 text-h3 font-bold">{error}</p>}
      {stops.length === 0 && !error && !missing && <p className="text-h3">停留所の候補を作っています…</p>}

      {stops.length > 0 && (
        <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[950fr_616fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-[5.4375rem]">
          <BusMap school={school} stops={stops} selectedLabel={selected} onSelect={setSelected} />

          {stop && (
            <Panel title={`候補${stop.label}`} className="max-h-full gap-7 self-start overflow-y-auto px-7 py-8 lg:min-h-[86%]">
              {/* 数字（左に項目名、右に値） */}
              <dl className="grid w-fit shrink-0 grid-cols-[auto_auto] gap-x-8 gap-y-3 text-h3">
                <dt className="text-text-gray">利用者</dt>
                <dd>{stop.student_count}人</dd>
                <dt className="text-text-gray">平均の距離</dt>
                <dd>{stop.avg_walk_m}m</dd>
                <dt className="text-text-gray">最大の距離</dt>
                <dd>{stop.max_walk_m}m</dd>
              </dl>

              {/* 安全に関わる注意は、見落とさないよう理由より先に出す */}
              {stop.warnings.map((w) => (
                <div key={w} className="shrink-0 rounded-panel bg-warn px-[1.0625rem] py-6">
                  <p className="text-h2 font-extrabold">現地で確認してください</p>
                  <p className="text-h3">{w}</p>
                </div>
              ))}

              <div className="shrink-0 rounded-panel bg-info px-[1.0625rem] py-8">
                <p className="text-h2 font-extrabold">この候補にした理由</p>
                <p className="text-h3 text-text-gray">{stop.reason}</p>
              </div>
            </Panel>
          )}
        </div>
      )}

      <StepNav backHref="/result" nextLabel="次へ" onNext={() => router.push("/routes")}
               nextDisabled={stops.length === 0} />
    </PageFrame>
  );
}
