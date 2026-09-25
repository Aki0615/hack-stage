import { Button } from "@/components/ui/Button";

// メインカードの下に置く「戻る」「進む」
type Props = {
  backHref?: string;         // 戻る先（なければ「戻る」を出さない）
  nextLabel: string;         // 「進む」ボタンの文字
  onNext: () => void;        // 「進む」を押したときの処理
  nextDisabled?: boolean;    // 押せない状態にするか
};

export function StepNav({ backHref, nextLabel, onNext, nextDisabled = false }: Props) {
  return (
    <div className="flex shrink-0 justify-between">
      {backHref ? <Button variant="secondary" href={backHref}>戻る</Button> : <span />}
      <Button onClick={onNext} disabled={nextDisabled}>{nextLabel}</Button>
    </div>
  );
}
