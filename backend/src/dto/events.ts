import type { EventType } from '../models';

export interface CreateEventInput {
  type: EventType;
  date: string;
  time?: string;
  location: string;
  ageCategory: string;
  homeTeam: string;
  awayTeam?: string;
  notes?: string;
}

export type UpdateEventInput = Partial<CreateEventInput>;

