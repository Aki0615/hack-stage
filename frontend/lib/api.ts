import type { ImportResult, StopCandidate, RoutePlan } from "./types";
import { SCHOOL_NAME } from "./steps";
import type { LatLng } from "./school";
import importMock from "@/mocks/import.json";
import stopsMock from "@/mocks/stops.json";
import routesMock from "@/mocks/routes.json";
import noticeMock from "@/mocks/notice.json";

const API = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// バックエンドを呼ぶ。つながらないときも、先生が読める文章のエラーにする
async function request(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API}${path}`, init);
  } catch {
    throw new Error("サーバーにつながりませんでした。少し待ってから、もう一度お試しください");
  }
}

// エラーのときは、バックエンドが返した文章（detail）を投げる
async function checkError(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : "通信に失敗しました。もう一度お試しください");
  }
}

// ダミーのときに少し待たせる（読み込み中の表示を確認できるように）
function wait() {
  return new Promise((resolve) => setTimeout(resolve, 600));
}

// school：学校の位置（先生の現在地）
export async function createPlan(busCount: number, capacity: number, school: LatLng): Promise<string> {
  if (USE_MOCK) { return "mock-plan"; }
  const res = await request("/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bus_count: busCount, bus_capacity: capacity, school_name: SCHOOL_NAME, school_lat: school.lat, school_lng: school.lng }),
  });
  await checkError(res);
  const data = await res.json();
  return data.id;
}

export async function uploadCsv(planId: string, file: File): Promise<ImportResult> {
  if (USE_MOCK) { await wait(); return importMock as ImportResult; }
  const form = new FormData();
  form.append("file", file);
  const res = await request(`/plans/${planId}/csv`, { method: "POST", body: form });
  await checkError(res);
  return res.json();
}

export async function generateStops(planId: string): Promise<StopCandidate[]> {
  if (USE_MOCK) { await wait(); return stopsMock as StopCandidate[]; }
  const res = await request(`/plans/${planId}/stops/generate`, { method: "POST" });
  await checkError(res);
  const data = await res.json();
  return data.stops;
}

export async function generateRoutes(planId: string): Promise<RoutePlan[]> {
  if (USE_MOCK) { await wait(); return routesMock as RoutePlan[]; }
  const res = await request(`/plans/${planId}/routes/generate`, { method: "POST" });
  await checkError(res);
  return res.json();
}

// routeId：先生がルート比較で選んだ案
export async function generateNotice(planId: string, routeId: string): Promise<string> {
  if (USE_MOCK) { await wait(); return noticeMock.notice; }
  const res = await request(`/plans/${planId}/notice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ route_id: routeId }),
  });
  await checkError(res);
  const data = await res.json();
  return data.notice;
}
