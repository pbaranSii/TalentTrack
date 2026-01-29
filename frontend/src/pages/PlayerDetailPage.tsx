import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { apiMutations } from '../api';
import { useAuth } from '../auth/useAuth';
import { useDictionaryByType } from '../contexts/useDictionaries';
import { DecisionForm } from '../components/DecisionForm';
import { InvitationForm } from '../components/InvitationForm';
import { invitationsRepo } from '../data/repositories/invitationsRepo';
import type { InvitationRecord } from '../data/repositories/invitationsRepo';
import { observationsRepo } from '../data/repositories/observationsRepo';
import { playersRepo } from '../data/repositories/playersRepo';
import type { Club, Observation, Player, PlayerDecision } from '../types';
import { formatDateEuropean } from '../utils/date';

function decisionLabel(t: PlayerDecision['decisionType']): string {
  const map: Record<PlayerDecision['decisionType'], string> = {
    SIGNED: 'Zapisany',
    RESIGNED: 'Rezygnacja',
    WATCH: 'Obserwuj',
    REJECTED: 'Odrzucony',
    INVITE_AGAIN: 'Zaprosić ponownie',
  };
  return map[t] ?? t;
}

function observationTypeLabel(t: Observation['observationType']): string {
  const map: Record<Observation['observationType'], string> = {
    LIVE: 'Na żywo',
    VIDEO: 'Wideo',
    SCOUT: 'Skaut',
    COACH: 'Trener',
  };
  return map[t] ?? t;
}

function invitationStatusLabel(s: InvitationRecord['status']): string {
  const map: Record<InvitationRecord['status'], string> = {
    SENT: 'Wysłane',
    ACCEPTED: 'Zaakceptowane',
    DECLINED: 'Odrzucone',
    NO_RESPONSE: 'Brak odpowiedzi',
  };
  return map[s] ?? s;
}

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const positions = useDictionaryByType('POSITION');
  const feet = useDictionaryByType('FOOT');
  const [player, setPlayer] = useState<Player | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [decisions, setDecisions] = useState<PlayerDecision[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [latestDecision, setLatestDecision] = useState<PlayerDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showInvitationForm, setShowInvitationForm] = useState(false);

  const positionLabel = (posId: string) => positions.find((p) => p.id === posId)?.value ?? posId;
  const footLabel = (footId: string) => feet.find((f) => f.id === footId)?.value ?? footId;
  const clubsById = useMemo(() => new Map(clubs.map((c) => [c.id, c.name])), [clubs]);
  const clubLabel = useCallback((clubId: string | null | undefined) => (clubId ? clubsById.get(clubId) ?? clubId : '—'), [clubsById]);

  const load = useCallback(() => {
    if (!id) return;
    setError(null);
    setLoading(true);

    // Local-first render
    const localPlayer = playersRepo.getByIdLocal(id);
    if (localPlayer) setPlayer(localPlayer);
    setObservations(observationsRepo.getByPlayerIdLocal(id));
    setInvitations(invitationsRepo.getByPlayerIdLocal(id));
    setLoading(false);

    // Remote refresh (best-effort)
    Promise.allSettled([
      playersRepo.refreshOneFromRemote(id),
      observationsRepo.refreshFromRemote(id),
      invitationsRepo.refreshFromRemote(id),
      api.getClubs(),
      api.getPlayerDecisions(id),
      api.getPlayerLatestDecision(id),
    ]).then((results) => {
      const [playerRes, , , clubsRes, decisionsRes, latestRes] = results;

      if (playerRes.status === 'fulfilled' && playerRes.value.ok && playerRes.value.player) {
        setPlayer(playerRes.value.player);
      } else if (!localPlayer) {
        setError('Nie udało się załadować zawodnika (brak danych lokalnych).');
      }

      setObservations(observationsRepo.getByPlayerIdLocal(id));
      setInvitations(invitationsRepo.getByPlayerIdLocal(id));

      if (clubsRes.status === 'fulfilled') setClubs(clubsRes.value);

      if (decisionsRes.status === 'fulfilled') setDecisions(decisionsRes.value);
      else setDecisions([]);

      if (latestRes.status === 'fulfilled') setLatestDecision(latestRes.value);
      else setLatestDecision(null);
    });
  }, [id]);

  useEffect(() => {
    const t = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  if (!id) {
    return (
      <div className="docs-content">
        <p>Brak ID zawodnika.</p>
        <Link to="/players">← Powrót do listy</Link>
      </div>
    );
  }

  if (loading || !player) {
    return (
      <div className="docs-content">
        {loading ? <p className="docs-loading">Ładowanie profilu…</p> : error ? <p className="text-red-600">{error}</p> : null}
        <Link to="/players">← Powrót do listy</Link>
      </div>
    );
  }

  const onDecisionAdded = () => {
    setShowDecisionForm(false);
    load();
  };

  const onInvitationAdded = () => {
    setShowInvitationForm(false);
    load();
  };

  return (
    <div className="docs-content">
      <Link to="/players" className="docs-back-link">← Powrót do listy zawodników</Link>

      <div className="docs-card" style={{ marginBottom: '1.5rem' }}>
        <h1 className="docs-card-title">
          {player.firstName} {player.lastName}
        </h1>
        <p className="docs-card-desc">
          Status (ostatnia decyzja): {latestDecision ? decisionLabel(latestDecision.decisionType) : '—'}
        </p>
        <dl className="grid gap-2 md:grid-cols-2 text-sm">
          <dt className="font-medium">Rocznik</dt>
          <dd>{player.birthYear ?? '—'}</dd>
          <dt className="font-medium">Data urodzenia</dt>
          <dd>{formatDateEuropean(player.birthDate) || '—'}</dd>
          <dt className="font-medium">Pozycja</dt>
          <dd>{positionLabel(player.mainPositionId)}</dd>
          <dt className="font-medium">Noga</dt>
          <dd>{footLabel(player.dominantFootId)}</dd>
          <dt className="font-medium">Klub</dt>
          <dd>{clubLabel(player.clubId)}</dd>
        </dl>
      </div>

      <section className="docs-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="text-lg font-semibold">Obserwacje</h2>
          <Link to={`/players/${id}/observations/new`} className="btn-primary text-sm">
            Dodaj obserwację
          </Link>
        </div>
        {observations.length === 0 ? (
          <p className="text-sm text-slate-500">Brak obserwacji.</p>
        ) : (
          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Typ</th>
                  <th>Potencjał (A–D)</th>
                  <th>Teraz / Przyszłość</th>
                  <th>Komentarz</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((o) => (
                  <tr key={o.id}>
                    <td>{formatDateEuropean(o.observationDate)}</td>
                    <td>{observationTypeLabel(o.observationType)}</td>
                    <td>{o.potentialGrade ?? '—'}</td>
                    <td>{o.potentialNow ?? '—'} / {o.potentialFuture ?? '—'}</td>
                    <td className="max-w-xs truncate">{o.comment ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="docs-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="text-lg font-semibold">Decyzje</h2>
          {!showDecisionForm && (
            <button type="button" onClick={() => setShowDecisionForm(true)} className="btn-primary text-sm">
              Dodaj decyzję
            </button>
          )}
        </div>
        {showDecisionForm ? (
          <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }}>
            <DecisionForm
              playerId={id}
              onCancel={() => setShowDecisionForm(false)}
              onSubmit={async (input) => {
                await apiMutations.createPlayerDecision(input);
                onDecisionAdded();
              }}
            />
          </div>
        ) : null}
        {decisions.length === 0 && !showDecisionForm ? (
          <p className="text-sm text-slate-500">Brak decyzji.</p>
        ) : !showDecisionForm ? (
          <ul className="list-disc list-inside text-sm space-y-1">
            {decisions.map((d) => (
              <li key={d.id}>
                {formatDateEuropean(d.decisionDate)} – {decisionLabel(d.decisionType)}
                {d.comment ? `: ${d.comment}` : ''}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="docs-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="text-lg font-semibold">Zaproszenia</h2>
          {!showInvitationForm && (
            <button type="button" onClick={() => setShowInvitationForm(true)} className="btn-primary text-sm">
              Dodaj zaproszenie
            </button>
          )}
        </div>
        {showInvitationForm ? (
          <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }}>
            <InvitationForm
              playerId={id}
              onCancel={() => setShowInvitationForm(false)}
              onSubmit={async (input) => {
                await invitationsRepo.createLocalFirst(input, user?.id);
                onInvitationAdded();
              }}
            />
          </div>
        ) : null}
        {invitations.length === 0 && !showInvitationForm ? (
          <p className="text-sm text-slate-500">Brak zaproszeń.</p>
        ) : !showInvitationForm ? (
          <ul className="list-disc list-inside text-sm space-y-1">
            {invitations.map((i) => (
              <li key={i.id}>
                {formatDateEuropean(i.invitationDate)} – {invitationStatusLabel(i.status)}
                {i.comment ? `: ${i.comment}` : ''}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
