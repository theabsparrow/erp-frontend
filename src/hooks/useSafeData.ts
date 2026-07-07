// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(value: any[] | null | undefined): boolean {
  return !value || value.length === 0;
}
