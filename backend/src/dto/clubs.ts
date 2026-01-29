export interface CreateClubInput {
  name: string;
}

export type UpdateClubInput = Partial<CreateClubInput>;
