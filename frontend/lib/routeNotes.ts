import type { RoutePlan } from "./types";

// 3つの案の数字を比べて、「良い点」「気になる点」の文章を作る
// 方針ごとに、先に確かめる項目の順番を変える（効率重視なら所要時間から）
export function routeNotes(plan: RoutePlan, plans: RoutePlan[]) {
  const m = plan.metrics;
  const all = plans.map((p) => p.metrics);
  const isMin = (key: "total_time" | "walk_distance_spread" | "average_walk_distance" | "safety_check_count") =>
    plans.length > 1 && m[key] === Math.min(...all.map((x) => x[key]));
  const isMax = (key: "total_time" | "walk_distance_spread" | "safety_check_count") =>
    plans.length > 1 && m[key] === Math.max(...all.map((x) => x[key]));

  const goods: Record<string, string | null> = {
    time: isMin("total_time") ? `所要時間が3案で1番短い（${m.total_time}分）` : null,
    spread: isMin("walk_distance_spread") ? "子どもごとの歩く距離の差が1番小さい" : null,
    safety: m.safety_check_count === 0 ? "現地確認が必要な場所がない"
      : isMin("safety_check_count") ? "現地確認が必要な場所が1番少ない" : null,
    walk: isMin("average_walk_distance") ? `平均の徒歩距離が1番短い（${m.average_walk_distance}m）` : null,
  };

  // 400mを超えて歩く子がいる停留所（一番遠いもの）
  const farStop = [...plan.stops].sort((a, b) => b.max_walk_m - a.max_walk_m)[0];
  const concerns: Record<string, string | null> = {
    walk: !m.all_within_400m && farStop ? `停留所${farStop.label}を使う子の歩く距離が長い（最大${farStop.max_walk_m}m）` : null,
    safety: m.safety_check_count > 0 && isMax("safety_check_count") ? `現地確認が必要な場所が${m.safety_check_count}か所ある` : null,
    time: isMax("total_time") ? `所要時間が3案で1番長い（${m.total_time}分）` : null,
    spread: isMax("walk_distance_spread") ? "子どもごとの歩く距離の差が1番大きい" : null,
  };

  const order = {
    efficiency: ["time", "walk", "spread", "safety"],
    fairness: ["spread", "walk", "time", "safety"],
    safety: ["safety", "walk", "spread", "time"],
  }[plan.strategy];

  const good = order.map((k) => goods[k]).find(Boolean) ?? plan.summary;
  const concern = ["walk", "safety", "time", "spread"].map((k) => concerns[k]).find(Boolean) ?? "特にありません";
  return { good, concern };
}
