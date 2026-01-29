import { Link, useNavigate } from 'react-router-dom';
import { apiMutations } from '../api';
import { EventForm } from '../components/EventForm';

export function NewEventPage() {
  const navigate = useNavigate();

  return (
    <div className="docs-content">
      <Link to="/events" className="docs-back-link">
        ← Powrót do listy
      </Link>
      <div className="docs-card" style={{ maxWidth: '36rem' }}>
        <h1 className="docs-card-title">Nowe wydarzenie</h1>
        <p className="docs-card-desc">
          Dodaj mecz lub turniej. Pola oznaczone * są wymagane.
        </p>
        <EventForm
          onCancel={() => navigate('/events')}
          onSubmit={async (input) => {
            try {
              await apiMutations.createEvent(input);
              navigate('/events');
            } catch (e) {
              alert((e as Error).message);
            }
          }}
        />
      </div>
    </div>
  );
}
