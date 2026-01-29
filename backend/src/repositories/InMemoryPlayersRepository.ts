import type { Player } from '../models';
import type { CreatePlayerInput, UpdatePlayerInput } from '../dto/players';

function uuid(): string {
  return `player_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryPlayersRepository {
  private players: Player[] = [];

  constructor(initial: Player[] = []) {
    this.players = initial;
  }

  findAll(): Promise<Player[]> {
    return Promise.resolve([...this.players]);
  }

  findById(id: string): Promise<Player | null> {
    return Promise.resolve(this.players.find((p) => p.id === id) ?? null);
  }

  async create(input: CreatePlayerInput): Promise<Player> {
    const now = new Date().toISOString();
    const player: Player = {
      id: uuid(),
      firstName: input.firstName,
      lastName: input.lastName,
      birthYear: input.birthYear,
      birthDate: input.birthDate ?? null,
      dominantFootId: input.dominantFootId,
      mainPositionId: input.mainPositionId,
      clubId: input.clubId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.players.push(player);
    return player;
  }

  async update(id: string, input: UpdatePlayerInput): Promise<Player | null> {
    const idx = this.players.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.players[idx] = { ...this.players[idx], ...input, updatedAt: now };
    return this.players[idx];
  }
}
