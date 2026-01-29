import type {
  Club,
  Dictionary,
  DictionaryType,
  Invitation,
  Match,
  Observation,
  Player,
  PlayerDecision,
  Person,
  Team,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

const API_OFFLINE_MESSAGE =
  'Nie można połączyć z serwerem API. Upewnij się, że backend jest uruchomiony (w katalogu backend: npm run dev).';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Błąd serwera: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function wrapFetch<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Failed to fetch' || message.includes('Load failed') || message.includes('NetworkError')) {
      throw new Error(API_OFFLINE_MESSAGE);
    }
    throw err;
  });
}

export const api = {
  async getDictionaries(type?: DictionaryType): Promise<Dictionary[]> {
    const url = type ? `${API_BASE_URL}/dictionaries?type=${type}` : `${API_BASE_URL}/dictionaries`;
    return wrapFetch(() => fetch(url).then(handleResponse<Dictionary[]>));
  },
  async getClubs(): Promise<Club[]> {
    return wrapFetch(() => fetch(`${API_BASE_URL}/clubs`).then(handleResponse<Club[]>));
  },
  async getTeams(clubId?: string): Promise<Team[]> {
    const url = clubId ? `${API_BASE_URL}/teams?clubId=${clubId}` : `${API_BASE_URL}/teams`;
    return wrapFetch(() => fetch(url).then(handleResponse<Team[]>));
  },
  async getPersons(type?: string): Promise<Person[]> {
    const url = type ? `${API_BASE_URL}/persons?type=${type}` : `${API_BASE_URL}/persons`;
    return wrapFetch(() => fetch(url).then(handleResponse<Person[]>));
  },
  async getPlayers(): Promise<Player[]> {
    return wrapFetch(() => fetch(`${API_BASE_URL}/players`).then(handleResponse<Player[]>));
  },
  async getPlayer(id: string): Promise<Player> {
    return wrapFetch(() => fetch(`${API_BASE_URL}/players/${id}`).then(handleResponse<Player>));
  },
  async getMatches(): Promise<Match[]> {
    return wrapFetch(() => fetch(`${API_BASE_URL}/matches`).then(handleResponse<Match[]>));
  },
  async getMatch(id: string): Promise<Match> {
    return wrapFetch(() => fetch(`${API_BASE_URL}/matches/${id}`).then(handleResponse<Match>));
  },
  async getObservations(playerId?: string): Promise<Observation[]> {
    const url = playerId ? `${API_BASE_URL}/observations?playerId=${playerId}` : `${API_BASE_URL}/observations`;
    return wrapFetch(() => fetch(url).then(handleResponse<Observation[]>));
  },
  async getObservation(id: string): Promise<Observation> {
    return wrapFetch(() => fetch(`${API_BASE_URL}/observations/${id}`).then(handleResponse<Observation>));
  },
  async getPlayerDecisions(playerId: string): Promise<PlayerDecision[]> {
    return wrapFetch(() =>
      fetch(`${API_BASE_URL}/decisions/player/${playerId}`).then(handleResponse<PlayerDecision[]>)
    );
  },
  async getPlayerLatestDecision(playerId: string): Promise<PlayerDecision | null> {
    return wrapFetch(() =>
      fetch(`${API_BASE_URL}/decisions/player/${playerId}/latest`).then(handleResponse<PlayerDecision | null>)
    );
  },
  async getInvitations(playerId?: string): Promise<Invitation[]> {
    const url = playerId ? `${API_BASE_URL}/invitations?playerId=${playerId}` : `${API_BASE_URL}/invitations`;
    return wrapFetch(() => fetch(url).then(handleResponse<Invitation[]>));
  },
  async getPlayerParents(playerId: string): Promise<Person[]> {
    return wrapFetch(() =>
      fetch(`${API_BASE_URL}/player-parents/player/${playerId}`).then(handleResponse<Person[]>)
    );
  },
};

// Input types for create/update
export interface CreatePlayerInput {
  firstName: string;
  lastName: string;
  birthYear?: number;
  birthDate?: string | null;
  dominantFootId: string;
  mainPositionId: string;
  clubId?: string | null;
}

export interface CreateMatchInput {
  matchType: 'LIVE' | 'VIDEO';
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

export interface CreateObservationInput {
  playerId: string;
  observationDate: string;
  observationType: Observation['observationType'];
  sourceId?: string | null;
  matchId?: string | null;
  teamContext?: string | null;
  potentialGrade?: Observation['potentialGrade'];
  potentialNow?: number | null;
  potentialFuture?: number | null;
  comment?: string | null;
  notes?: string | null;
  scoutId?: string | null;
  createdOffline?: boolean;
  syncStatus?: Observation['syncStatus'];
}

export interface CreatePlayerDecisionInput {
  playerId: string;
  decisionType: PlayerDecision['decisionType'];
  decisionDate: string;
  comment?: string | null;
}

export interface CreateInvitationInput {
  playerId: string;
  invitationDate: string;
  month?: number | null;
  teamId?: string | null;
  status: Invitation['status'];
  comment?: string | null;
}

export interface CreateClubInput {
  name: string;
}

export interface CreateTeamInput {
  clubId: string;
  name: string;
  categoryId?: string | null;
}

export interface CreatePersonInput {
  personType: Person['personType'];
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
}

export const apiMutations = {
  async createPlayer(input: CreatePlayerInput): Promise<Player> {
    const res = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Player>(res);
  },
  async updatePlayer(id: string, input: Partial<CreatePlayerInput>): Promise<Player> {
    const res = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Player>(res);
  },
  async createMatch(input: CreateMatchInput): Promise<Match> {
    const res = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Match>(res);
  },
  async createObservation(input: CreateObservationInput): Promise<Observation> {
    const res = await fetch(`${API_BASE_URL}/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Observation>(res);
  },
  async createPlayerDecision(input: CreatePlayerDecisionInput): Promise<PlayerDecision> {
    const res = await fetch(`${API_BASE_URL}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<PlayerDecision>(res);
  },
  async createInvitation(input: CreateInvitationInput): Promise<Invitation> {
    const res = await fetch(`${API_BASE_URL}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Invitation>(res);
  },
  async createClub(input: CreateClubInput): Promise<Club> {
    const res = await fetch(`${API_BASE_URL}/clubs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Club>(res);
  },
  async createTeam(input: CreateTeamInput): Promise<Team> {
    const res = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Team>(res);
  },
  async createPerson(input: CreatePersonInput): Promise<Person> {
    const res = await fetch(`${API_BASE_URL}/persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Person>(res);
  },
  async addPlayerParent(playerId: string, personId: string): Promise<{ playerId: string; personId: string }> {
    const res = await fetch(`${API_BASE_URL}/player-parents/player/${playerId}/parents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId }),
    });
    return handleResponse<{ playerId: string; personId: string }>(res);
  },
};
