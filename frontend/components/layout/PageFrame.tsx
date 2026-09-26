import { Header } from "./Header";
import { ProgressSteps } from "./ProgressSteps";
import { Buddy } from "@/components/buddy/Buddy";

// ヘッダー・進捗・Figma「メインカード」をまとめた、全画面共通の枠
// PCでは画面の高さぴったりに収め、ページ自体はスクロールさせない。
// 中身は flex-1 で残りの高さを埋める（各画面の中身には min-h-0 flex-1 をつける）
type Props = {
  step: number;              // 何番目の画面か（0から数える）
  title: string;             // 見出し
  description?: string;      // 見出しの下の説明
  card?: boolean;            // 白いメインカードで囲むか（取り込み結果画面などは囲まない）
  heading?: boolean;         // 見出しを出すか（false なら画面の中で <PageHeading> を置く）
  buddy?: BuddyLine;         // 見出しの右に出す、キャラクターのセリフ
  children: React.ReactNode; // 画面の中身
};

export function PageFrame({ step, title, description, card = true, heading = true, buddy, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <Header />
      <div className="shrink-0 px-6 pb-2 pt-[1.5625rem]">
        <ProgressSteps current={step} />
      </div>
      <main className="flex min-h-0 flex-1 flex-col px-6 pb-6">
        <section className={`mx-auto flex min-h-0 w-full max-w-[1700px] flex-1 flex-col gap-7 p-8 ${card ? "rounded-card bg-surface" : ""}`}>
          {heading && <PageHeading title={title} description={description} buddy={buddy} />}
          {children}
        </section>
      </main>
    </div>
  );
}

// キャラクターのセリフと表情
export type BuddyLine = { text: string; mood?: "normal" | "happy" };

// 画面の見出しと説明。ふだんは PageFrame が出すが、見出しの横にも部品を並べたい画面では自分で置く
// buddy を渡すと、見出しの右にキャラクターを出す
export function PageHeading({ title, description, buddy }: { title: string; description?: string; buddy?: BuddyLine }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-6">
      <div>
        <h1 className="text-h1 font-black">{title}</h1>
        {description && <p className="text-h2 text-text-gray">{description}</p>}
      </div>
      {buddy && <Buddy text={buddy.text} mood={buddy.mood} />}
    </div>
  );
}
