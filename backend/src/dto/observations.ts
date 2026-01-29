import type {
  ObservationType,
  PotentialGrade,
  SyncStatus,
} from '../models';

export interface CreateObservationInput {
  playerId: string;
  observationDate: string;
  observationType: ObservationType;
  sourceId?: string | null;
  matchId?: string | null;
  teamContext?: string | null;
  potentialGrade?: PotentialGrade | null;
  potentialNow?: number | null;
  potentialFuture?: number | null;
  comment?: string | null;
  notes?: string | null;
  scoutId?: string | null;
  createdOffline?: boolean;
  syncStatus?: SyncStatus;
}

export type UpdateObservationInput = Partial<CreateObservationInput>;
