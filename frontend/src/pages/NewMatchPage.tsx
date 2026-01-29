import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { MatchForm } from '../components/MatchForm';
import { matchesRepo } from '../data/repositories/matchesRepo';

export function NewMatchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="docs-content">
      <Link to="/matches" className="docs-back-link">← Powrót do listy</Link>
      <div className="docs-card" style={{ maxWidth: '36rem' }}>
        <h1 className="docs-card-title">Nowy mecz</h1>
        <p className="docs-card-desc">Wypełnij dane meczu (na żywo lub wideo).</p>
        <MatchForm
          onCancel={() => navigate('/matches')}
          onSubmit={async (input) => {
            await matchesRepo.createLocalFirst(input, user?.id);
            navigate('/matches');
          }}
        />
      </div>
    </div>
  );
}
