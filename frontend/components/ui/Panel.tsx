// Figma「form表示カード」「条件入力カード」など：メインカードの中に置く、背景色のパネル
type Props = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  color?: "bg" | "warn";      // 面の色（warn は確認が必要なことを伝えるとき）
  className?: string;         // 幅や高さなど、置く場所に合わせた指定
};

export function Panel({ title, description, children, color = "bg", className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-3 rounded-panel p-8 ${color === "warn" ? "bg-warn" : "bg-bg"} ${className}`}>
      {(title || description) && (
        <div className="shrink-0">
          {title && <h2 className="text-h2 font-extrabold">{title}</h2>}
          {description && <p className="text-h3 text-text-gray">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
