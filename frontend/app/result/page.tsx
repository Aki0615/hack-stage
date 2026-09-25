"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { StepNav } from "@/components/layout/StepNav";
import { Panel } from "@/components/ui/Panel";
import { loadData } from "@/lib/storage";
import type { ImportResult } from "@/lib/types";

// 標準の項目名を先生向けの言葉にする
const LABELS: Record<string, string> = {
  name: "氏名", grade: "学年", address: "住所",
  use_morning: "登校利用", use_evening: "下校利用", note: "備考",
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ImportResult | null>(null);

  // 画面を開いたときに1回だけ、保存した読み込み結果を取り出す
  // （sessionStorage はブラウザにしかないため、表示後に読む必要がある）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(loadData("importResult"));
  }, []);

  if (!result) return <p className="p-10 text-h3">読み込み中…</p>;

  const needsCheck = result.records.filter((r) => r.issues.length > 0);

  return (
    <PageFrame step={1} title="取り込み結果" description={`${result.total}名の申込情報を読み込みました`}>
      {/* 優先度1：集計 */}
      <div className="grid shrink-0 gap-6 md:grid-cols-2">
        <div className="rounded-panel border-2 border-black bg-ok px-8 py-5">
          <p className="text-logo font-black">{result.ok_count}名</p>
          <p className="text-h3">問題ありません</p>
        </div>
        <div className="rounded-panel border-2 border-black bg-warn px-8 py-5">
          <p className="text-logo font-black">{result.needs_check_count}名</p>
          <p className="text-h3">確認が必要です</p>
        </div>
      </div>

      {/* 優先度2（左）と優先度3（右）。人数が多いときはパネルの中だけスクロールする */}
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        {/* 優先度2：確認が必要な人 */}
        <Panel title="確認が必要な申込" className="min-h-0 overflow-y-auto">
          {needsCheck.length === 0 && <p className="text-h3">確認が必要な申込はありません</p>}
          <ul className="flex flex-col gap-3">
            {needsCheck.map((r) => (
              <li key={r.row} className="rounded-field border-2 border-black bg-white p-4">
                <p className="text-h4 font-extrabold">スプレッドシート{r.row}行目　{r.name || "（名前なし）"}</p>
                {r.issues.map((issue) => (
                  <p key={issue.message} className="text-h5">・{issue.message}</p>
                ))}
              </li>
            ))}
          </ul>
        </Panel>

        {/* 優先度3：開いたときだけ見える詳細 */}
        <Panel className="min-h-0 overflow-y-auto">
        <details>
          <summary className="cursor-pointer text-h4 font-extrabold">スプレッドシートの列の対応を見る</summary>
          <table className="mt-3 text-h5">
            <tbody>
              {Object.entries(result.column_mapping).map(([sheetColumn, key]) => (
                <tr key={sheetColumn}>
                  <td className="py-1 pr-6">{sheetColumn}</td>
                  <td>→ {LABELS[key] ?? key}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        <details>
          <summary className="cursor-pointer text-h4 font-extrabold">全員の一覧を見る</summary>
          <table className="mt-3 w-full text-left text-h5">
            <thead>
              <tr><th className="py-1">氏名</th><th>学年</th><th>登校</th><th>下校</th><th>住所</th></tr>
            </thead>
            <tbody>
              {result.records.map((r) => (
                <tr key={r.row} className="border-t border-gray">
                  <td className="py-1">{r.name || "（名前なし）"}</td>
                  <td>{r.grade}</td>
                  <td>{r.use_morning ? "○" : "―"}</td>
                  <td>{r.use_evening ? "○" : "―"}</td>
                  {/* 画面を映すことも考え、住所そのものは出さない */}
                  <td>{r.status === "ok" ? "確認済み" : "要確認"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        </Panel>
      </div>

      <StepNav backHref="/import" nextLabel="停留所の候補を作る" onNext={() => router.push("/stops")} />
    </PageFrame>
  );
}
