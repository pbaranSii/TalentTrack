export function nowIso(): string {
  return new Date().toISOString();
}

export function genId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function sortByString(a: string, b: string): number {
  return a.localeCompare(b, 'pl', { sensitivity: 'base' });
}

