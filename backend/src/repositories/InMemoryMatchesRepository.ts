import type { Match } from '../models';
import type { CreateMatchInput, UpdateMatchInput } from '../dto/matches';

function uuid(): string {
  return `match_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryMatchesRepository {
  private matches: Match[] = [];

  constructor(initial: Match[] = []) {
    this.matches = initial;
  }

  findAll(): Promise<Match[]> {
    return Promise.resolve([...this.matches]);
  }

  findById(id: string): Promise<Match | null> {
    return Promise.resolve(this.matches.find((m) => m.id === id) ?? null);
  }

  async create(input: CreateMatchInput): Promise<Match> {
    const now = new Date().toISOString();
    const match: Match = {
      id: uuid(),
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
      createdAt: now,
      updatedAt: now,
    };
    this.matches.push(match);
    return match;
  }

  async update(id: string, input: UpdateMatchInput): Promise<Match | null> {
    const idx = this.matches.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.matches[idx] = { ...this.matches[idx], ...input, updatedAt: now };
    return this.matches[idx];
  }
}
