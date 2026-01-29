// Słowniki
export type DictionaryType =
  | 'POSITION'
  | 'FOOT'
  | 'SOURCE'
  | 'MATCH_CATEGORY'
  | 'LEAGUE_RANK';

export interface Dictionary {
  id: string;
  type: DictionaryType;
  value: string;
  sortOrder: number;
  isActive: boolean;
}

// Kluby i drużyny
export interface Club {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  clubId: string;
  name: string;
  categoryId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Osoby
export type PersonType = 'PARENT' | 'SCOUT' | 'COACH';

export interface Person {
  id: string;
  personType: PersonType;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Zawodnik
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  birthYear?: number;
  birthDate?: string | null;
  dominantFootId: string;
  mainPositionId: string;
  clubId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Mecze
export type MatchType = 'LIVE' | 'VIDEO';

export interface Match {
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

// Obserwacje
export type ObservationType = 'LIVE' | 'VIDEO' | 'SCOUT' | 'COACH';
export type PotentialGrade = 'A' | 'B' | 'C' | 'D';
export type SyncStatus = 'LOCAL' | 'SYNCED' | 'ERROR';

export interface Observation {
  id: string;
  playerId: string;
  observationDate: string;
  observationType: ObservationType;
  sourceId?: string | null;
  matchId?: string | null;
  teamContext?: string | null;
  potentialGrade?: PotentialGrade | null;
  potentialNow?: number | null;
  potentialFuture?: number | null;
  comment?: string | null;
  notes?: string | null;
  scoutId?: string | null;
  createdOffline?: boolean;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt?: string;
}

// Decyzje
export type DecisionType =
  | 'SIGNED'
  | 'RESIGNED'
  | 'WATCH'
  | 'REJECTED'
  | 'INVITE_AGAIN';

export interface PlayerDecision {
  id: string;
  playerId: string;
  decisionType: DecisionType;
  decisionDate: string;
  comment?: string | null;
  createdAt: string;
}

// Zaproszenia
export type InvitationStatus = 'SENT' | 'ACCEPTED' | 'DECLINED' | 'NO_RESPONSE';

export interface Invitation {
  id: string;
  playerId: string;
  invitationDate: string;
  month?: number | null;
  teamId?: string | null;
  status: InvitationStatus;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
