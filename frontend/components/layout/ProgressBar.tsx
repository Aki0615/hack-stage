// Figma「進捗バー」：現在＝黄色、完了済み＝ミント、未完了＝灰色（枠なし）
export type ProgressState = "current" | "done" | "todo";

const COLORS: Record<ProgressState, string> = {
  current: "border-2 border-black bg-primary",
  done: "border-2 border-black bg-ok",
  todo: "bg-gray",
};

export function ProgressBar({ state }: { state: ProgressState }) {
  return <div className={`h-[0.9375rem] w-full rounded-full ${COLORS[state]}`} />;
}
