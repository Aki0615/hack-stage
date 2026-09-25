import type { Strategy } from "./types";

// ルート案の方針ごとの名前と色（色はデザイントークンのもの）
// bg は Tailwind のクラス、colorVar は地図の線の色に使うCSS変数
export const STRATEGY_INFO: Record<Strategy, { name: string; bg: string; colorVar: string }> = {
  efficiency: { name: "効率重視", bg: "bg-info", colorVar: "--color-info" },
  fairness: { name: "公平性重視", bg: "bg-accent", colorVar: "--color-accent" },
  safety: { name: "安全重視", bg: "bg-ok", colorVar: "--color-ok" },
};

// タブに並べる順番
export const STRATEGY_ORDER: Strategy[] = ["efficiency", "fairness", "safety"];
