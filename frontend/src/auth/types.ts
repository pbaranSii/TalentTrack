export type UserRole = 'SCOUT' | 'COACH' | 'EXTERNAL';

export interface LocalUser {
  id: string;
  email: string;
  role: UserRole;
  password: string; // local-only (MVP); replace with Supabase Auth later.
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
}

