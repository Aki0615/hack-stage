"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame } from "@/components/layout/PageFrame";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { FormPreview } from "@/components/form/FormPreview";
import { createPlan, uploadCsv, generateStops } from "@/lib/api";
import { saveData } from "@/lib/storage";
import { DEFAULT_SCHOOL, getCurrentPosition, type LatLng } from "@/lib/school";

// 申し込みformのテンプレート（GoogleフォームのID。未設定なら画面内のプレビューを表示する）
// 作り方は scripts/create-form.gs を参照。編集画面のURLをそのまま入れても、IDだけ取り出して使う
const FORM_SETTING = process.env.NEXT_PUBLIC_FORM_ID ?? "";
const FORM_ID = FORM_SETTING.match(/forms\/d\/([\w-]+)/)?.[1] ?? FORM_SETTING;

export default function ImportPage() {
  const router = useRouter();
  const [busCount, setBusCount] = useState(2);
  const [capacity, setCapacity] = useState(20);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [school, setSchool] = useState<LatLng | null>(null);   // 学校の所在地（先生の現在地）
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState("");        // 現在地が取れなかった理由

  // 現在地の結果を画面に反映する
  function applyLocation(result: Awaited<ReturnType<typeof getCurrentPosition>>) {
    setSchool("pos" in result ? result.pos : null);
    setLocationError("reason" in result ? result.reason : "");
    setLocating(false);
  }

  // 学校の所在地として、ブラウザから現在地を取り直す
  function locate() {
    setLocating(true);
    getCurrentPosition().then(applyLocation);
  }

  // 画面を開いたら、まず現在地を取る
  useEffect(() => {
    getCurrentPosition().then(applyLocation);
  }, []);

  // ファイルを選んだとき（選び直したら、もう一度作成からやり直す）
  function handleFile(selected: File | null) {
    setFile(selected);
    setDone(false);
    setError("");
  }

  // 「停留所とルートを作成する」を押したとき
  async function handleCreate() {
    if (!file) {
      setError("先に「回答のExcelを読み込む」からファイルを選んでください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const schoolPos = school ?? DEFAULT_SCHOOL;   // 現在地が取れなければ既定の位置
      const planId = await createPlan(busCount, capacity, schoolPos);
      const result = await uploadCsv(planId, file);
      const stops = await generateStops(planId);
      saveData("planId", planId);
      saveData("school", schoolPos);
      saveData("busCount", busCount);
      saveData("importResult", result);
      saveData("stops", stops);
      setDone(true);
    } catch (e) {
      setError((e as Error).message);          // 先生向けのエラー文を表示
    }
    setLoading(false);
  }

  // 進捗バーの伸び具合：作成中はゆっくり伸ばし、できたら端まで
  let progress = "w-0";
  if (loading) progress = "w-[90%] duration-[8000ms]";
  if (done) progress = "w-full duration-300";

  return (
    <PageFrame step={0} title="住所を取り込み" description="保護者にformを共有し、解答を取り込みましょう">
      <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[950fr_575fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-[6.9375rem]">
        {/* 左：申し込みformのテンプレート */}
        <Panel title="申し込みformのテンプレート" description="このテンプレートをもとにformを作成し、共有できます。" className="min-h-0">
          <div className="min-h-80 flex-1 overflow-clip rounded-field bg-placeholder lg:min-h-0">
            {FORM_ID ? (
              <iframe src={`https://docs.google.com/forms/d/${FORM_ID}/viewform?embedded=true`}
                      title="申し込みformのテンプレート" className="size-full" />
            ) : (
              <FormPreview />
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <Button variant="secondary" size="sm" disabled={!FORM_ID} newTab
                    href={`https://docs.google.com/forms/d/${FORM_ID}/copy`}>
              テンプレートをコピーして使う
            </Button>
            <Button variant="secondary" size="sm" onClick={() => document.getElementById("answer-file")?.click()}>
              回答のExcelを読み込む
            </Button>
            <input id="answer-file" type="file" accept=".csv,.xlsx,.xls" className="hidden"
                   onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
            {file && <p className="text-h3">選択中：{file.name}</p>}
          </div>
        </Panel>

        {/* 右：条件の入力と「次へ」 */}
        <div className="flex min-h-0 flex-col justify-between gap-8">
          <Panel>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-5">
                <h2 className="text-h2 font-extrabold">条件の入力</h2>
                <TextField label="使えるバスの台数" type="number" min={1} value={busCount}
                           onChange={(v) => setBusCount(Number(v))} />
                <TextField label="１台あたりの定員数" type="number" min={1} value={capacity}
                           onChange={(v) => setCapacity(Number(v))} />
                {/* 学校の所在地（今いる場所を学校とみなす） */}
                <p className="text-h3">
                  <span className="font-bold">学校の所在地：</span>
                  {locating ? "現在地を確認しています…"
                    : school ? `今いる場所（緯度${school.lat.toFixed(4)}・経度${school.lng.toFixed(4)}）`
                    : "名古屋駅付近"}
                  {/* 現在地が取れなかったときだけ、取り直せるようにする */}
                  {!locating && !school && (
                    <button type="button" onClick={locate} disabled={loading}
                            className="ml-3 font-bold underline underline-offset-4">
                      現在地を取り直す
                    </button>
                  )}
                </p>
                {!locating && locationError && <p className="-mt-3 text-caption text-text-gray">{locationError}</p>}
                <div className="flex flex-col items-start gap-3">
                  <Button size="md" onClick={handleCreate} disabled={loading || done || locating}>
                    停留所とルートを作成する
                  </Button>
                  <div role="progressbar" aria-label="作成の進み具合" aria-valuenow={done ? 100 : loading ? 50 : 0}
                       className="h-[0.9375rem] w-full overflow-clip rounded-full border border-black bg-gray">
                    <div className={`h-full rounded-full bg-black transition-[width] ease-out ${progress}`} />
                  </div>
                </div>
              </div>

              {loading && <p className="text-h3 text-text-gray">作成しています…（30秒ほどかかることがあります）</p>}
              {done && <p className="text-h3 text-text-gray">できました。次へを押してください。</p>}
              {error && <p className="rounded-field bg-warn p-3 text-h3 font-bold">{error}</p>}
            </div>
          </Panel>

          <div className="self-end">
            <Button onClick={() => router.push("/result")} disabled={!done}>
              {done ? "取り込み結果へ" : "次へ"}
            </Button>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
