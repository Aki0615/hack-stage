"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame, PageHeading } from "@/components/layout/PageFrame";
import { StepNav } from "@/components/layout/StepNav";
import { Panel } from "@/components/ui/Panel";
import { BusMap } from "@/components/map/BusMap";
import { Buddy } from "@/components/buddy/Buddy";
import { generateRoutes } from "@/lib/api";
import { RestartGuide } from "@/components/layout/RestartGuide";
import { hasData, loadData, saveData } from "@/lib/storage";
import { DEFAULT_SCHOOL, loadSchool, type LatLng } from "@/lib/school";
import { STRATEGY_INFO, STRATEGY_ORDER } from "@/lib/strategy";
import { routeNotes } from "@/lib/routeNotes";
import type { RoutePlan } from "@/lib/types";

const TITLE = "ルートを比較";
const DESCRIPTION = "方針ごとに3つのルートを提案します。学校の考えに合う案を選んでください。";

export default function RoutesPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<RoutePlan[]>([]);
  const [current, setCurrent] = useState(0);          // 今見ている案の番号
  const [error, setError] = useState("");
  const [school, setSchool] = useState(DEFAULT_SCHOOL);
  const [missing, setMissing] = useState(false);   // 計画がない

  // 画面を開いたら3つのルート案を作る（効率・公平性・安全の順に並べる）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSchool(loadSchool());
    if (!hasData("planId")) {
      setMissing(true);
      return;
    }
    generateRoutes(loadData("planId"))
      .then((data) => setPlans([...data].sort((a, b) => STRATEGY_ORDER.indexOf(a.strategy) - STRATEGY_ORDER.indexOf(b.strategy))))
      .catch((e) => setError(e.message));
  }, []);

  const plan = plans[current];

  // 「この案で案内を作る」
  function choose() {
    saveData("routes", plans);
    saveData("selectedRouteId", plan.id);
    router.push("/notice");
  }

  return (
    <PageFrame step={3} title={TITLE} description={DESCRIPTION} card={false} heading={false}>
      {/* 左に見出し・タブ・地図、右に案の詳しい情報 */}
      <div className="grid min-h-0 flex-1 gap-x-[5.4375rem] gap-y-[0.875rem] lg:grid-cols-[950fr_616fr] lg:grid-rows-[auto_auto_minmax(0,1fr)]">
        <PageHeading title={TITLE} description={DESCRIPTION} />

        {error && <p className="rounded-field bg-warn p-3 text-h3 font-bold">{error}</p>}
        {missing && <div className="lg:col-span-2"><RestartGuide /></div>}
        {!plan && !error && !missing && <p className="text-h3">ルート案を作っています…</p>}

        {plan && <RouteView plans={plans} current={current} onChange={setCurrent} school={school} />}
      </div>

      <StepNav backHref="/stops" nextLabel="この案で案内を作る" onNext={choose} nextDisabled={!plan} />
    </PageFrame>
  );
}

// タブ・地図・案の詳しい情報
function RouteView({ plans, current, onChange, school }:
                     { plans: RoutePlan[]; current: number; onChange: (i: number) => void; school: LatLng }) {
  const plan = plans[current];
  const info = STRATEGY_INFO[plan.strategy];
  const notes = routeNotes(plan, plans);

  // 地図に引く線：バスごとに「停留所を順番に → 最後に学校」
  const lines = plan.buses.map((bus) => {
    const points = bus.stops
      .map((bs) => plan.stops.find((s) => s.label === bs.stop_label))
      .filter((s) => s !== undefined)
      .map((s) => ({ lat: s.lat, lng: s.lng }));
    return { colorVar: info.colorVar, points: [...points, school] };
  });

  return (
    <>
      {/* 方針のタブ（案の色と名前は必ずセットで出す） */}
      {/* 見出しの横は狭いので、そらまるはタブの右に置く */}
      <div className="flex items-center justify-between gap-4 lg:col-start-1 lg:row-start-2">
      <div role="tablist" aria-label="ルート案" className="flex shrink-0 flex-wrap gap-[1.5625rem] lg:flex-nowrap">
        {plans.map((p, i) => (
          <button key={p.id} type="button" role="tab" aria-selected={i === current} onClick={() => onChange(i)}
                  className={`h-[3.125rem] w-50 rounded-full border-3 border-black text-button-sm font-extrabold
                              ${i === current ? STRATEGY_INFO[p.strategy].bg : "bg-bg"}`}>
            {STRATEGY_INFO[p.strategy].name}
          </button>
        ))}
      </div>
        <Buddy text="速さだけで選ばないでね" />
      </div>

      {/* 地図 */}
      <div className="min-h-0 lg:col-start-1 lg:row-start-3">
        <BusMap school={school} stops={plan.stops} lines={lines} />
      </div>

      {/* 案の詳しい情報 */}
      {/* 右の列：Figmaどおりタブの高さから地図の下端までをパネルにする。
          中身が収まらない案のときだけ、見出しと同じ高さの透明な余白が縮んで、パネルが上に伸びる */}
      <div className="flex min-h-0 flex-col gap-[0.875rem] lg:col-start-2 lg:row-span-3 lg:row-start-1">
        <div aria-hidden className="invisible hidden min-h-0 shrink-[100] overflow-hidden lg:block">
          <PageHeading title={TITLE} description={DESCRIPTION} />
        </div>
      <Panel title={`${info.name}のルート`}
             className="min-h-0 grow shrink-[0.001] gap-5 overflow-y-auto px-[2.125rem] py-7">
        {/* 数字（左に項目名、右に値） */}
        <dl className="grid shrink-0 grid-cols-[auto_1fr] items-center gap-x-8 gap-y-2 text-h3">
          <dt className="text-text-gray">所要時間</dt>
          <dd>{plan.metrics.total_time}分</dd>
          <dt className="text-text-gray">平均の徒歩距離</dt>
          <dd>{plan.metrics.average_walk_distance}m</dd>
          <dt className="text-text-gray">距離のばらつき</dt>
          <dd>±{plan.metrics.walk_distance_spread}m</dd>
          <dt className="text-text-gray">危ないポイント</dt>
          <dd>
            {plan.metrics.safety_check_count > 0 ? (
              <span className="inline-block rounded-[0.3125rem] bg-warn p-1 font-extrabold">
                現地確認 {plan.metrics.safety_check_count}か所
              </span>
            ) : (
              "なし"
            )}
          </dd>
        </dl>

        {/* 良い点・気になる点 */}
        <div className={`flex shrink-0 flex-col gap-1 rounded-panel px-[1.0625rem] py-5 text-h3 ${info.bg}`}>
          <p><span className="font-extrabold">良い点：</span>{notes.good}</p>
          <p><span className="font-extrabold">気になる点：</span>{notes.concern}</p>
        </div>

        {/* バスごとの停留所と集合時間 */}
        <div className="shrink-0 text-h3">
          <div className="grid grid-cols-[3.3125rem_auto] gap-x-[3.75rem] font-extrabold">
            <p>バス</p>
            <p>停留所と集合時間</p>
          </div>
          <div className="flex flex-wrap gap-x-[2.3125rem] gap-y-2">
            {plan.buses.map((bus) => (
              <div key={bus.bus} className="grid grid-cols-[3.3125rem_auto] gap-x-[3.75rem]">
                <p>{bus.bus}号車</p>
                <ul className="flex flex-col">
                  {bus.stops.map((s) => (
                    <li key={s.stop_label} className="flex gap-3">
                      <span className="w-5">{s.stop_label}</span>
                      <span>{s.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      </div>
    </>
  );
}
