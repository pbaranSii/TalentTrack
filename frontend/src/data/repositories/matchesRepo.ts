import type { CreateMatchInput } from '../../api';
import { api, apiMutations } from '../../api';
import type { Match } from '../../types';
import { enqueue } from '../syncQueue';
import { getTable, setTable } from '../storage';
import { genId, nowIso, sortByString } from '../utils';

type MatchRecord = Match & {
  createdByUserId?: string;
};

const TABLE = 'matches' as const;

function normalize(list: MatchRecord[]): MatchRecord[] {
  // newest first; fallback to team labels
  return list
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || sortByString(a.teamHome, b.teamHome));
}

function upsert(list: MatchRecord[], item: MatchRecord): MatchRecord[] {
  const idx = list.findIndex((m) => m.id === item.id);
  if (idx === -1) return normalize([...list, item]);
  const next = list.slice();
  next[idx] = { ...next[idx], ...item };
  return normalize(next);
}

export const matchesRepo = {
  getAllLocal(): MatchRecord[] {
    const current = getTable<MatchRecord[]>(TABLE);
    return Array.isArray(current) ? normalize(current) : [];
  },

  getByIdLocal(id: string): MatchRecord | null {
    return this.getAllLocal().find((m) => m.id === id) ?? null;
  },

  setAllLocal(list: MatchRecord[]): void {
    setTable(TABLE, normalize(list));
  },

  async refreshFromRemote(): Promise<{ ok: boolean; error?: string }> {
    try {
      const remote = await api.getMatches();
      this.setAllLocal(remote);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  async createLocalFirst(input: CreateMatchInput, createdByUserId?: string): Promise<MatchRecord> {
    const local: MatchRecord = {
      id: genId('match'),
      matchType: input.matchType,
      date: input.date,
      month: input.month,
      location: input.location,
      teamHome: input.teamHome,
      teamAway: input.teamAway,
      categoryId: input.categoryId ?? null,
      leagueRankId: input.leagueRankId ?? null,
      result: input.result ?? null,
      notes: input.notes ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdByUserId,
    };

    this.setAllLocal(upsert(this.getAllLocal(), local));
    enqueue('matches', 'CREATE', { input, localId: local.id, createdByUserId });

    try {
      const created = await apiMutations.createMatch(input);
      const list = this.getAllLocal().filter((m) => m.id !== local.id);
      this.setAllLocal(upsert(list, { ...created, createdByUserId }));
      return { ...created, createdByUserId };
    } catch {
      return local;
    }
  },
};

