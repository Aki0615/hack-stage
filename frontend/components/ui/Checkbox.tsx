import Image from "next/image";

// Figma「チェックボックス」：デフォルトは白地に薄いチェック、完了は黒地に白いチェック
type Props = {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;   // 横に出す文字
};

export function Checkbox({ checked, onChange, children }: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`relative size-[3.125rem] shrink-0 overflow-clip rounded-check border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
          checked ? "border-black bg-black" : "border-gray bg-white"
        }`}
      >
        <Image src={checked ? "/icons/check-done.svg" : "/icons/check-default.svg"} alt=""
             width={40} height={40} className="absolute left-[0.1875rem] top-[0.1875rem] size-10" />
      </span>
      <span className="text-h3">{children}</span>
    </label>
  );
}
