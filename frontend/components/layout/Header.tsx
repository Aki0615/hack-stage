import Image from "next/image";
import { SCHOOL_NAME } from "@/lib/steps";

// Figma「ヘッダー」
export function Header() {
  return (
    <header className="h-25 shrink-0 border-b-2 border-gray bg-surface">
      <div className="flex h-full items-center justify-between px-[2.6875rem]">
        <p className="text-logo font-black">みちしるべ</p>
        <div className="flex items-center gap-[1.8125rem]">
          {/* ログイン機能はMVPで作らないため、デモ用の表示 */}
          <p className="text-h2">{SCHOOL_NAME} 丸山 さくら</p>
          <Image src="/icons/avatar.svg" alt="" width={50} height={50} className="size-[3.125rem]" />
        </div>
      </div>
    </header>
  );
}
