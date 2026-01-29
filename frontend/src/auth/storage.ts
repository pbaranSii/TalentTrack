import type { LocalUser, Session, UserRole } from './types';
import { genId, nowIso } from '../data/utils';

const USERS_KEY = 'tt-users-v1';
const SESSION_KEY = 'tt-session-v1';

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readUsers(): LocalUser[] {
  const parsed = safeParse(window.localStorage.getItem(USERS_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((x) => x && typeof x === 'object')
    .map((x) => x as LocalUser)
    .filter((u) => typeof u.id === 'string' && typeof u.email === 'string' && typeof u.role === 'string');
}

function writeUsers(users: LocalUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Session | null {
  const parsed = safeParse(window.localStorage.getItem(SESSION_KEY));
  if (!parsed || typeof parsed !== 'object') return null;
  const s = parsed as Partial<Session>;
  if (!s.userId || typeof s.userId !== 'string') return null;
  return { userId: s.userId };
}

export function setSession(userId: string): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId } satisfies Session));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): LocalUser | null {
  const session = getSession();
  if (!session) return null;
  const users = readUsers();
  return users.find((u) => u.id === session.userId) ?? null;
}

export function loginOrRegister(email: string, password: string, role: UserRole): LocalUser {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    if (existing.password !== password) {
      throw new Error('Nieprawidłowe hasło dla tego użytkownika.');
    }
    // allow role update (local) for now
    const updated: LocalUser = { ...existing, role, updatedAt: nowIso() };
    writeUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    setSession(updated.id);
    return updated;
  }
  const created: LocalUser = {
    id: genId('user'),
    email: normalizedEmail,
    role,
    password,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  writeUsers([...users, created]);
  setSession(created.id);
  return created;
}

