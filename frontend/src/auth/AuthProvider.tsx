import { useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import type { AuthState } from './authContext';
import { clearSession, getCurrentUser, loginOrRegister } from './storage';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    return getCurrentUser();
  });

  const value = useMemo<AuthState>(
    () => ({
      user,
      login: ({ email, password, role }) => {
        const u = loginOrRegister(email, password, role);
        setUser(u);
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

