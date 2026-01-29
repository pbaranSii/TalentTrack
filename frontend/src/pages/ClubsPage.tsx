import { useEffect, useState } from 'react';
import { api } from '../api';
import { apiMutations } from '../api';
import type { Club } from '../types';

export function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setError(null);
    setLoading(true);
    api.getClubs()
      .then(setClubs)
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
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      await apiMutations.createClub({ name: newName.trim() });
      setNewName('');
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="docs-content">
      <h1>Kluby</h1>
      <p className="page-section-desc">
        Lista klubów – używana przy zawodnikach i drużynach.
      </p>

      <div className="docs-card" style={{ marginBottom: '1.5rem', maxWidth: '24rem' }}>
        <h2 className="text-lg font-semibold mb-2">Dodaj klub</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded border px-2 py-1 text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nazwa klubu"
          />
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50">
            Dodaj
          </button>
        </form>
      </div>

      {loading ? (
        <p className="docs-loading">Ładowanie klubów...</p>
      ) : error ? (
        <div className="docs-alert-error">
          <p className="docs-alert-title">Błąd</p>
          <p className="docs-alert-body">{error}</p>
          <button type="button" onClick={load} className="btn-secondary">Ponów</button>
        </div>
      ) : clubs.length === 0 ? (
        <p className="docs-loading">Brak klubów.</p>
      ) : (
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Nazwa</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
