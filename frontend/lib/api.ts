import type { ImportResult, StopCandidate, RoutePlan } from "./types";
import importMock from "@/mocks/import.json";
import stopsMock from "@/mocks/stops.json";
import routesMock from "@/mocks/routes.json";

const API = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// エラーのときは、バックエンドが返した文章（detail）を投げる
async function checkError(res: Response) {
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.detail || "通信に失敗しました。もう一度お試しください");
  }
}

// ダミーのときに少し待たせる（読み込み中の表示を確認できるように）
function wait() {
  return new Promise((resolve) => setTimeout(resolve, 600));
}

export async function createPlan(busCount: number, capacity: number): Promise<string> {
  if (USE_MOCK) { return "mock-plan"; }
  const res = await fetch(`${API}/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bus_count: busCount, bus_capacity: capacity }),
  });
  await checkError(res);
  const data = await res.json();
  return data.id;
}

export async function uploadCsv(planId: string, file: File): Promise<ImportResult> {
  if (USE_MOCK) { await wait(); return importMock as ImportResult; }
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/plans/${planId}/csv`, { method: "POST", body: form });
  await checkError(res);
  return res.json();
}

export async function generateStops(planId: string): Promise<StopCandidate[]> {
  if (USE_MOCK) { await wait(); return stopsMock as StopCandidate[]; }
  const res = await fetch(`${API}/plans/${planId}/stops/generate`, { method: "POST" });
  await checkError(res);
  return res.json();
}

export async function generateRoutes(planId: string): Promise<RoutePlan[]> {
  if (USE_MOCK) { await wait(); return routesMock as RoutePlan[]; }
  const res = await fetch(`${API}/plans/${planId}/routes/generate`, { method: "POST" });
  await checkError(res);
  return res.json();
}
