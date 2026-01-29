import type { Player } from '../models';

export interface CreatePlayerInput {
  firstName: string;
  lastName: string;
  birthYear?: number;
  birthDate?: string | null;
  dominantFootId: string;
  mainPositionId: string;
  clubId?: string | null;
}

export type UpdatePlayerInput = Partial<CreatePlayerInput>;
