export interface CreateTeamInput {
  clubId: string;
  name: string;
  categoryId?: string | null;
}

export type UpdateTeamInput = Partial<CreateTeamInput>;
