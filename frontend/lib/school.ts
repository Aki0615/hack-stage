import { loadData } from "./storage";

export type LatLng = { lat: number; lng: number };

// 現在地が取れなかったときに使う学校の位置（名古屋駅付近）
export const DEFAULT_SCHOOL: LatLng = { lat: 35.1709, lng: 136.8815 };

// 現在地が取れなかった理由（先生向けの文章）
const LOCATION_ERRORS: Record<number, string> = {
  1: "ブラウザで位置情報が許可されていません。アドレスバー左のアイコンから許可してください",
  2: "現在地がわかりませんでした。Macの「位置情報サービス」でブラウザを許可してください",
  3: "現在地の確認に時間がかかりすぎました",
};

// ブラウザから現在地を取る（取れなかったときは、その理由を返す）
export function getCurrentPosition(): Promise<{ pos: LatLng } | { reason: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ reason: "このブラウザでは現在地を使えません" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ pos: { lat: p.coords.latitude, lng: p.coords.longitude } }),
      (e) => resolve({ reason: LOCATION_ERRORS[e.code] ?? "現在地を取得できませんでした" }),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  });
}

// 取り込み画面で決めた学校の位置（なければ既定の位置）
export function loadSchool(): LatLng {
  return loadData("school") ?? DEFAULT_SCHOOL;
}
