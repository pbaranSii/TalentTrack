import type { CreateInvitationInput } from '../../api';
import { api, apiMutations } from '../../api';
import type { InvitationStatus } from '../../types';
import { enqueue } from '../syncQueue';
import { getTable, setTable } from '../storage';
import { genId, nowIso } from '../utils';

export interface InvitationRecord {
  id: string;
  invitationDate: string;
  month?: number | null;
  teamId?: string | null;
  status: InvitationStatus;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdByUserId?: string;
  origin: 'REMOTE' | 'LOCAL';

  // link to existing player (optional)
  playerId?: string | null;

  // freeform snapshot (for invitations created before player exists)
  playerFirstName?: string | null;
  playerLastName?: string | null;
  playerBirthYear?: number | null;
  playerBirthDate?: string | null;
  playerClubName?: string | null;
  playerPositionId?: string | null;
  playerDominantFootId?: string | null;

  parentFirstName?: string | null;
  parentLastName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string | null;

  plannedObservationDate?: string | null;
  plannedMatchDate?: string | null;
};

const TABLE = 'invitations' as const;

function normalize(list: InvitationRecord[]): InvitationRecord[] {
  return list
    .slice()
    .sort((a, b) => (b.invitationDate ?? '').localeCompare(a.invitationDate ?? '') || (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

function upsert(list: InvitationRecord[], item: InvitationRecord): InvitationRecord[] {
  const idx = list.findIndex((i) => i.id === item.id);
  if (idx === -1) return normalize([...list, item]);
  const next = list.slice();
  next[idx] = { ...next[idx], ...item };
  return normalize(next);
}

export const invitationsRepo = {
  getAllLocal(): InvitationRecord[] {
    const current = getTable<InvitationRecord[]>(TABLE);
    return Array.isArray(current) ? normalize(current) : [];
  },

  getByPlayerIdLocal(playerId: string): InvitationRecord[] {
    return this.getAllLocal().filter((i) => (i.playerId ?? null) === playerId);
  },

  setAllLocal(list: InvitationRecord[]): void {
    setTable(TABLE, normalize(list));
  },

  async refreshFromRemote(playerId?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const remote = await api.getInvitations(playerId);
      const remoteRecords: InvitationRecord[] = remote.map((r) => ({
        id: r.id,
        playerId: r.playerId,
        invitationDate: r.invitationDate,
        month: r.month ?? null,
        teamId: r.teamId ?? null,
        status: r.status,
        comment: r.comment ?? null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        origin: 'REMOTE',
      }));
      if (playerId) {
        const current = this.getAllLocal();
        const keepLocal = current.filter((i) => i.origin === 'LOCAL' || (i.playerId ?? null) !== playerId);
        this.setAllLocal([...keepLocal, ...remoteRecords]);
      } else {
        const current = this.getAllLocal();
        const keepLocal = current.filter((i) => i.origin === 'LOCAL');
        this.setAllLocal([...keepLocal, ...remoteRecords]);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  async createLocalFirst(input: CreateInvitationInput, createdByUserId?: string): Promise<InvitationRecord> {
    const local: InvitationRecord = {
      id: genId('inv'),
      invitationDate: input.invitationDate,
      month: input.month ?? null,
      teamId: input.teamId ?? null,
      status: input.status,
      comment: input.comment ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdByUserId,
      origin: 'LOCAL',
      playerId: input.playerId,
    };

    this.setAllLocal(upsert(this.getAllLocal(), local));
    enqueue('invitations', 'CREATE', { input, localId: local.id, createdByUserId, kind: 'EXISTING_PLAYER' });

    try {
      const created = await apiMutations.createInvitation(input);
      const list = this.getAllLocal().filter((i) => i.id !== local.id);
      const createdRecord: InvitationRecord = {
        id: created.id,
        playerId: created.playerId,
        invitationDate: created.invitationDate,
        month: created.month ?? null,
        teamId: created.teamId ?? null,
        status: created.status,
        comment: created.comment ?? null,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        createdByUserId,
        origin: 'REMOTE',
      };
      this.setAllLocal(upsert(list, createdRecord));
      return createdRecord;
    } catch {
      return local;
    }
  },

  async createFreeformLocalFirst(
    input: CreateFreeformInvitationInput,
    createdByUserId?: string
  ): Promise<InvitationRecord> {
    const local: InvitationRecord = {
      id: genId('inv'),
      invitationDate: input.invitationDate,
      month: input.month ?? null,
      teamId: input.teamId ?? null,
      status: input.status,
      comment: input.comment ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdByUserId,
      origin: 'LOCAL',

      playerId: null,
      playerFirstName: input.playerFirstName,
      playerLastName: input.playerLastName,
      playerBirthYear: input.playerBirthYear ?? null,
      playerBirthDate: input.playerBirthDate ?? null,
      playerClubName: input.playerClubName ?? null,
      playerPositionId: input.playerPositionId ?? null,
      playerDominantFootId: input.playerDominantFootId ?? null,
      parentFirstName: input.parentFirstName ?? null,
      parentLastName: input.parentLastName ?? null,
      parentPhone: input.parentPhone ?? null,
      parentEmail: input.parentEmail ?? null,
      plannedObservationDate: input.plannedObservationDate ?? null,
      plannedMatchDate: input.plannedMatchDate ?? null,
    };

    this.setAllLocal(upsert(this.getAllLocal(), local));
    enqueue('invitations', 'CREATE', { input, localId: local.id, createdByUserId, kind: 'FREEFORM' });
    return local;
  },
};

export interface CreateFreeformInvitationInput {
  invitationDate: string;
  month?: number | null;
  teamId?: string | null;
  status: InvitationStatus;
  comment?: string | null;

  playerFirstName: string;
  playerLastName: string;
  playerBirthYear?: number | null;
  playerBirthDate?: string | null;
  playerClubName?: string | null;
  playerPositionId?: string | null;
  playerDominantFootId?: string | null;
  parentFirstName?: string | null;
  parentLastName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string | null;
  plannedObservationDate?: string | null;
  plannedMatchDate?: string | null;
}

