import { useEffect, useMemo, useState } from 'react';
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
  gameName: string;
  gameCategory: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const canCreate = session && ((role === 'Admin' && isActive) || role === 'SuperAdmin');

  useEffect(() => {
    api.get('/api/v1/championships')
      .then(r => setChampionships(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(championships.map(c => c.gameCategory).filter(Boolean));
    return ['Todos', ...Array.from(cats).sort()];
  }, [championships]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'Todos') return championships;
    return championships.filter(c => c.gameCategory === selectedCategory);
  }, [championships, selectedCategory]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
              Campeonatos
            </h2>
            {!loading && (
              <p className="text-muted" style={{ fontSize: 14 }}>
                {filtered.length > 0
                  ? `${filtered.length} campeonato${filtered.length > 1 ? 's' : ''} encontrado${filtered.length > 1 ? 's' : ''}`
                  : 'Nenhum campeonato nesta categoria'}
              </p>
            )}
          </div>
          {canCreate && (
            <Link to="/championships/new" className="btn btn-primary btn-sm">
              + Criar campeonato
            </Link>
          )}
        </div>

        {/* Category filter chips */}
        {!loading && categories.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1px solid',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: selectedCategory === cat ? 'var(--accent)' : 'var(--surface)',
                  borderColor: selectedCategory === cat ? 'var(--accent)' : 'var(--border)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'var(--surface)', borderRadius: 16,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏟️</div>
            <h3 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {championships.length === 0 ? 'Nenhum campeonato ainda' : 'Sem campeonatos nesta categoria'}
            </h3>
            <p className="text-muted" style={{ fontSize: 14, marginBottom: 24 }}>
              {championships.length === 0
                ? canCreate
                  ? 'Seja o primeiro a criar um campeonato nesta plataforma.'
                  : 'Aguarde um organizador criar o próximo campeonato.'
                : 'Tente selecionar outra categoria.'}
            </p>
            {championships.length === 0 && canCreate && (
              <Link to="/championships/new" className="btn btn-primary">
                + Criar primeiro campeonato
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(c => (
              <Link key={c.id} to={`/championships/${c.id}`} style={{ textDecoration: 'none' }}>
                <div
                  className="card card-hover"
                  style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', height: '100%' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h3 style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                      {c.name}
                    </h3>
                    <span className={statusBadge[c.status] ?? 'badge badge-muted'}>
                      {statusLabel[c.status] ?? c.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, margin: 0 }}>
                    🎮 {c.gameName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {c.format === 'DoubleRound' ? '↔ Ida e volta' : '→ Somente ida'}
                    </span>
                    {c.gameCategory && c.gameCategory !== 'Other' && (
                      <>
                        <span style={{ color: 'var(--border)' }}>·</span>
                        <span className="text-muted" style={{ fontSize: 12 }}>{c.gameCategory}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
