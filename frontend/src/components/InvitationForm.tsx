import { useEffect, useState } from 'react';
import type { CreateInvitationInput } from '../api';
import { api } from '../api';
import type { Team } from '../types';

const STATUSES: { value: CreateInvitationInput['status']; label: string }[] = [
  { value: 'SENT', label: 'Wysłane' },
  { value: 'ACCEPTED', label: 'Zaakceptowane' },
  { value: 'DECLINED', label: 'Odrzucone' },
  { value: 'NO_RESPONSE', label: 'Brak odpowiedzi' },
];

interface InvitationFormProps {
  playerId: string;
  onSubmit: (input: CreateInvitationInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function InvitationForm({ playerId, onSubmit, onCancel }: InvitationFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<CreateInvitationInput>({
    playerId,
    invitationDate: today,
    month: new Date().getMonth() + 1,
    teamId: null,
    status: 'SENT',
    comment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getTeams().then(setTeams).catch(() => setTeams([]));
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.invitationDate) e.invitationDate = 'Data jest wymagana.';
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
          <label className="docs-form-label">Data zaproszenia *</label>
          <input
            type="date"
            className="docs-form-input"
            value={form.invitationDate}
            onChange={(e) => setForm((prev) => ({ ...prev, invitationDate: e.target.value }))}
          />
          {errors.invitationDate && <p className="docs-form-error">{errors.invitationDate}</p>}
        </div>
        <div>
          <label className="docs-form-label">Miesiąc</label>
          <input
            type="number"
            min={1}
            max={12}
            className="docs-form-input"
            value={form.month ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>
      </div>
      <div>
        <label className="docs-form-label">Drużyna</label>
        <select
          className="docs-form-select"
          value={form.teamId ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, teamId: e.target.value || null }))}
        >
          <option value="">—</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="docs-form-label">Status *</label>
        <select
          className="docs-form-select"
          value={form.status}
          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as CreateInvitationInput['status'] }))}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="docs-form-label">Komentarz</label>
        <textarea
          className="docs-form-textarea"
          rows={2}
          value={form.comment ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value || null }))}
        />
      </div>
      <div className="docs-form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Anuluj
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.75 : 1 }}>
          {submitting ? 'Zapisywanie…' : 'Zapisz zaproszenie'}
        </button>
      </div>
    </form>
  );
}
