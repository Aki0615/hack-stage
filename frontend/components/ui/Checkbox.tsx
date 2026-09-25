import Image from "next/image";

// Figma「チェックボックス」：デフォルトは白地に薄いチェック、完了は黒地に白いチェック
// size="sm" は保護者への案内画面の小さいチェックボックス（25px）。文字の大きさは親に合わせる
type Props = {
  checked: boolean;
  onChange: () => void;
  size?: "md" | "sm";
  children: React.ReactNode;   // 横に出す文字
};

const SIZES = {
  md: { box: "size-[3.125rem] border-2", icon: "left-[0.1875rem] top-[0.1875rem] size-10", gap: "gap-3", label: "text-h3" },
  sm: { box: "size-[1.5625rem] border", icon: "left-[0.09375rem] top-[0.09375rem] size-5", gap: "gap-6", label: "" },
};

export function Checkbox({ checked, onChange, size = "md", children }: Props) {
  const s = SIZES[size];
  return (
    <label className={`flex cursor-pointer items-center ${s.gap}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`relative shrink-0 overflow-clip rounded-check peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${s.box} ${
          checked ? "border-black bg-black" : "border-gray bg-white"
        }`}
      >
        <Image src={checked ? "/icons/check-done.svg" : "/icons/check-default.svg"} alt=""
             width={40} height={40} className={`absolute ${s.icon}`} />
      </span>
      <span className={s.label}>{children}</span>
    </label>
  );
}
