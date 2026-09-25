// Figma「入力欄」：ふだんは灰色の枠、入力中（フォーカス中）は黒い枠
type Props = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
};

export function TextField({ label, value, onChange, type = "text", min }: Props) {
  return (
    <label className="flex w-full flex-col">
      <span className="text-h3">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[3.375rem] w-full rounded-field border-2 border-gray bg-white px-4 text-h2 outline-none focus:border-black"
      />
    </label>
  );
}
