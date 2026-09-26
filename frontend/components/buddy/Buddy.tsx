import Image from "next/image";

// Figma「そらまる」：ノーマル（192:413）・完成時（192:415）・完成時の影付き（192:414）
// 完成時は、雲の体の上に笑った目を重ねる。目の位置と大きさは Figma の座標を体の大きさに対する割合にしたもの
type Props = {
  text: string;                  // 吹き出しのセリフ
  mood?: "normal" | "happy";     // happy：何かが完了したとき
  shadow?: boolean;              // 右下に置くときは、足もとに影のある絵を使う
  className?: string;            // 置く場所に合わせた指定
};

export function Buddy({ text, mood = "normal", shadow = false, className = "" }: Props) {
  return (
    <aside aria-live="polite" className={`hidden min-w-0 items-center gap-3 md:flex ${className}`}>
      {/* 吹き出し（しっぽはキャラのほうを向ける） */}
      <p className="relative min-w-0 max-w-[22rem] rounded-field border-2 border-black bg-surface px-4 py-2 text-h5">
        <span className="block text-caption font-bold text-text-gray">そらまる</span>
        {text}
        <span aria-hidden className="absolute -right-[0.4375rem] top-1/2 size-3 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-black bg-surface" />
      </p>

      {shadow && mood === "happy" ? (
        // 影のぶん絵が縦に長い（927×695）。雲の大きさがほかと同じになるよう、高さを 5rem × 695/631 にする
        <div className="relative aspect-[927.389/695] h-[5.5rem] shrink-0 animate-float motion-reduce:animate-none">
          <Image src="/buddy/happy-shadow.svg" alt="" fill />
        </div>
      ) : (
        // 927×631 の比率のまま、高さ5remで表示
        <div className="relative aspect-[927.389/631.413] h-20 shrink-0 animate-float motion-reduce:animate-none">
          {mood === "normal" ? (
            <Image src="/buddy/normal.svg" alt="" fill />
          ) : (
            <>
              <Image src="/buddy/body.svg" alt="" fill />
              <div className="absolute left-[37.26%] top-[34.77%] h-[4.771%] w-[5.391%]">
                <Image src="/buddy/eye-left.svg" alt="" fill />
              </div>
              <div className="absolute left-[58.72%] top-[34.77%] h-[4.771%] w-[5.391%]">
                <Image src="/buddy/eye-right.svg" alt="" fill />
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
