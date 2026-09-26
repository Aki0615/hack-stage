"use client";
import { useEffect, useState } from "react";
import { PageFrame } from "@/components/layout/PageFrame";
import { Button } from "@/components/ui/Button";
import { Buddy } from "@/components/buddy/Buddy";
import { RestartGuide } from "@/components/layout/RestartGuide";
import { hasData, loadData } from "@/lib/storage";
import { STEP_TITLES } from "@/lib/steps";

export default function DonePage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);   // 確定した文章がない

  // 保護者への案内画面で確定した文章を取り出す
  // （sessionStorage はブラウザにしかないため、表示後に読む必要がある）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMissing(!hasData("notice"));
    setText(loadData("notice") ?? "");
  }, []);

  // 文章をクリップボードにコピーする
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError("");
    } catch {
      setError("コピーできませんでした。文章を選んで手でコピーしてください");
    }
  }

  if (missing) {
    return (
      <PageFrame step={4} title="保護者への案内" description="" card={false}>
        <RestartGuide />
      </PageFrame>
    );
  }

  return (
    // すべての画面が終わったので、進捗バーは全部「完了」にする
    <PageFrame step={STEP_TITLES.length} title="保護者への案内ができました！"
               description="したの文章をコピーして、保護者向けのアプリやメールに貼り付けてください。"
               card={false}>
      {/* 確定した文章 */}
      <section className="mx-auto flex min-h-0 w-full max-w-[86.8125rem] flex-1 flex-col overflow-hidden rounded-panel border-3 border-black bg-bg">
        <h2 className="shrink-0 border-b-2 border-black bg-primary px-[3.1875rem] py-5 text-h1 font-extrabold">確定した文章</h2>
        {text ? (
          <p aria-label="確定した文章" className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap px-[3.1875rem] py-6 text-h4 leading-relaxed">{text}</p>
        ) : (
          <p className="grid flex-1 place-items-center p-8 text-h2">
            確定した文章がありません。保護者への案内画面で文章を確認してください。
          </p>
        )}
      </section>

      {error && <p className="shrink-0 rounded-field bg-warn p-3 text-h3 font-bold">{error}</p>}

      {/* コピーボタンは、カードの右端にそろえる */}
      {/* そらまるは右下で、コピーボタンの左に並べる */}
      <div className="mx-auto flex w-full max-w-[86.8125rem] shrink-0 items-center justify-end gap-6">
        <Buddy text="おつかれさま！保護者に届けよう" mood="happy" shadow />
        <Button size="sm" onClick={copy} disabled={!text}>
          {copied ? "コピーしました" : "文章をコピー"}
        </Button>
      </div>
    </PageFrame>
  );
}
