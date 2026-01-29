import { useEffect, useState } from 'react';
import { api } from '../api';
import { apiMutations } from '../api';
import type { Person } from '../types';

const PERSON_TYPES: { value: Person['personType']; label: string }[] = [
  { value: 'PARENT', label: 'Opiekun' },
  { value: 'SCOUT', label: 'Skaut' },
  { value: 'COACH', label: 'Trener' },
];

export function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    personType: 'SCOUT' as Person['personType'],
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setError(null);
    setLoading(true);
    api.getPersons()
      .then(setPersons)
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Błąd ładowania');
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setSubmitting(true);
    try {
      await apiMutations.createPerson({
        personType: form.personType,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      });
      setForm({ ...form, firstName: '', lastName: '', phone: '', email: '' });
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = (t: Person['personType']) => PERSON_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="docs-content">
      <h1>Osoby</h1>
      <p className="page-section-desc">
        Opiekunowie (PARENT), skauci (SCOUT), trenerzy (COACH) – używane przy zawodnikach i obserwacjach.
      </p>

      <div className="docs-card" style={{ marginBottom: '1.5rem', maxWidth: '28rem' }}>
        <h2 className="text-lg font-semibold mb-2">Dodaj osobę</h2>
        <form onSubmit={handleAdd} className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Typ</label>
            <select
              className="w-full rounded border px-2 py-1 text-sm"
              value={form.personType}
              onChange={(e) => setForm((prev) => ({ ...prev, personType: e.target.value as Person['personType'] }))}
            >
              {PERSON_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Imię *</label>
              <input
                type="text"
                className="w-full rounded border px-2 py-1 text-sm"
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nazwisko *</label>
              <input
                type="text"
                className="w-full rounded border px-2 py-1 text-sm"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="text"
              className="w-full rounded border px-2 py-1 text-sm"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="text"
              className="w-full rounded border px-2 py-1 text-sm"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50">
            Dodaj
          </button>
        </form>
      </div>

      {loading ? (
        <p className="docs-loading">Ładowanie osób...</p>
      ) : error ? (
        <div className="docs-alert-error">
          <p className="docs-alert-title">Błąd</p>
          <p className="docs-alert-body">{error}</p>
          <button type="button" onClick={load} className="btn-secondary">Ponów</button>
        </div>
      ) : persons.length === 0 ? (
        <p className="docs-loading">Brak osób.</p>
      ) : (
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Typ</th>
                <th>Imię i nazwisko</th>
                <th>Telefon</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p) => (
                <tr key={p.id}>
                  <td>{typeLabel(p.personType)}</td>
                  <td>{p.firstName} {p.lastName}</td>
                  <td>{p.phone ?? '—'}</td>
                  <td>{p.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
