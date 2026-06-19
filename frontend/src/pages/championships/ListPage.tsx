import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';

interface Championship {
  id: string;
  name: string;
  status: string;
  format: string;
  gameId: string;
  organizerId: string;
  createdAt: string;
}

const statusLabel: Record<string, string> = {
  Draft: 'Rascunho',
  EnrollmentsOpen: 'Inscrições abertas',
  InProgress: 'Em andamento',
  Finished: 'Encerrado',
};

const statusBadge: Record<string, string> = {
  Draft: 'badge badge-muted',
  EnrollmentsOpen: 'badge badge-green',
  InProgress: 'badge badge-cyan',
  Finished: 'badge badge-muted',
};

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 18, width: '65%' }} />
      <div className="skeleton" style={{ height: 13, width: '40%' }} />
      <div className="skeleton" style={{ height: 13, width: '30%' }} />
    </div>
  );
}

export default function ChampionshipsListPage() {
  const api = useApi();
  const { session } = useAuth();
  const { role, isActive } = useUserRole();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreate = session && ((role === 'Admin' && isActive) || role === 'SuperAdmin');

  useEffect(() => {
    api.get('/api/v1/championships')
      .then(r => setChampionships(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
              Campeonatos
            </h2>
            {!loading && (
              <p className="text-muted" style={{ fontSize: 14 }}>
                {championships.length > 0
                  ? `${championships.length} campeonato${championships.length > 1 ? 's' : ''} encontrado${championships.length > 1 ? 's' : ''}`
                  : 'Nenhum campeonato ainda'}
              </p>
            )}
          </div>
          {canCreate && (
            <Link to="/championships/new" className="btn btn-primary btn-sm">
              + Criar campeonato
            </Link>
          )}
        </div>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && championships.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'var(--surface)', borderRadius: 16,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏟️</div>
            <h3 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Nenhum campeonato ainda
            </h3>
            <p className="text-muted" style={{ fontSize: 14, marginBottom: 24 }}>
              {canCreate
                ? 'Seja o primeiro a criar um campeonato nesta plataforma.'
                : 'Aguarde um organizador criar o próximo campeonato.'}
            </p>
            {canCreate && (
              <Link to="/championships/new" className="btn btn-primary">
                + Criar primeiro campeonato
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && championships.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {championships.map(c => (
              <Link key={c.id} to={`/championships/${c.id}`} style={{ textDecoration: 'none' }}>
                <div
                  className="card card-hover"
                  style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h3 style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                      {c.name}
                    </h3>
                    <span className={statusBadge[c.status] ?? 'badge badge-muted'}>
                      {statusLabel[c.status] ?? c.status}
                    </span>
                  </div>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    {c.format === 'DoubleRound' ? '↔ Ida e volta' : '→ Somente ida'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
