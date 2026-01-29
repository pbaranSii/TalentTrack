import { useState } from 'react';
import type { CreatePlayerDecisionInput } from '../api';
import type { PlayerDecision } from '../types';

const DECISION_TYPES: { value: PlayerDecision['decisionType']; label: string }[] = [
  { value: 'SIGNED', label: 'Zapisany' },
  { value: 'RESIGNED', label: 'Rezygnacja' },
  { value: 'WATCH', label: 'Obserwuj' },
  { value: 'REJECTED', label: 'Odrzucony' },
  { value: 'INVITE_AGAIN', label: 'Zaprosić ponownie' },
];

interface DecisionFormProps {
  playerId: string;
  onSubmit: (input: CreatePlayerDecisionInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function DecisionForm({ playerId, onSubmit, onCancel }: DecisionFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<CreatePlayerDecisionInput>({
    playerId,
    decisionType: 'WATCH',
    decisionDate: today,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="docs-form-label">Typ decyzji *</label>
        <select
          className="docs-form-select"
          value={form.decisionType}
          onChange={(e) => setForm((prev) => ({ ...prev, decisionType: e.target.value as CreatePlayerDecisionInput['decisionType'] }))}
        >
          {DECISION_TYPES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="docs-form-label">Data decyzji *</label>
        <input
          type="date"
          className="docs-form-input"
          value={form.decisionDate}
          onChange={(e) => setForm((prev) => ({ ...prev, decisionDate: e.target.value }))}
        />
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
          {submitting ? 'Zapisywanie…' : 'Zapisz decyzję'}
        </button>
      </div>
    </form>
  );
}
