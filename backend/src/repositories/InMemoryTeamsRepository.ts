import type { Team } from '../models';
import type { CreateTeamInput, UpdateTeamInput } from '../dto/teams';

function uuid(): string {
  return `team_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryTeamsRepository {
  private teams: Team[] = [];

  constructor(initial: Team[] = []) {
    this.teams = initial;
  }

  findAll(): Promise<Team[]> {
    return Promise.resolve([...this.teams]);
  }

  findById(id: string): Promise<Team | null> {
    return Promise.resolve(this.teams.find((t) => t.id === id) ?? null);
  }

  findByClubId(clubId: string): Promise<Team[]> {
    return Promise.resolve(this.teams.filter((t) => t.clubId === clubId));
  }

  async create(input: CreateTeamInput): Promise<Team> {
    const now = new Date().toISOString();
    const team: Team = {
      id: uuid(),
      clubId: input.clubId,
      name: input.name,
      categoryId: input.categoryId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.teams.push(team);
    return team;
  }

  async update(id: string, input: UpdateTeamInput): Promise<Team | null> {
    const idx = this.teams.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.teams[idx] = { ...this.teams[idx], ...input, updatedAt: now };
    return this.teams[idx];
  }
}
