import { useState } from 'react';
import type { CreateMatchInput } from '../api';
import { useDictionaryByType } from '../contexts/useDictionaries';

interface MatchFormProps {
  onSubmit: (input: CreateMatchInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function MatchForm({ onSubmit, onCancel }: MatchFormProps) {
  const categories = useDictionaryByType('MATCH_CATEGORY');
  const leagueRanks = useDictionaryByType('LEAGUE_RANK');
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<CreateMatchInput>({
    matchType: 'LIVE',
    date: today,
    location: '',
    teamHome: '',
    teamAway: '',
    categoryId: categories[0]?.id ?? null,
    leagueRankId: leagueRanks[0]?.id ?? null,
    result: null,
    notes: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof CreateMatchInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Data jest wymagana.';
    if (!form.location?.trim()) e.location = 'Miejsce jest wymagane.';
    if (!form.teamHome?.trim()) e.teamHome = 'Gospodarz jest wymagany.';
    if (!form.teamAway?.trim()) e.teamAway = 'Goście są wymagani.';
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
          <label className="docs-form-label">Typ meczu *</label>
          <select
            className="docs-form-select"
            value={form.matchType}
            onChange={(e) => handleChange('matchType', e.target.value as CreateMatchInput['matchType'])}
          >
            <option value="LIVE">Na żywo</option>
            <option value="VIDEO">Wideo</option>
          </select>
        </div>
        <div>
          <label className="docs-form-label">Data *</label>
          <input
            type="date"
            className="docs-form-input"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          {errors.date && <p className="docs-form-error">{errors.date}</p>}
        </div>
      </div>

      <div>
        <label className="docs-form-label">Miejsce *</label>
        <input
          type="text"
          className="docs-form-input"
          value={form.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
        {errors.location && <p className="docs-form-error">{errors.location}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="docs-form-label">Gospodarz *</label>
          <input
            type="text"
            className="docs-form-input"
            value={form.teamHome}
            onChange={(e) => handleChange('teamHome', e.target.value)}
          />
          {errors.teamHome && <p className="docs-form-error">{errors.teamHome}</p>}
        </div>
        <div>
          <label className="docs-form-label">Goście *</label>
          <input
            type="text"
            className="docs-form-input"
            value={form.teamAway}
            onChange={(e) => handleChange('teamAway', e.target.value)}
          />
          {errors.teamAway && <p className="docs-form-error">{errors.teamAway}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="docs-form-label">Kategoria</label>
          <select
            className="docs-form-select"
            value={form.categoryId ?? ''}
            onChange={(e) => handleChange('categoryId', e.target.value || null)}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="docs-form-label">Liga</label>
          <select
            className="docs-form-select"
            value={form.leagueRankId ?? ''}
            onChange={(e) => handleChange('leagueRankId', e.target.value || null)}
          >
            <option value="">—</option>
            {leagueRanks.map((r) => (
              <option key={r.id} value={r.id}>{r.value}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="docs-form-label">Wynik</label>
        <input
          type="text"
          className="docs-form-input"
          value={form.result ?? ''}
          onChange={(e) => handleChange('result', e.target.value || null)}
          placeholder="np. 2:1"
        />
      </div>

      <div>
        <label className="docs-form-label">Notatki</label>
        <textarea
          className="docs-form-textarea"
          rows={3}
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
          {submitting ? 'Zapisywanie…' : 'Zapisz mecz'}
        </button>
      </div>
    </form>
  );
}
