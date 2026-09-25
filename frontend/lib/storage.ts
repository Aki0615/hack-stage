// 保存する（何でも文字に変えて保存する）
export function saveData(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

// 読み出す（なければ null）
export function loadData(key: string) {
  const text = sessionStorage.getItem(key);
  return text ? JSON.parse(text) : null;
}
