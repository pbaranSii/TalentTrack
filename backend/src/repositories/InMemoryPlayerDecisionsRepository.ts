import type { PlayerDecision } from '../models';
import type { CreatePlayerDecisionInput } from '../dto/decisions';

function uuid(): string {
  return `dec_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryPlayerDecisionsRepository {
  private decisions: PlayerDecision[] = [];

  constructor(initial: PlayerDecision[] = []) {
    this.decisions = initial;
  }

  findAll(): Promise<PlayerDecision[]> {
    return Promise.resolve([...this.decisions]);
  }

  findById(id: string): Promise<PlayerDecision | null> {
    return Promise.resolve(this.decisions.find((d) => d.id === id) ?? null);
  }

  findByPlayerId(playerId: string): Promise<PlayerDecision[]> {
    return Promise.resolve(
      this.decisions
        .filter((d) => d.playerId === playerId)
        .sort((a, b) => b.decisionDate.localeCompare(a.decisionDate))
    );
  }

  findLatestByPlayerId(playerId: string): Promise<PlayerDecision | null> {
    return this.findByPlayerId(playerId).then((arr) => arr[0] ?? null);
  }

  async create(input: CreatePlayerDecisionInput): Promise<PlayerDecision> {
    const now = new Date().toISOString();
    const decision: PlayerDecision = {
      id: uuid(),
      playerId: input.playerId,
      decisionType: input.decisionType,
      decisionDate: input.decisionDate,
      comment: input.comment ?? null,
      createdAt: now,
    };
    this.decisions.push(decision);
    return decision;
  }
}
