import Link from "next/link";

// Figma「ボタン」：primary＝デフォルト、secondary＝バリアント2、disabled＝無効
type Props = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "lg" | "md" | "sm";  // lg＝高さ80（次へ）、md＝高さ60（カード内）、sm＝高さ50（小さい操作）
  href?: string;              // あればリンクとして表示する
  newTab?: boolean;           // リンクを新しいタブで開くか（Googleフォームなど外のサイト）
  onClick?: () => void;
  disabled?: boolean;
};

const SIZES = {
  lg: "px-16 py-[1.1875rem] text-h2",
  md: "h-15 px-16 text-h2",
  sm: "h-[3.125rem] w-[17.1875rem] px-4 text-button-sm",
};

const COLORS = {
  primary: "border-black bg-primary shadow-[0_0.25rem_0_0_var(--color-black)] active:translate-y-1 active:shadow-none",
  secondary: "border-black bg-bg",
  disabled: "cursor-not-allowed border-gray bg-bg text-gray",
};

export function Button({ children, variant = "primary", size = "lg", href, newTab = false, onClick, disabled = false }: Props) {
  const className = `inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border-3 font-extrabold
                     ${SIZES[size]} ${disabled ? COLORS.disabled : COLORS[variant]}`;

  if (href && !disabled) {
    if (newTab) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
    }
    return <Link href={href} className={className}>{children}</Link>;
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}
