import type { PersonType } from '../models';

export interface CreatePersonInput {
  personType: PersonType;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
}

export type UpdatePersonInput = Partial<CreatePersonInput>;
