import type { PlayerParent } from '../models';

export class InMemoryPlayerParentsRepository {
  private relations: PlayerParent[] = [];

  findByPlayerId(playerId: string): Promise<PlayerParent[]> {
    return Promise.resolve(this.relations.filter((r) => r.playerId === playerId));
  }

  findByPersonId(personId: string): Promise<PlayerParent[]> {
    return Promise.resolve(this.relations.filter((r) => r.personId === personId));
  }

  async add(playerId: string, personId: string): Promise<PlayerParent> {
    const existing = this.relations.find((r) => r.playerId === playerId && r.personId === personId);
    if (existing) return existing;
    const relation: PlayerParent = { playerId, personId };
    this.relations.push(relation);
    return relation;
  }

  async remove(playerId: string, personId: string): Promise<boolean> {
    const idx = this.relations.findIndex((r) => r.playerId === playerId && r.personId === personId);
    if (idx === -1) return false;
    this.relations.splice(idx, 1);
    return true;
  }
}
