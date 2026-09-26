"use client";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { clearData } from "@/lib/storage";

// 前の画面のデータがないときに、画面の中身の代わりに出す案内
// （タブを閉じた・途中の画面のURLを直接開いた など）
export function RestartGuide() {
  const router = useRouter();

  // 残っている古いデータを消して、住所の取り込みから始める
  function restart() {
    clearData();
    router.push("/import");
  }

  return (
    <Panel color="warn" title="前の画面のデータが見つかりません"
           description="タブを閉じたり、途中の画面を直接開いたりすると、それまでの入力は消えてしまいます。お手数ですが、住所の取り込みからやり直してください。"
           className="mx-auto w-full max-w-[60rem] gap-8 self-center px-12 py-10">
      <div>
        <Button size="md" onClick={restart}>最初からやり直す</Button>
      </div>
    </Panel>
  );
}
