import { useEffect, useState } from 'react';
import type { CreatePlayerInput } from '../api';
import { api } from '../api';
import type { Club } from '../types';
import { useDictionaryByType } from '../contexts/useDictionaries';

interface PlayerFormProps {
  onSubmit: (input: CreatePlayerInput) => Promise<void> | void;
  onCancel?: () => void;
  initial?: Partial<CreatePlayerInput>;
}

export function PlayerForm({ onSubmit, onCancel, initial }: PlayerFormProps) {
  const positions = useDictionaryByType('POSITION');
  const feet = useDictionaryByType('FOOT');
  const [clubs, setClubs] = useState<Club[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    api.getClubs().then(setClubs).catch(() => setClubs([]));
  }, []);

  const [form, setForm] = useState<CreatePlayerInput>({
    firstName: initial?.firstName ?? '',
    lastName: initial?.lastName ?? '',
    birthYear: initial?.birthYear ?? currentYear - 13,
    birthDate: initial?.birthDate ?? null,
    dominantFootId: initial?.dominantFootId ?? (feet[0]?.id ?? ''),
    mainPositionId: initial?.mainPositionId ?? (positions[0]?.id ?? ''),
    clubId: initial?.clubId ?? null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof CreatePlayerInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.firstName || form.firstName.trim().length < 2) {
      e.firstName = 'Imię jest wymagane (min. 2 znaki).';
    }
    if (!form.lastName || form.lastName.trim().length < 2) {
      e.lastName = 'Nazwisko jest wymagane (min. 2 znaki).';
    }
    if (!form.mainPositionId) {
      e.mainPositionId = 'Pozycja główna jest wymagana.';
    }
    if (!form.dominantFootId) {
      e.dominantFootId = 'Dominująca noga jest wymagana.';
    }
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

  if (positions.length === 0 && feet.length === 0) {
    return (
      <p className="text-sm text-amber-600">
        Ładowanie słowników (pozycje, noga)…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="docs-form-label">Imię *</label>
          <input
            type="text"
            className="docs-form-input"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
          {errors.firstName && <p className="docs-form-error">{errors.firstName}</p>}
        </div>
        <div>
          <label className="docs-form-label">Nazwisko *</label>
          <input
            type="text"
            className="docs-form-input"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
          {errors.lastName && <p className="docs-form-error">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="docs-form-label">Rocznik</label>
          <input
            type="number"
            className="docs-form-input"
            value={form.birthYear ?? ''}
            onChange={(e) => handleChange('birthYear', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div>
          <label className="docs-form-label">Data urodzenia</label>
          <input
            type="date"
            className="docs-form-input"
            value={form.birthDate ?? ''}
            onChange={(e) => handleChange('birthDate', e.target.value || null)}
          />
        </div>
        <div>
          <label className="docs-form-label">Klub</label>
          <select
            className="docs-form-select"
            value={form.clubId ?? ''}
            onChange={(e) => handleChange('clubId', e.target.value || null)}
          >
            <option value="">— brak —</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="docs-form-label">Pozycja główna *</label>
          <select
            className="docs-form-select"
            value={form.mainPositionId}
            onChange={(e) => handleChange('mainPositionId', e.target.value)}
          >
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.value}
              </option>
            ))}
          </select>
          {errors.mainPositionId && <p className="docs-form-error">{errors.mainPositionId}</p>}
        </div>
        <div>
          <label className="docs-form-label">Dominująca noga *</label>
          <select
            className="docs-form-select"
            value={form.dominantFootId}
            onChange={(e) => handleChange('dominantFootId', e.target.value)}
          >
            {feet.map((f) => (
              <option key={f.id} value={f.id}>
                {f.value}
              </option>
            ))}
          </select>
          {errors.dominantFootId && <p className="docs-form-error">{errors.dominantFootId}</p>}
        </div>
      </div>

      <div className="docs-form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Anuluj
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.75 : 1 }}>
          {submitting ? 'Zapisywanie…' : 'Zapisz zawodnika'}
        </button>
      </div>
    </form>
  );
}
