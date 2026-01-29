import type { Observation } from '../models';
import type { CreateObservationInput, UpdateObservationInput } from '../dto/observations';

function uuid(): string {
  return `obs_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryObservationsRepository {
  private observations: Observation[] = [];

  constructor(initial: Observation[] = []) {
    this.observations = initial;
  }

  findAll(): Promise<Observation[]> {
    return Promise.resolve([...this.observations]);
  }

  findById(id: string): Promise<Observation | null> {
    return Promise.resolve(this.observations.find((o) => o.id === id) ?? null);
  }

  findByPlayerId(playerId: string): Promise<Observation[]> {
    return Promise.resolve(
      this.observations.filter((o) => o.playerId === playerId).sort((a, b) => b.observationDate.localeCompare(a.observationDate))
    );
  }

  async create(input: CreateObservationInput): Promise<Observation> {
    const now = new Date().toISOString();
    const observation: Observation = {
      id: uuid(),
      playerId: input.playerId,
      observationDate: input.observationDate,
      observationType: input.observationType,
      sourceId: input.sourceId ?? null,
      matchId: input.matchId ?? null,
      teamContext: input.teamContext ?? null,
      potentialGrade: input.potentialGrade ?? null,
      potentialNow: input.potentialNow ?? null,
      potentialFuture: input.potentialFuture ?? null,
      comment: input.comment ?? null,
      notes: input.notes ?? null,
      scoutId: input.scoutId ?? null,
      createdOffline: input.createdOffline ?? false,
      syncStatus: input.syncStatus ?? 'SYNCED',
      createdAt: now,
      updatedAt: now,
    };
    this.observations.push(observation);
    return observation;
  }

  async update(id: string, input: UpdateObservationInput): Promise<Observation | null> {
    const idx = this.observations.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.observations[idx] = { ...this.observations[idx], ...input, updatedAt: now };
    return this.observations[idx];
  }
}
