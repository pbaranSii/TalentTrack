import type { InvitationStatus } from '../models';

export interface CreateInvitationInput {
  playerId: string;
  invitationDate: string;
  month?: number | null;
  teamId?: string | null;
  status: InvitationStatus;
  comment?: string | null;
}

export type UpdateInvitationInput = Partial<CreateInvitationInput>;
