import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchesRepo } from '../data/repositories/matchesRepo';
import type { Match } from '../types';
import { formatDateEuropean } from '../utils/date';

function matchTypeLabel(t: Match['matchType']) {
  return t === 'LIVE' ? 'Na żywo' : 'Wideo';
}

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>(() => matchesRepo.getAllLocal());
  const [loading, setLoading] = useState(true);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setOfflineMessage(null);

    // Local-first
    setMatches(matchesRepo.getAllLocal());
    setLoading(false);

    // Background refresh
    matchesRepo.refreshFromRemote().then((res) => {
      setMatches(matchesRepo.getAllLocal());
      if (!res.ok) setOfflineMessage(res.error ?? 'Tryb offline – dane z pamięci lokalnej.');
    });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  return (
    <div className="docs-content">
      <div className="page-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Mecze</h1>
          <p className="page-section-desc">
            Mecze na żywo i z wideo – powiązane z obserwacjami.
          </p>
        </div>
        <Link to="/matches/new" className="btn-primary">
          Dodaj mecz
        </Link>
      </div>

      {loading ? (
        <p className="docs-loading">Ładowanie meczów...</p>
      ) : offlineMessage ? (
        <div className="docs-card" style={{ marginBottom: '1rem', borderColor: '#facc15' }}>
          <p className="docs-card-title" style={{ color: '#92400e' }}>
            Tryb offline
          </p>
          <p className="docs-card-desc">{offlineMessage}</p>
          <button type="button" onClick={load} className="btn-secondary">Spróbuj ponownie połączyć</button>
        </div>
      ) : matches.length === 0 ? (
        <p className="docs-loading">Brak meczów.</p>
      ) : (
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Typ</th>
                <th>Miejsce</th>
                <th>Gospodarz – Goście</th>
                <th>Wynik</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id}>
                  <td>{formatDateEuropean(m.date)}</td>
                  <td>{matchTypeLabel(m.matchType)}</td>
                  <td>{m.location}</td>
                  <td>{m.teamHome} – {m.teamAway}</td>
                  <td>{m.result ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
