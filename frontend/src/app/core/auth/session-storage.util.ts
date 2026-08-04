export function readStoredValue<T>(storageKey: string): T | null {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function writeStoredValue<T>(storageKey: string, value: T): void {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

export function clearStoredValue(storageKey: string): void {
  localStorage.removeItem(storageKey);
}
