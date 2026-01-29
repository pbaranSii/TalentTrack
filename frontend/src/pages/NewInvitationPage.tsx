import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { InvitationForm } from '../components/InvitationForm';
import type { InvitationStatus } from '../types';
import { useDictionaryByType } from '../contexts/useDictionaries';
import { invitationsRepo } from '../data/repositories/invitationsRepo';
import type { CreateFreeformInvitationInput } from '../data/repositories/invitationsRepo';
import { playersRepo } from '../data/repositories/playersRepo';

export function NewInvitationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const players = useMemo(() => playersRepo.getAllLocal(), []);
  const [playerId, setPlayerId] = useState<string>('');
  const [mode, setMode] = useState<'FREEFORM' | 'EXISTING'>('FREEFORM');
  const positions = useDictionaryByType('POSITION');
  const feet = useDictionaryByType('FOOT');
  const today = new Date().toISOString().slice(0, 10);
  const [freeform, setFreeform] = useState<CreateFreeformInvitationInput>({
    invitationDate: today,
    month: new Date().getMonth() + 1,
    teamId: null,
    status: 'SENT',
    comment: '',
    playerFirstName: '',
    playerLastName: '',
    playerBirthYear: null,
    playerBirthDate: null,
    playerClubName: '',
    playerPositionId: positions[0]?.id ?? null,
    playerDominantFootId: feet[0]?.id ?? null,
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    plannedObservationDate: null,
    plannedMatchDate: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const STATUSES: { value: InvitationStatus; label: string }[] = [
    { value: 'SENT', label: 'Oczekuje' },
    { value: 'ACCEPTED', label: 'Przyjęty' },
    { value: 'DECLINED', label: 'Odrzucony' },
    { value: 'NO_RESPONSE', label: 'Brak odpowiedzi' },
  ];

  const validateFreeform = (): boolean => {
    const e: Record<string, string> = {};
    if (!freeform.invitationDate) e.invitationDate = 'Data zaproszenia jest wymagana.';
    if (!freeform.playerFirstName.trim()) e.playerFirstName = 'Imię zawodnika jest wymagane.';
    if (!freeform.playerLastName.trim()) e.playerLastName = 'Nazwisko zawodnika jest wymagane.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="docs-content">
      <Link to="/players" className="docs-back-link">
        ← Powrót do zawodników
      </Link>

      <div className="docs-card" style={{ maxWidth: '36rem' }}>
        <h1 className="docs-card-title">Nowe zaproszenie</h1>
        <p className="docs-card-desc">
          Zaproszenie może być dodane bez tworzenia zawodnika. Docelowo będzie można je „skonwertować” do zawodnika.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button type="button" className={mode === 'FREEFORM' ? 'btn-primary' : 'btn-secondary'} onClick={() => setMode('FREEFORM')}>
            Bez zawodnika (formularz)
          </button>
          <button type="button" className={mode === 'EXISTING' ? 'btn-primary' : 'btn-secondary'} onClick={() => setMode('EXISTING')}>
            Z istniejącego zawodnika
          </button>
        </div>

        {mode === 'EXISTING' ? (
          <>
            <div className="docs-form-group">
              <label className="docs-form-label">Zawodnik *</label>
              <select className="docs-form-select" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
                <option value="">— wybierz —</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.birthYear ? `(${p.birthYear})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {playerId ? (
              <InvitationForm
                playerId={playerId}
                onCancel={() => navigate('/players')}
                onSubmit={async (input) => {
                  await invitationsRepo.createLocalFirst(input, user?.id);
                  navigate('/players');
                }}
              />
            ) : null}
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!validateFreeform()) return;
              await invitationsRepo.createFreeformLocalFirst(
                {
                  ...freeform,
                  playerFirstName: freeform.playerFirstName.trim(),
                  playerLastName: freeform.playerLastName.trim(),
                  playerClubName: freeform.playerClubName?.trim() || null,
                  parentFirstName: freeform.parentFirstName?.trim() || null,
                  parentLastName: freeform.parentLastName?.trim() || null,
                  parentPhone: freeform.parentPhone?.trim() || null,
                  parentEmail: freeform.parentEmail?.trim() || null,
                  comment: freeform.comment?.trim() || null,
                },
                user?.id
              );
              navigate('/players');
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="docs-form-group">
                <label className="docs-form-label">Data zaproszenia *</label>
                <input
                  className="docs-form-input"
                  type="date"
                  value={freeform.invitationDate}
                  onChange={(e) => setFreeform((p) => ({ ...p, invitationDate: e.target.value }))}
                />
                {errors.invitationDate ? <p className="docs-form-error">{errors.invitationDate}</p> : null}
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Status *</label>
                <select
                  className="docs-form-select"
                  value={freeform.status}
                  onChange={(e) => setFreeform((p) => ({ ...p, status: e.target.value as InvitationStatus }))}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="docs-form-group">
                <label className="docs-form-label">Imię zawodnika *</label>
                <input
                  className="docs-form-input"
                  value={freeform.playerFirstName}
                  onChange={(e) => setFreeform((p) => ({ ...p, playerFirstName: e.target.value }))}
                />
                {errors.playerFirstName ? <p className="docs-form-error">{errors.playerFirstName}</p> : null}
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Nazwisko zawodnika *</label>
                <input
                  className="docs-form-input"
                  value={freeform.playerLastName}
                  onChange={(e) => setFreeform((p) => ({ ...p, playerLastName: e.target.value }))}
                />
                {errors.playerLastName ? <p className="docs-form-error">{errors.playerLastName}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="docs-form-group">
                <label className="docs-form-label">Rocznik</label>
                <input
                  className="docs-form-input"
                  inputMode="numeric"
                  value={freeform.playerBirthYear ?? ''}
                  onChange={(e) =>
                    setFreeform((p) => ({ ...p, playerBirthYear: e.target.value ? Number(e.target.value) : null }))
                  }
                />
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Data urodzenia</label>
                <input
                  className="docs-form-input"
                  type="date"
                  value={freeform.playerBirthDate ?? ''}
                  onChange={(e) => setFreeform((p) => ({ ...p, playerBirthDate: e.target.value || null }))}
                />
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Klub macierzysty</label>
                <input
                  className="docs-form-input"
                  value={freeform.playerClubName ?? ''}
                  onChange={(e) => setFreeform((p) => ({ ...p, playerClubName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="docs-form-group">
                <label className="docs-form-label">Pozycja</label>
                <select
                  className="docs-form-select"
                  value={freeform.playerPositionId ?? ''}
                  onChange={(e) => setFreeform((p) => ({ ...p, playerPositionId: e.target.value || null }))}
                >
                  <option value="">—</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Noga</label>
                <select
                  className="docs-form-select"
                  value={freeform.playerDominantFootId ?? ''}
                  onChange={(e) => setFreeform((p) => ({ ...p, playerDominantFootId: e.target.value || null }))}
                >
                  <option value="">—</option>
                  {feet.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="docs-form-group">
                <label className="docs-form-label">Planowana data obserwacji</label>
                <input
                  className="docs-form-input"
                  type="date"
                  value={freeform.plannedObservationDate ?? ''}
                  onChange={(e) => setFreeform((p) => ({ ...p, plannedObservationDate: e.target.value || null }))}
                />
              </div>
              <div className="docs-form-group">
                <label className="docs-form-label">Planowana data meczu</label>
                <input
                  className="docs-form-input"
                  type="date"
                  value={freeform.plannedMatchDate ?? ''}
                  onChange={(e) => setFreeform((p) => ({ ...p, plannedMatchDate: e.target.value || null }))}
                />
              </div>
            </div>

            <div className="docs-card" style={{ padding: '1rem' }}>
              <h2 className="text-lg font-semibold">Dane rodzica (opcjonalnie)</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="docs-form-group">
                  <label className="docs-form-label">Imię</label>
                  <input
                    className="docs-form-input"
                    value={freeform.parentFirstName ?? ''}
                    onChange={(e) => setFreeform((p) => ({ ...p, parentFirstName: e.target.value }))}
                  />
                </div>
                <div className="docs-form-group">
                  <label className="docs-form-label">Nazwisko</label>
                  <input
                    className="docs-form-input"
                    value={freeform.parentLastName ?? ''}
                    onChange={(e) => setFreeform((p) => ({ ...p, parentLastName: e.target.value }))}
                  />
                </div>
                <div className="docs-form-group">
                  <label className="docs-form-label">Telefon</label>
                  <input
                    className="docs-form-input"
                    value={freeform.parentPhone ?? ''}
                    onChange={(e) => setFreeform((p) => ({ ...p, parentPhone: e.target.value }))}
                  />
                </div>
                <div className="docs-form-group">
                  <label className="docs-form-label">Email</label>
                  <input
                    className="docs-form-input"
                    type="email"
                    value={freeform.parentEmail ?? ''}
                    onChange={(e) => setFreeform((p) => ({ ...p, parentEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="docs-form-group">
              <label className="docs-form-label">Komentarz</label>
              <textarea
                className="docs-form-textarea"
                rows={3}
                value={freeform.comment ?? ''}
                onChange={(e) => setFreeform((p) => ({ ...p, comment: e.target.value }))}
              />
            </div>

            <div className="docs-form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/players')}>
                Anuluj
              </button>
              <button type="submit" className="btn-primary">
                Zapisz zaproszenie
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

