import type { Event } from '../models';
import type { CreateEventInput, UpdateEventInput } from '../dto/events';

export class InMemoryEventsRepository {
  private events: Event[] = [];

  constructor(initialEvents: Event[] = []) {
    this.events = initialEvents;
  }

  findAll(): Promise<Event[]> {
    return Promise.resolve(this.events);
  }

  findById(id: string): Promise<Event | null> {
    const event = this.events.find((e) => e.id === id) ?? null;
    return Promise.resolve(event);
  }

  async create(input: CreateEventInput): Promise<Event> {
    const now = new Date().toISOString();
    const event: Event = {
      id: `e_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      type: input.type,
      date: input.date,
      time: input.time,
      location: input.location,
      ageCategory: input.ageCategory,
      homeTeam: input.homeTeam,
      awayTeam: input.awayTeam,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    this.events.push(event);
    return event;
  }

  async update(id: string, input: UpdateEventInput): Promise<Event | null> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    const updated: Event = {
      ...this.events[index],
      ...input,
      updatedAt: now,
    };
    this.events[index] = updated;
    return updated;
  }
}

