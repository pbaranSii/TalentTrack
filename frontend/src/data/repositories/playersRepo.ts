import type { CreatePlayerInput } from '../../api';
import { api, apiMutations } from '../../api';
import type { Player } from '../../types';
import { enqueue } from '../syncQueue';
import { getTable, setTable } from '../storage';
import { genId, nowIso, sortByString } from '../utils';

type PlayerRecord = Player & {
  createdByUserId?: string;
};

const TABLE = 'players' as const;

function normalize(list: PlayerRecord[]): PlayerRecord[] {
  return list
    .slice()
    .sort((a, b) => sortByString(a.lastName, b.lastName) || sortByString(a.firstName, b.firstName));
}

function upsert(list: PlayerRecord[], item: PlayerRecord): PlayerRecord[] {
  const idx = list.findIndex((p) => p.id === item.id);
  if (idx === -1) return normalize([...list, item]);
  const next = list.slice();
  next[idx] = { ...next[idx], ...item };
  return normalize(next);
}

export const playersRepo = {
  getAllLocal(): PlayerRecord[] {
    const current = getTable<PlayerRecord[]>(TABLE);
    return Array.isArray(current) ? normalize(current) : [];
  },

  getByIdLocal(id: string): PlayerRecord | null {
    return this.getAllLocal().find((p) => p.id === id) ?? null;
  },

  setAllLocal(list: PlayerRecord[]): void {
    setTable(TABLE, normalize(list));
  },

  async refreshFromRemote(): Promise<{ ok: boolean; error?: string }> {
    try {
      const remote = await api.getPlayers();
      this.setAllLocal(remote);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  async refreshOneFromRemote(id: string): Promise<{ ok: boolean; error?: string; player?: PlayerRecord }> {
    try {
      const remote = await api.getPlayer(id);
      const current = this.getAllLocal();
      const next = upsert(current, remote);
      this.setAllLocal(next);
      return { ok: true, player: remote };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  async createLocalFirst(input: CreatePlayerInput, createdByUserId?: string): Promise<PlayerRecord> {
    const local: PlayerRecord = {
      id: genId('player'),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      birthYear: input.birthYear,
      birthDate: input.birthDate ?? null,
      dominantFootId: input.dominantFootId,
      mainPositionId: input.mainPositionId,
      clubId: input.clubId ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdByUserId,
    };

    const current = this.getAllLocal();
    this.setAllLocal(upsert(current, local));
    enqueue('players', 'CREATE', { input, localId: local.id, createdByUserId });

    // Best-effort remote create (non-blocking for UX).
    try {
      const created = await apiMutations.createPlayer(input);
      // Replace local temp record with server id but keep createdByUserId.
      const list = this.getAllLocal().filter((p) => p.id !== local.id);
      this.setAllLocal(upsert(list, { ...created, createdByUserId }));
      return { ...created, createdByUserId };
    } catch {
      return local;
    }
  },

  async updateLocalFirst(id: string, patch: Partial<CreatePlayerInput>): Promise<PlayerRecord | null> {
    const current = this.getAllLocal();
    const existing = current.find((p) => p.id === id);
    if (!existing) return null;
    const updated: PlayerRecord = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    };
    this.setAllLocal(upsert(current, updated));
    enqueue('players', 'UPDATE', { id, patch });
    try {
      const remote = await apiMutations.updatePlayer(id, patch);
      this.setAllLocal(upsert(this.getAllLocal(), remote));
      return remote;
    } catch {
      return updated;
    }
  },
};

