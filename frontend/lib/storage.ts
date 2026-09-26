// 保存する（何でも文字に変えて保存する）
export function saveData(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

// 読み出す（なければ null）
export function loadData(key: string) {
  const text = sessionStorage.getItem(key);
  return text ? JSON.parse(text) : null;
}

// 全部消す（最初からやり直すとき）
export function clearData() {
  sessionStorage.clear();
}

// 必要なデータがすべて保存されているか
export function hasData(...keys: string[]) {
  return keys.every((key) => sessionStorage.getItem(key) !== null);
}
