import { useEffect, useState } from 'react';
import type { CreateObservationInput } from '../api';
import { useDictionaryByType } from '../contexts/useDictionaries';
import { api } from '../api';
import type { Match, Person } from '../types';
import { formatDateEuropean } from '../utils/date';

interface ObservationFormProps {
  playerId: string;
  onSubmit: (input: CreateObservationInput) => Promise<void> | void;
  onCancel?: () => void;
}

const OBS_TYPES: { value: CreateObservationInput['observationType']; label: string }[] = [
  { value: 'LIVE', label: 'Na żywo (przetestowani)' },
  { value: 'VIDEO', label: 'Wideo' },
  { value: 'SCOUT', label: 'Skauci' },
  { value: 'COACH', label: 'Od trenerów' },
];

const GRADES: CreateObservationInput['potentialGrade'][] = ['A', 'B', 'C', 'D'];

export function ObservationForm({ playerId, onSubmit, onCancel }: ObservationFormProps) {
  const sources = useDictionaryByType('SOURCE');
  const [matches, setMatches] = useState<Match[]>([]);
  const [scouts, setScouts] = useState<Person[]>([]);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<CreateObservationInput>({
    playerId,
    observationDate: today,
    observationType: 'LIVE',
    sourceId: sources[0]?.id ?? null,
    matchId: null,
    teamContext: '',
    potentialGrade: null,
    potentialNow: null,
    potentialFuture: null,
    comment: '',
    notes: '',
    scoutId: null,
    createdOffline: false,
    syncStatus: 'SYNCED',
  });

  useEffect(() => {
    api.getMatches().then(setMatches).catch(() => setMatches([]));
    api.getPersons('SCOUT').then(setScouts).catch(() => setScouts([]));
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof CreateObservationInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.observationDate) e.observationDate = 'Data obserwacji jest wymagana.';
    if (form.potentialNow != null && (form.potentialNow < 1 || form.potentialNow > 5)) e.potentialNow = 'Wartość 1–5.';
    if (form.potentialFuture != null && (form.potentialFuture < 1 || form.potentialFuture > 5)) e.potentialFuture = 'Wartość 1–5.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="docs-form-label">Data obserwacji *</label>
          <input
            type="date"
            className="docs-form-input"
            value={form.observationDate}
            onChange={(e) => handleChange('observationDate', e.target.value)}
          />
          {errors.observationDate && <p className="docs-form-error">{errors.observationDate}</p>}
        </div>
        <div>
          <label className="docs-form-label">Typ obserwacji *</label>
          <select
            className="docs-form-select"
            value={form.observationType}
            onChange={(e) => handleChange('observationType', e.target.value as CreateObservationInput['observationType'])}
          >
            {OBS_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="docs-form-label">Źródło</label>
          <select
            className="docs-form-select"
            value={form.sourceId ?? ''}
            onChange={(e) => handleChange('sourceId', e.target.value || null)}
          >
            <option value="">—</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>{s.value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="docs-form-label">Mecz</label>
          <select
            className="docs-form-select"
            value={form.matchId ?? ''}
            onChange={(e) => handleChange('matchId', e.target.value || null)}
          >
            <option value="">—</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>{formatDateEuropean(m.date)} {m.teamHome} – {m.teamAway}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="docs-form-label">Kontekst drużyny</label>
        <input
          type="text"
          className="docs-form-input"
          value={form.teamContext ?? ''}
          onChange={(e) => handleChange('teamContext', e.target.value || null)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="docs-form-label">Potencjał (ocena A–D)</label>
          <select
            className="docs-form-select"
            value={form.potentialGrade ?? ''}
            onChange={(e) => handleChange('potentialGrade', (e.target.value || null) as CreateObservationInput['potentialGrade'])}
          >
            <option value="">—</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="docs-form-label">Potencjał teraz (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            className="docs-form-input"
            value={form.potentialNow ?? ''}
            onChange={(e) => handleChange('potentialNow', e.target.value ? Number(e.target.value) : null)}
          />
          {errors.potentialNow && <p className="docs-form-error">{errors.potentialNow}</p>}
        </div>
        <div>
          <label className="docs-form-label">Potencjał przyszłość (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            className="docs-form-input"
            value={form.potentialFuture ?? ''}
            onChange={(e) => handleChange('potentialFuture', e.target.value ? Number(e.target.value) : null)}
          />
          {errors.potentialFuture && <p className="docs-form-error">{errors.potentialFuture}</p>}
        </div>
      </div>

      <div>
        <label className="docs-form-label">Skaut</label>
        <select
          className="docs-form-select"
          value={form.scoutId ?? ''}
          onChange={(e) => handleChange('scoutId', e.target.value || null)}
        >
          <option value="">—</option>
          {scouts.map((s) => (
            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="docs-form-label">Komentarz</label>
        <textarea
          className="docs-form-textarea"
          rows={2}
          value={form.comment ?? ''}
          onChange={(e) => handleChange('comment', e.target.value || null)}
        />
      </div>
      <div>
        <label className="docs-form-label">Notatki</label>
        <textarea
          className="docs-form-textarea"
          rows={2}
          value={form.notes ?? ''}
          onChange={(e) => handleChange('notes', e.target.value || null)}
        />
      </div>

      <div className="docs-form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Anuluj
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.75 : 1 }}>
          {submitting ? 'Zapisywanie…' : 'Zapisz obserwację'}
        </button>
      </div>
    </form>
  );
}
