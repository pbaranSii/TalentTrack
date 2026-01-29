import type { Club } from '../models';
import type { CreateClubInput, UpdateClubInput } from '../dto/clubs';

function uuid(): string {
  return `club_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryClubsRepository {
  private clubs: Club[] = [];

  constructor(initial: Club[] = []) {
    this.clubs = initial;
  }

  findAll(): Promise<Club[]> {
    return Promise.resolve([...this.clubs]);
  }

  findById(id: string): Promise<Club | null> {
    return Promise.resolve(this.clubs.find((c) => c.id === id) ?? null);
  }

  async create(input: CreateClubInput): Promise<Club> {
    const club: Club = {
      id: uuid(),
      name: input.name,
    };
    this.clubs.push(club);
    return club;
  }

  async update(id: string, input: UpdateClubInput): Promise<Club | null> {
    const idx = this.clubs.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.clubs[idx] = { ...this.clubs[idx], ...input };
    return this.clubs[idx];
  }
}
