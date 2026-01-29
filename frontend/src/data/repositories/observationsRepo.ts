import type { CreateObservationInput } from '../../api';
import { api, apiMutations } from '../../api';
import type { Observation } from '../../types';
import { enqueue } from '../syncQueue';
import { getTable, setTable } from '../storage';
import { genId, nowIso } from '../utils';

type ObservationRecord = Observation & {
  createdByUserId?: string;
};

const TABLE = 'observations' as const;

function normalize(list: ObservationRecord[]): ObservationRecord[] {
  return list
    .slice()
    .sort((a, b) => (b.observationDate ?? '').localeCompare(a.observationDate ?? '') || (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

function upsert(list: ObservationRecord[], item: ObservationRecord): ObservationRecord[] {
  const idx = list.findIndex((o) => o.id === item.id);
  if (idx === -1) return normalize([...list, item]);
  const next = list.slice();
  next[idx] = { ...next[idx], ...item };
  return normalize(next);
}

export const observationsRepo = {
  getAllLocal(): ObservationRecord[] {
    const current = getTable<ObservationRecord[]>(TABLE);
    return Array.isArray(current) ? normalize(current) : [];
  },

  getByPlayerIdLocal(playerId: string): ObservationRecord[] {
    return this.getAllLocal().filter((o) => o.playerId === playerId);
  },

  setAllLocal(list: ObservationRecord[]): void {
    setTable(TABLE, normalize(list));
  },

  async refreshFromRemote(playerId?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const remote = await api.getObservations(playerId);
      if (playerId) {
        const current = this.getAllLocal();
        const withoutPlayer = current.filter((o) => o.playerId !== playerId);
        this.setAllLocal([...withoutPlayer, ...remote]);
      } else {
        this.setAllLocal(remote);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  async createLocalFirst(input: CreateObservationInput, createdByUserId?: string): Promise<ObservationRecord> {
    const local: ObservationRecord = {
      id: genId('obs'),
      playerId: input.playerId,
      observationDate: input.observationDate,
      observationType: input.observationType,
      sourceId: input.sourceId ?? null,
      matchId: input.matchId ?? null,
      teamContext: input.teamContext ?? null,
      potentialGrade: input.potentialGrade ?? null,
      potentialNow: input.potentialNow ?? null,
      potentialFuture: input.potentialFuture ?? null,
      comment: input.comment ?? null,
      notes: input.notes ?? null,
      scoutId: input.scoutId ?? null,
      createdOffline: true,
      syncStatus: 'LOCAL',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdByUserId,
    };

    this.setAllLocal(upsert(this.getAllLocal(), local));
    enqueue('observations', 'CREATE', { input, localId: local.id, createdByUserId });

    try {
      const created = await apiMutations.createObservation({
        ...input,
        createdOffline: false,
        syncStatus: 'SYNCED',
      });
      // Replace local temp record with server record
      const list = this.getAllLocal().filter((o) => o.id !== local.id);
      this.setAllLocal(upsert(list, { ...created, createdByUserId }));
      return { ...created, createdByUserId };
    } catch {
      return local;
    }
  },
};

