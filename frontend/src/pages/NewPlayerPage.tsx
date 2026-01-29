import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { PlayerForm } from '../components/PlayerForm';
import { playersRepo } from '../data/repositories/playersRepo';

export function NewPlayerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="docs-content">
      <Link to="/players" className="docs-back-link">
        ← Powrót do listy
      </Link>
      <div className="docs-card" style={{ maxWidth: '36rem' }}>
        <h1 className="docs-card-title">Nowy zawodnik</h1>
        <p className="docs-card-desc">
          Wypełnij dane zawodnika. Pola oznaczone * są wymagane.
        </p>
        <PlayerForm
          onCancel={() => navigate('/players')}
          onSubmit={async (input) => {
            try {
              await playersRepo.createLocalFirst(input, user?.id);
              navigate('/players');
            } catch (e) {
              alert((e as Error).message);
            }
          }}
        />
      </div>
    </div>
  );
}
