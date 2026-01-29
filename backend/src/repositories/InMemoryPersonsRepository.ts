import type { Person } from '../models';
import type { CreatePersonInput, UpdatePersonInput } from '../dto/persons';

function uuid(): string {
  return `person_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class InMemoryPersonsRepository {
  private persons: Person[] = [];

  constructor(initial: Person[] = []) {
    this.persons = initial;
  }

  findAll(): Promise<Person[]> {
    return Promise.resolve([...this.persons]);
  }

  findById(id: string): Promise<Person | null> {
    return Promise.resolve(this.persons.find((p) => p.id === id) ?? null);
  }

  findByType(personType: Person['personType']): Promise<Person[]> {
    return Promise.resolve(this.persons.filter((p) => p.personType === personType));
  }

  async create(input: CreatePersonInput): Promise<Person> {
    const now = new Date().toISOString();
    const person: Person = {
      id: uuid(),
      personType: input.personType,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      createdAt: now,
      updatedAt: now,
    };
    this.persons.push(person);
    return person;
  }

  async update(id: string, input: UpdatePersonInput): Promise<Person | null> {
    const idx = this.persons.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.persons[idx] = { ...this.persons[idx], ...input, updatedAt: now };
    return this.persons[idx];
  }
}
