"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { StepNav } from "@/components/layout/StepNav";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { loadData } from "@/lib/storage";
import type { ImportResult, StopCandidate } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [stops, setStops] = useState<StopCandidate[]>([]);
  const [busCount, setBusCount] = useState(0);

  // 画面を開いたときに1回だけ、取り込み画面で保存した結果を取り出す
  // （sessionStorage はブラウザにしかないため、表示後に読む必要がある）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(loadData("importResult"));
    setStops(loadData("stops") ?? []);
    setBusCount(loadData("busCount") ?? 0);
  }, []);

  if (!result) return <p className="p-10 text-h3">読み込み中…</p>;

  const morningCount = result.records.filter((r) => r.use_morning).length;
  const eveningCount = result.records.filter((r) => r.use_evening).length;
  const needsCheck = result.records.filter((r) => r.issues.length > 0);

  return (
    <PageFrame step={1} title="取り込み結果" description="回答をもとに、利用者の分布を整理しました。" card={false}>
      <div className="flex min-h-0 flex-1 flex-col gap-[2.5625rem]">
        {/* 集計 */}
        <div className="grid shrink-0 grid-cols-3 gap-[1.6875rem]">
          <StatCard value={result.total} unit="人" color="info"
                    label={`利用者（登校${morningCount}人・下校${eveningCount}人）`} />
          <StatCard value={stops.length} unit="か所" label="停留所の候補" color="ok" />
          <StatCard value={busCount} unit="台" label="登録したバスの台数" color="primary" />
        </div>

        <div className="grid min-h-0 gap-[1.6875rem] lg:grid-cols-2">
          {/* 次にやること */}
          <Panel title="次にやること" className="self-start px-6 py-[2.625rem]">
            <p className="text-h3">停留所の候補を地図で確認し、場所が選ばれた理由に納得できるかみてください。</p>
          </Panel>

          {/* 確認が必要な申込（あるときだけ。停留所の候補から外れているため） */}
          {needsCheck.length > 0 && (
            <Panel title={`確認が必要な申込が${needsCheck.length}件あります`}
                   color="warn" className="min-h-0 self-start overflow-y-auto px-6 py-[2.625rem]">
              <ul className="flex flex-col gap-2 text-h5">
                {needsCheck.map((r) => (
                  <li key={r.row}>
                    <span className="font-bold">スプレッドシート{r.row}行目　{r.name || "（名前なし）"}</span>
                    ：{r.issues.map((issue) => issue.message).join("／")}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>

      <StepNav backHref="/import" nextLabel="停留所の候補へ" onNext={() => router.push("/stops")} />
    </PageFrame>
  );
}
