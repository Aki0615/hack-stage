// Figma「取り込み結果画面」の集計カード：大きな数字＋単位と、その説明
type Props = {
  value: number;
  unit: string;      // 「人」「か所」「台」など
  label: string;
  color: "info" | "ok" | "primary";
};

const COLORS = {
  info: "bg-info",
  ok: "bg-ok",
  primary: "bg-primary",
};

export function StatCard({ value, unit, label, color }: Props) {
  return (
    <div className={`flex h-[13.125rem] flex-col justify-start rounded-panel px-10 pt-[2.625rem] ${COLORS[color]}`}>
      <p className="font-extrabold">
        <span className="text-display">{value}</span>
        <span className="text-h2">{unit}</span>
      </p>
      <p className="text-h3">{label}</p>
    </div>
  );
}
