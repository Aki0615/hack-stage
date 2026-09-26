"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { StepNav } from "@/components/layout/StepNav";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { generateNotice } from "@/lib/api";
import { RestartGuide } from "@/components/layout/RestartGuide";
import { hasData, loadData, saveData } from "@/lib/storage";

// 送る前に先生が確かめる項目
const CHECK_ITEMS = [
  "ルートの説明に矛盾がない",
  "停留所の場所に誤りがない",
  "誤字・脱字がない",
  "全ての停留所の集合時刻が書いてある",
];

export default function NoticePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);   // 計画か、選んだ案がない

  // 画面を開いたら案内文を作る
  useEffect(() => {
    if (!hasData("planId", "selectedRouteId")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMissing(true);
      return;
    }
    generateNotice(loadData("planId"), loadData("selectedRouteId"))
      .then((notice) => setText(notice))
      .catch((e) => setError(e.message));
  }, []);

  // チェックを付けたり外したりする
  function toggle(item: string) {
    if (checked.includes(item)) {
      setChecked(checked.filter((c) => c !== item));
    } else {
      setChecked([...checked, item]);
    }
  }

  // 「次へ」：確認した案内文を保存して完了画面へ
  function confirmNotice() {
    saveData("notice", text);
    router.push("/done");
  }

  const allChecked = checked.length === CHECK_ITEMS.length;

  if (missing) {
    return (
      <PageFrame step={4} title="保護者への案内"
                 description="メールでそのまま送れる案内文を作成できます。送る前に右の項目を確認してください。" card={false}
               buddy={{ text: "送る前に、右の4つを確かめてね" }}>
        <RestartGuide />
      </PageFrame>
    );
  }

  return (
    <PageFrame step={4} title="保護者への案内"
               description="メールでそのまま送れる案内文を作成できます。送る前に右の項目を確認してください。"
               card={false}>
      <div className="grid min-h-0 flex-1 gap-x-[7.9375rem] gap-y-[1.375rem] lg:w-[92.8%] lg:grid-cols-[800fr_607fr] lg:grid-rows-[minmax(0,1fr)_auto]">
        {/* 案内文（「文章を編集」を押すまでは書き換えられない） */}
        <div className="min-h-80 lg:min-h-0">
          {error ? (
            <p className="rounded-field bg-warn p-3 text-h3 font-bold">{error}</p>
          ) : text === "" ? (
            <div className="grid h-full place-items-center rounded-panel border border-gray bg-bg">
              <p className="text-h2 font-extrabold">案内文を作っています…</p>
            </div>
          ) : (
            <textarea value={text} onChange={(e) => setText(e.target.value)} readOnly={!editing}
                      aria-label="保護者への案内文"
                      className={`size-full resize-none rounded-panel border px-8 py-6 text-h4 leading-relaxed outline-none
                                  ${editing ? "border-black bg-white" : "border-gray bg-bg"}`} />
          )}
        </div>

        {/* 送る前の確認事項 */}
        <Panel title="送る前の確認事項" className="gap-5 overflow-y-auto px-10 py-9 lg:col-start-2 lg:row-start-1">
          <div className="flex flex-col gap-6 text-h2">
            {CHECK_ITEMS.map((item) => (
              <Checkbox key={item} size="sm" checked={checked.includes(item)} onChange={() => toggle(item)}>
                {item}
              </Checkbox>
            ))}
          </div>
        </Panel>

        <div className="lg:col-start-1 lg:row-start-2">
          <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)} disabled={text === ""}>
            {editing ? "編集を終える" : "文章を編集"}
          </Button>
        </div>
      </div>

      <StepNav backHref="/routes" nextLabel="次へ" onNext={confirmNotice} nextDisabled={!allChecked || text === ""} />
    </PageFrame>
  );
}
