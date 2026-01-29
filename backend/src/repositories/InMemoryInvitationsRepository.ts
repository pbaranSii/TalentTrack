import type { Invitation } from '../models';
import type { CreateInvitationInput, UpdateInvitationInput } from '../dto/invitations';

function uuid(): string {
  return `inv_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryInvitationsRepository {
  private invitations: Invitation[] = [];

  constructor(initial: Invitation[] = []) {
    this.invitations = initial;
  }

  findAll(): Promise<Invitation[]> {
    return Promise.resolve([...this.invitations]);
  }

  findById(id: string): Promise<Invitation | null> {
    return Promise.resolve(this.invitations.find((i) => i.id === id) ?? null);
  }

  findByPlayerId(playerId: string): Promise<Invitation[]> {
    return Promise.resolve(
      this.invitations
        .filter((i) => i.playerId === playerId)
        .sort((a, b) => b.invitationDate.localeCompare(a.invitationDate))
    );
  }

  async create(input: CreateInvitationInput): Promise<Invitation> {
    const now = new Date().toISOString();
    const invitation: Invitation = {
      id: uuid(),
      playerId: input.playerId,
      invitationDate: input.invitationDate,
      month: input.month ?? null,
      teamId: input.teamId ?? null,
      status: input.status,
      comment: input.comment ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.invitations.push(invitation);
    return invitation;
  }

  async update(id: string, input: UpdateInvitationInput): Promise<Invitation | null> {
    const idx = this.invitations.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.invitations[idx] = { ...this.invitations[idx], ...input, updatedAt: now };
    return this.invitations[idx];
  }
}
