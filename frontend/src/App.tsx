import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { DictionariesProvider } from './contexts/DictionariesProvider';
import { LoginPage } from './pages/LoginPage';
import { PlayersPage } from './pages/PlayersPage';
import { NewPlayerPage } from './pages/NewPlayerPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';
import { NewObservationPage } from './pages/NewObservationPage';
import { MatchesPage } from './pages/MatchesPage';
import { NewMatchPage } from './pages/NewMatchPage';
import { NewInvitationPage } from './pages/NewInvitationPage';
import { ClubsPage } from './pages/ClubsPage';
import { PersonsPage } from './pages/PersonsPage';
import './App.css';

function AppShell() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('tt-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem('tt-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrowserRouter>
      <DictionariesProvider>
        <div className="app-root">
          <header className="app-header">
            <div className="app-header-inner">
              <span className="app-logo">TalentTrack – Scouting</span>
              <nav className="app-nav">
                <Link to="/">Dashboard</Link>
                <Link to="/players">Zawodnicy</Link>
                <Link to="/matches">Mecze</Link>
                <Link to="/clubs">Kluby</Link>
                <Link to="/persons">Osoby</Link>
              </nav>
              <div className="app-header-actions">
                {user ? (
                  <div className="app-user">
                    <span className="app-user-label">{user.email}</span>
                    <span className="app-user-role">{user.role}</span>
                    <button type="button" onClick={logout} className="btn-secondary btn-small">
                      Wyloguj
                    </button>
                  </div>
                ) : null}
                <button type="button" onClick={toggleTheme} className="theme-toggle">
                  {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </button>
              </div>
            </div>
          </header>
          <main className="app-main docs-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  user ? (
                    <div>
                      <h1>Dashboard</h1>
                      <p>
                        Offline-first scouting. Dane są zapisywane lokalnie, a w przyszłości będą synchronizowane z chmurą
                        (np. Supabase). Zacznij od „Zawodnicy” lub „Mecze”.
                      </p>
                    </div>
                  ) : (
                    <LoginPage />
                  )
                }
              />
              <Route path="/players" element={user ? <PlayersPage /> : <LoginPage />} />
              <Route path="/players/new" element={user ? <NewPlayerPage /> : <LoginPage />} />
              <Route path="/players/:id" element={user ? <PlayerDetailPage /> : <LoginPage />} />
              <Route path="/players/:id/observations/new" element={user ? <NewObservationPage /> : <LoginPage />} />
              <Route path="/invitations/new" element={user ? <NewInvitationPage /> : <LoginPage />} />
              <Route path="/matches" element={user ? <MatchesPage /> : <LoginPage />} />
              <Route path="/matches/new" element={user ? <NewMatchPage /> : <LoginPage />} />
              <Route path="/clubs" element={user ? <ClubsPage /> : <LoginPage />} />
              <Route path="/persons" element={user ? <PersonsPage /> : <LoginPage />} />
            </Routes>
          </main>
        </div>
      </DictionariesProvider>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
