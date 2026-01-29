import type { MatchType } from '../models';

export interface CreateMatchInput {
  matchType: MatchType;
  date: string;
  month?: number;
  location: string;
  teamHome: string;
  teamAway: string;
  categoryId?: string | null;
  leagueRankId?: string | null;
  result?: string | null;
  notes?: string | null;
}

export type UpdateMatchInput = Partial<CreateMatchInput>;
