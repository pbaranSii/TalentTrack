import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/useAuth';
import { invitationsRepo } from '../data/repositories/invitationsRepo';
import { observationsRepo } from '../data/repositories/observationsRepo';
import { playersRepo } from '../data/repositories/playersRepo';
import { getMeta, setWatchlistPlayerIds } from '../data/storage';
import { useDictionaryByType } from '../contexts/useDictionaries';
import type { Club, Player } from '../types';

export function PlayersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const positions = useDictionaryByType('POSITION');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const [dataTick, setDataTick] = useState(0);
  const [players, setPlayers] = useState<Player[]>(() => playersRepo.getAllLocal());

  const [tab, setTab] = useState<'ALL' | 'MINE' | 'INVITATIONS' | 'WATCHLIST'>('ALL');
  const [query, setQuery] = useState('');
  const [filterClubId, setFilterClubId] = useState<string>('');
  const [filterPositionId, setFilterPositionId] = useState<string>('');
  const [filterBirthYear, setFilterBirthYear] = useState<string>('');
  const [sort, setSort] = useState<'LAST_NAME' | 'BIRTH_YEAR' | 'LAST_OBS'>('LAST_NAME');
  const [showQuickAddObs, setShowQuickAddObs] = useState(false);
  const [quickObsPlayerId, setQuickObsPlayerId] = useState<string>('');

  const load = useCallback(() => {
    setLoading(true);
    setOfflineMessage(null);

    // Local-first: show cached immediately
    const localPlayers = playersRepo.getAllLocal();
    setPlayers(localPlayers);
    setLoading(false);
    setDataTick((t) => t + 1);

    // Background refreshes (non-blocking)
    Promise.allSettled([playersRepo.refreshFromRemote(), invitationsRepo.refreshFromRemote(), observationsRepo.refreshFromRemote(), api.getClubs()]).then(
      (results) => {
        const [playersRes, , , clubsRes] = results;
        if (playersRes.status === 'fulfilled' && playersRes.value.ok) {
          setPlayers(playersRepo.getAllLocal());
        } else if (playersRes.status === 'fulfilled' && !playersRes.value.ok) {
          setOfflineMessage(playersRes.value.error ?? 'Tryb offline – dane z pamięci lokalnej.');
        } else if (playersRes.status === 'rejected') {
          setOfflineMessage(playersRes.reason instanceof Error ? playersRes.reason.message : String(playersRes.reason));
        }

        if (clubsRes.status === 'fulfilled') {
          setClubs(clubsRes.value);
        } else {
          // keep existing; clubs are optional for offline usage
        }

        // Refresh derived data by forcing rerender via setPlayers to current local
        setPlayers(playersRepo.getAllLocal());
        setDataTick((t) => t + 1);
      }
    );
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const positionLabel = (id: string) => positions.find((p) => p.id === id)?.value ?? id;
  const clubsById = useMemo(() => new Map(clubs.map((c) => [c.id, c.name])), [clubs]);
  const clubLabel = useCallback(
    (id: string | null | undefined) => (id ? clubsById.get(id) ?? id : '—'),
    [clubsById]
  );

  // Recomputed on every render; we bump `dataTick` to force a refresh after writes.
  void dataTick;
  const watchlistIds = getMeta().watchlistPlayerIds;
  const allObservations = observationsRepo.getAllLocal();
  const allInvitations = invitationsRepo.getAllLocal();

  const myPlayerIds = useMemo(() => {
    const id = user?.id;
    if (!id) return new Set<string>();
    return new Set(allObservations.filter((o) => o.scoutId === id).map((o) => o.playerId));
  }, [allObservations, user?.id]);

  const lastObsDateByPlayerId = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of allObservations) {
      const prev = map.get(o.playerId);
      if (!prev || (o.observationDate ?? '') > prev) {
        map.set(o.playerId, o.observationDate ?? '');
      }
    }
    return map;
  }, [allObservations]);

  const basePlayersForTab = useMemo(() => {
    if (tab === 'WATCHLIST') return players.filter((p) => watchlistIds.includes(p.id));
    if (tab === 'MINE') return players.filter((p) => myPlayerIds.has(p.id));
    return players;
  }, [players, tab, watchlistIds, myPlayerIds]);

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const birthYear = filterBirthYear ? Number(filterBirthYear) : null;
    return basePlayersForTab.filter((p) => {
      if (filterClubId && (p.clubId ?? '') !== filterClubId) return false;
      if (filterPositionId && p.mainPositionId !== filterPositionId) return false;
      if (birthYear != null && p.birthYear !== birthYear) return false;
      if (!q) return true;
      const full = `${p.firstName} ${p.lastName}`.toLowerCase();
      const club = clubLabel(p.clubId).toLowerCase();
      return full.includes(q) || club.includes(q);
    });
  }, [basePlayersForTab, query, filterClubId, filterPositionId, filterBirthYear, clubLabel]);

  const sortedPlayers = useMemo(() => {
    const list = filteredPlayers.slice();
    if (sort === 'BIRTH_YEAR') {
      list.sort((a, b) => (b.birthYear ?? 0) - (a.birthYear ?? 0) || a.lastName.localeCompare(b.lastName, 'pl'));
      return list;
    }
    if (sort === 'LAST_OBS') {
      list.sort((a, b) => {
        const da = lastObsDateByPlayerId.get(a.id) ?? '';
        const db = lastObsDateByPlayerId.get(b.id) ?? '';
        return db.localeCompare(da) || a.lastName.localeCompare(b.lastName, 'pl');
      });
      return list;
    }
    list.sort((a, b) => a.lastName.localeCompare(b.lastName, 'pl') || a.firstName.localeCompare(b.firstName, 'pl'));
    return list;
  }, [filteredPlayers, sort, lastObsDateByPlayerId]);

  const invitationsView = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allInvitations.filter((inv) => {
      const pid = inv.playerId ?? null;
      const p = pid ? players.find((x) => x.id === pid) : null;
      const displayName = p
        ? `${p.firstName} ${p.lastName}`
        : `${inv.playerFirstName ?? ''} ${inv.playerLastName ?? ''}`.trim() || pid || inv.id;
      const name = displayName.toLowerCase();
      if (!q) return true;
      return name.includes(q);
    });
  }, [allInvitations, players, query]);

  const toggleWatchlist = (playerId: string) => {
    const current = getMeta().watchlistPlayerIds;
    const next = current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId];
    setWatchlistPlayerIds(next);
    // trigger rerender
    setDataTick((t) => t + 1);
  };

  return (
    <div className="docs-content">
      <div
        className="page-section"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1>Zawodnicy</h1>
          <p className="page-section-desc">
            Offline-first lista zawodników. Wybierz listę, wyszukuj, filtruj i sortuj. Dane zapisują się lokalnie.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tab === 'INVITATIONS' ? (
            <Link to="/invitations/new" className="btn-primary">
              Dodaj zaproszenie
            </Link>
          ) : (
            <Link to="/players/new" className="btn-primary">
              Dodaj zawodnika
            </Link>
          )}
          <button type="button" className="btn-secondary" onClick={() => setShowQuickAddObs(true)}>
            Dodaj obserwację
          </button>
        </div>
      </div>

      {offlineMessage ? (
        <div className="docs-card" style={{ marginBottom: '1rem', borderColor: '#facc15' }}>
          <p className="docs-card-title" style={{ color: '#92400e' }}>
            Tryb offline
          </p>
          <p className="docs-card-desc">{offlineMessage}</p>
          <button type="button" onClick={load} className="btn-secondary">
            Spróbuj ponownie połączyć
          </button>
        </div>
      ) : null}

      {showQuickAddObs ? (
        <div className="docs-card" style={{ marginBottom: '1rem' }}>
          <h2 className="text-lg font-semibold">Nowa obserwacja</h2>
          <p className="docs-card-desc">Wybierz zawodnika, aby przejść do formularza obserwacji.</p>
          <div className="grid gap-3 md:grid-cols-2" style={{ alignItems: 'end' }}>
            <div className="docs-form-group">
              <label className="docs-form-label">Zawodnik</label>
              <select className="docs-form-select" value={quickObsPlayerId} onChange={(e) => setQuickObsPlayerId(e.target.value)}>
                <option value="">— wybierz —</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.birthYear ? `(${p.birthYear})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowQuickAddObs(false)}>
                Anuluj
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!quickObsPlayerId}
                onClick={() => {
                  if (!quickObsPlayerId) return;
                  setShowQuickAddObs(false);
                  navigate(`/players/${quickObsPlayerId}/observations/new`);
                }}
              >
                Przejdź do formularza
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="docs-card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button
            type="button"
            className={tab === 'ALL' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('ALL')}
          >
            Wszyscy
          </button>
          <button
            type="button"
            className={tab === 'MINE' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('MINE')}
          >
            Moi zawodnicy
          </button>
          <button
            type="button"
            className={tab === 'INVITATIONS' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('INVITATIONS')}
          >
            Zaproszenia
          </button>
          <button
            type="button"
            className={tab === 'WATCHLIST' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('WATCHLIST')}
          >
            Watchlista ★
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-4" style={{ alignItems: 'end' }}>
          <div className="docs-form-group md:col-span-2">
            <label className="docs-form-label">Szukaj</label>
            <input
              className="docs-form-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="imię, nazwisko, klub…"
            />
          </div>

          {tab !== 'INVITATIONS' ? (
            <>
              <div className="docs-form-group">
                <label className="docs-form-label">Klub</label>
                <select className="docs-form-select" value={filterClubId} onChange={(e) => setFilterClubId(e.target.value)}>
                  <option value="">Wszystkie</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Pozycja</label>
                <select
                  className="docs-form-select"
                  value={filterPositionId}
                  onChange={(e) => setFilterPositionId(e.target.value)}
                >
                  <option value="">Wszystkie</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Rocznik</label>
                <input
                  className="docs-form-input"
                  value={filterBirthYear}
                  onChange={(e) => setFilterBirthYear(e.target.value)}
                  placeholder="np. 2010"
                  inputMode="numeric"
                />
              </div>
            </>
          ) : null}

          {tab !== 'INVITATIONS' ? (
            <div className="docs-form-group">
              <label className="docs-form-label">Sortowanie</label>
              <select className="docs-form-select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="LAST_NAME">Nazwisko</option>
                <option value="BIRTH_YEAR">Rocznik (malejąco)</option>
                <option value="LAST_OBS">Ostatnia obserwacja</option>
              </select>
            </div>
          ) : null}

          <div className="docs-form-group">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setQuery('');
                setFilterClubId('');
                setFilterPositionId('');
                setFilterBirthYear('');
              }}
            >
              Wyczyść filtry
            </button>
          </div>
        </div>
      </div>

      {loading ? <p className="docs-loading">Ładowanie…</p> : null}

      {tab === 'INVITATIONS' ? (
        invitationsView.length === 0 ? (
          <p className="docs-loading">Brak zaproszeń.</p>
        ) : (
          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Zawodnik</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invitationsView.map((inv) => {
                  const pid = inv.playerId ?? null;
                  const p = pid ? players.find((x) => x.id === pid) : null;
                  const displayName = p
                    ? `${p.firstName} ${p.lastName}`
                    : `${inv.playerFirstName ?? ''} ${inv.playerLastName ?? ''}`.trim() || pid || inv.id;
                  return (
                    <tr key={inv.id}>
                      <td>{displayName}</td>
                      <td>{inv.invitationDate}</td>
                      <td>{inv.status}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        {p ? (
                          <>
                            <Link to={`/players/${p.id}`} className="btn-secondary btn-small">
                              Profil
                            </Link>
                            <button
                              type="button"
                              className="btn-primary btn-small"
                              onClick={() => navigate(`/players/${p.id}/observations/new`)}
                            >
                              Dodaj obserwację
                            </button>
                          </>
                        ) : (
                          <span className="docs-loading">Zaproszenie bez zawodnika (do konwersji).</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : sortedPlayers.length === 0 ? (
        <p className="docs-loading">
          {players.length === 0 ? 'Brak zawodników.' : 'Brak wyników dla podanych filtrów.'}
        </p>
      ) : (
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>★</th>
                <th>Imię i nazwisko</th>
                <th>Rocznik</th>
                <th>Klub</th>
                <th>Pozycja</th>
                <th>Ostatnia obserwacja</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player) => (
                <tr key={player.id}>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => toggleWatchlist(player.id)}
                      aria-label="Toggle watchlist"
                    >
                      {watchlistIds.includes(player.id) ? '★' : '☆'}
                    </button>
                  </td>
                  <td>
                    {player.firstName} {player.lastName}
                  </td>
                  <td>{player.birthYear ?? '—'}</td>
                  <td>{clubLabel(player.clubId)}</td>
                  <td>{positionLabel(player.mainPositionId)}</td>
                  <td>{lastObsDateByPlayerId.get(player.id) ?? '—'}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/players/${player.id}`} className="btn-secondary btn-small">
                      Profil
                    </Link>
                    <button
                      type="button"
                      className="btn-primary btn-small"
                      onClick={() => navigate(`/players/${player.id}/observations/new`)}
                    >
                      Dodaj obserwację
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
