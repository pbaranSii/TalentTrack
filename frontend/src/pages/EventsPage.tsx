import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Event } from '../types';
import { formatDateEuropean } from '../utils/date';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(() => {
    setError(null);
    setLoading(true);
    api
      .getEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać wydarzeń');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => loadEvents(), 0);
    return () => window.clearTimeout(t);
  }, [loadEvents]);

  return (
    <div className="docs-content">
      <div className="page-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Wydarzenia</h1>
          <p className="page-section-desc">
            Lista meczów i turniejów z backendu (na razie dane w pamięci).
          </p>
        </div>
        <Link to="/events/new" className="btn-primary">
          Dodaj wydarzenie
        </Link>
      </div>

      {loading ? (
        <p className="docs-loading">Ładowanie wydarzeń...</p>
      ) : error ? (
        <div className="docs-alert-error">
          <p className="docs-alert-title">Błąd ładowania danych</p>
          <p className="docs-alert-body">{error}</p>
          <button type="button" onClick={loadEvents} className="btn-secondary">
            Ponów
          </button>
        </div>
      ) : events.length === 0 ? (
        <p className="docs-loading">Brak wydarzeń w systemie.</p>
      ) : (
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Typ</th>
                <th>Kategoria</th>
                <th>Miejsce</th>
                <th>Drużyny / nazwa</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{formatDateEuropean(event.date)}</td>
                  <td>{event.type === 'MATCH' ? 'Mecz' : 'Turniej'}</td>
                  <td>{event.ageCategory}</td>
                  <td>{event.location}</td>
                  <td>
                    {event.type === 'MATCH'
                      ? `${event.homeTeam ?? ''} vs ${event.awayTeam ?? ''}`
                      : event.homeTeam ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

