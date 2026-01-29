export type StoredEntityName =
  | 'players'
  | 'matches'
  | 'observations'
  | 'invitations'
  | 'dictionaries'
  | 'clubs'
  | 'teams'
  | 'persons'
  | 'meta';

export interface LocalDbShapeV1 {
  version: 1;
  updatedAt: string;
  tables: Record<StoredEntityName, unknown>;
}

const DB_KEY = 'tt-db';
const DB_VERSION = 1 as const;

function nowIso() {
  return new Date().toISOString();
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function emptyDb(): LocalDbShapeV1 {
  return {
    version: DB_VERSION,
    updatedAt: nowIso(),
    tables: {
      players: [],
      matches: [],
      observations: [],
      invitations: [],
      dictionaries: [],
      clubs: [],
      teams: [],
      persons: [],
      meta: {
        watchlistPlayerIds: [] as string[],
      },
    },
  };
}

function migrateToLatest(raw: unknown): LocalDbShapeV1 {
  // v1 is the initial version; if anything is malformed, reset safely.
  if (!raw || typeof raw !== 'object') return emptyDb();
  const obj = raw as Partial<LocalDbShapeV1>;
  if (obj.version !== 1 || !obj.tables || typeof obj.tables !== 'object') return emptyDb();

  const base = emptyDb();
  const tables = obj.tables as Record<string, unknown>;
  const merged: LocalDbShapeV1 = {
    ...base,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : base.updatedAt,
    tables: {
      ...base.tables,
      ...tables,
      meta: {
        ...(base.tables.meta as object),
        ...(tables.meta && typeof tables.meta === 'object' ? (tables.meta as object) : {}),
      },
    },
  };
  return merged;
}

export function readDb(): LocalDbShapeV1 {
  const parsed = safeParseJson<unknown>(window.localStorage.getItem(DB_KEY));
  return migrateToLatest(parsed);
}

export function writeDb(db: LocalDbShapeV1): void {
  const next: LocalDbShapeV1 = { ...db, updatedAt: nowIso() };
  window.localStorage.setItem(DB_KEY, JSON.stringify(next));
}

export function resetDb(): void {
  writeDb(emptyDb());
}

export function getTable<T>(name: StoredEntityName): T {
  const db = readDb();
  return db.tables[name] as T;
}

export function setTable<T>(name: StoredEntityName, value: T): void {
  const db = readDb();
  db.tables[name] = value as unknown;
  writeDb(db);
}

export function updateTable<T>(name: StoredEntityName, updater: (prev: T) => T): void {
  const prev = getTable<T>(name);
  setTable<T>(name, updater(prev));
}

export function getMeta(): { watchlistPlayerIds: string[] } {
  const meta = getTable<{ watchlistPlayerIds?: unknown }>('meta');
  const raw = meta?.watchlistPlayerIds;
  return {
    watchlistPlayerIds: Array.isArray(raw) ? (raw.filter((x) => typeof x === 'string') as string[]) : [],
  };
}

export function setWatchlistPlayerIds(ids: string[]): void {
  updateTable('meta', (prev: unknown) => {
    const p = prev && typeof prev === 'object' ? (prev as Record<string, unknown>) : {};
    return {
      ...p,
      watchlistPlayerIds: Array.from(new Set(ids)).filter((x) => typeof x === 'string'),
    };
  });
}

