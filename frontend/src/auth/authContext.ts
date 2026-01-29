import { createContext } from 'react';
import type { LocalUser, UserRole } from './types';

export interface AuthState {
  user: LocalUser | null;
  login: (params: { email: string; password: string; role: UserRole }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

