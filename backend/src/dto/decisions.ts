import type { DecisionType } from '../models';

export interface CreatePlayerDecisionInput {
  playerId: string;
  decisionType: DecisionType;
  decisionDate: string;
  comment?: string | null;
}
