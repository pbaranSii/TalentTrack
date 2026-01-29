import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ObservationForm } from '../components/ObservationForm';
import { observationsRepo } from '../data/repositories/observationsRepo';

export function NewObservationPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (!id) {
    return (
      <div className="docs-content">
        <p>Brak ID zawodnika.</p>
        <Link to="/players">← Powrót</Link>
      </div>
    );
  }

  return (
    <div className="docs-content">
      <Link to={`/players/${id}`} className="docs-back-link">← Powrót do profilu zawodnika</Link>
      <div className="docs-card" style={{ maxWidth: '36rem' }}>
        <h1 className="docs-card-title">Nowa obserwacja</h1>
        <p className="docs-card-desc">Dodaj obserwację dla tego zawodnika.</p>
        <ObservationForm
          playerId={id}
          onCancel={() => navigate(`/players/${id}`)}
          onSubmit={async (input) => {
            await observationsRepo.createLocalFirst(
              {
                ...input,
                scoutId: input.scoutId || user?.id || null,
              },
              user?.id
            );
            navigate(`/players/${id}`);
          }}
        />
      </div>
    </div>
  );
}
