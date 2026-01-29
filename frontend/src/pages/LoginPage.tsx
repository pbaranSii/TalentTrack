import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import type { UserRole } from '../auth/types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'SCOUT', label: 'Scout' },
  { value: 'COACH', label: 'Trener' },
  { value: 'EXTERNAL', label: 'Osoba zewnętrzna' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('SCOUT');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="docs-content">
      <div className="docs-card" style={{ maxWidth: '28rem', margin: '2rem auto' }}>
        <h1 className="docs-card-title">Logowanie</h1>
        <p className="docs-card-desc">
          Lokalny login (offline-first). Docelowo podmienimy na Supabase Auth.
        </p>

        {error ? (
          <div className="docs-alert-error" style={{ marginBottom: '1rem' }}>
            <p className="docs-alert-title">Nie udało się zalogować</p>
            <p className="docs-alert-body">{error}</p>
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            try {
              login({ email, password, role });
              navigate('/');
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
          className="space-y-4"
        >
          <div className="docs-form-group">
            <label className="docs-form-label">Email *</label>
            <input
              className="docs-form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. scout@polonia.pl"
              required
            />
          </div>

          <div className="docs-form-group">
            <label className="docs-form-label">Hasło *</label>
            <input
              className="docs-form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="docs-form-group">
            <label className="docs-form-label">Rola *</label>
            <select className="docs-form-select" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="docs-form-actions">
            <button type="submit" className="btn-primary">
              Zaloguj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

