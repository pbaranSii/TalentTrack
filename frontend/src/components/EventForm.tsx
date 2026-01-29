import { useState } from 'react';
import type { CreateEventInput } from '../api';

interface EventFormProps {
  onSubmit: (input: CreateEventInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<CreateEventInput>({
    type: 'MATCH',
    date: today,
    time: '12:00',
    location: '',
    ageCategory: 'U13',
    homeTeam: '',
    awayTeam: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof CreateEventInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.type) {
      e.type = 'Typ wydarzenia jest wymagany.';
    }
    if (!form.date) {
      e.date = 'Data jest wymagana.';
    }
    if (!form.location) {
      e.location = 'Miejsce jest wymagane.';
    }
    if (!form.ageCategory) {
      e.ageCategory = 'Kategoria wiekowa jest wymagana.';
    }
    if (!form.homeTeam) {
      e.homeTeam = 'Gospodarz / nazwa turnieju jest wymagana.';
    }
    if (form.type === 'MATCH' && !form.awayTeam) {
      e.awayTeam = 'Dla meczu wymagany jest zespół gości.';
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

  const isMatch = form.type === 'MATCH';

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: '1rem' }}>
        <div className="docs-form-group">
          <label className="docs-form-label">Typ wydarzenia*</label>
          <select
            className="docs-form-select"
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value as CreateEventInput['type'])}
          >
            <option value="MATCH">Mecz</option>
            <option value="TOURNAMENT">Turniej</option>
          </select>
          {errors.type && <p className="docs-form-error">{errors.type}</p>}
        </div>
        <div className="docs-form-group">
          <label className="docs-form-label">Data*</label>
          <input
            type="date"
            className="docs-form-input"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          {errors.date && <p className="docs-form-error">{errors.date}</p>}
        </div>
        <div className="docs-form-group">
          <label className="docs-form-label">Godzina</label>
          <input
            type="time"
            className="docs-form-input"
            value={form.time}
            onChange={(e) => handleChange('time', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))', gap: '1rem' }}>
        <div className="docs-form-group">
          <label className="docs-form-label">Miejsce*</label>
          <input
            type="text"
            className="docs-form-input"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          {errors.location && <p className="docs-form-error">{errors.location}</p>}
        </div>
        <div className="docs-form-group">
          <label className="docs-form-label">Kategoria wiekowa*</label>
          <select
            className="docs-form-select"
            value={form.ageCategory}
            onChange={(e) => handleChange('ageCategory', e.target.value)}
          >
            <option value="U8">U8</option>
            <option value="U9">U9</option>
            <option value="U10">U10</option>
            <option value="U11">U11</option>
            <option value="U12">U12</option>
            <option value="U13">U13</option>
            <option value="U14">U14</option>
            <option value="U15">U15</option>
            <option value="U16">U16</option>
            <option value="U17">U17</option>
            <option value="U18">U18</option>
            <option value="U19">U19</option>
          </select>
          {errors.ageCategory && <p className="docs-form-error">{errors.ageCategory}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))', gap: '1rem' }}>
        <div className="docs-form-group">
          <label className="docs-form-label">{isMatch ? 'Gospodarz*' : 'Nazwa turnieju*'}</label>
          <input
            type="text"
            className="docs-form-input"
            value={form.homeTeam}
            onChange={(e) => handleChange('homeTeam', e.target.value)}
          />
          {errors.homeTeam && <p className="docs-form-error">{errors.homeTeam}</p>}
        </div>
        {isMatch && (
          <div className="docs-form-group">
            <label className="docs-form-label">Goście*</label>
            <input
              type="text"
              className="docs-form-input"
              value={form.awayTeam}
              onChange={(e) => handleChange('awayTeam', e.target.value)}
            />
            {errors.awayTeam && <p className="docs-form-error">{errors.awayTeam}</p>}
          </div>
        )}
      </div>

      <div className="docs-form-group">
        <label className="docs-form-label">Notatki</label>
        <textarea
          className="docs-form-textarea"
          rows={3}
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>

      <div className="docs-form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Anuluj
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Zapisywanie…' : 'Zapisz wydarzenie'}
        </button>
      </div>
    </form>
  );
}

