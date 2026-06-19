import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

interface GameRanking {
  gameName: string;
  category: string;
  iconUrl: string | null;
  championshipCount: number;
}

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalChampionships: number;
  championshipsInProgress: number;
  championshipsFinished: number;
  championshipsOpen: number;
  gameRankings: GameRanking[];
}

interface CategoryStat {
  category: string;
  count: number;
  games: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  FPS: '#00aaff',
  MOBA: '#a78bfa',
  'Battle Royale': '#34d399',
  Football: '#22d3ee',
  Fighting: '#f87171',
  Racing: '#fbbf24',
  Sports: '#fb923c',
  Strategy: '#818cf8',
  'Card Game': '#e879f9',
  Mobile: '#2dd4bf',
  'Party Game': '#f472b6',
  Chess: '#94a3b8',
  Sandbox: '#a3e635',
  Other: '#6b7280',
};

function getColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? '#00aaff';
}

function KpiCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string; color: string; icon: string;
}) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
      )}
    </div>
  );
}

function CategoryChart({ stats }: { stats: AdminStats }) {
  const categoryMap = new Map<string, CategoryStat>();

  for (const g of stats.gameRankings) {
    const cat = g.category || 'Other';
    const existing = categoryMap.get(cat);
    if (existing) {
      existing.count += g.championshipCount;
      existing.games += 1;
    } else {
      categoryMap.set(cat, { category: cat, count: g.championshipCount, games: 1 });
    }
  }

  const categories = Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  const maxCount = Math.max(...categories.map(c => c.count), 1);
  const totalGames = stats.gameRankings.length;

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Nenhum jogo cadastrado ainda.{' '}
        <Link to="/admin/games" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          Cadastrar jogos →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
          {totalGames} jogo{totalGames !== 1 ? 's' : ''} cadastrado{totalGames !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
          campeonatos
        </span>
      </div>

      {categories.map(cat => {
        const color = getColor(cat.category);
        const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
        return (
          <div key={cat.category}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{cat.category}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  ({cat.games} jogo{cat.games !== 1 ? 's' : ''})
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: cat.count > 0 ? color : 'var(--text-muted)', minWidth: 24, textAlign: 'right' }}>
                {cat.count}
              </span>
            </div>
            <div style={{
              height: 8,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 100,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}cc, ${color})`,
                borderRadius: 100,
                transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                minWidth: cat.count > 0 ? 6 : 0,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const api = useApi();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/admin/users/stats')
      .then(r => setStats(r.data.data))
      .catch(() => setError('Não foi possível carregar as métricas.'))
      .finally(() => setLoading(false));
  }, []);

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 32px', animation: 'fadeIn 0.25s ease' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
              Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Visão geral da plataforma EsportsArena
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/admin/games" className="btn btn-outline btn-sm">🎮 Jogos</Link>
            <Link to="/admin" className="btn btn-outline btn-sm">👥 Clientes</Link>
            <Link to="/championships" className="btn btn-primary btn-sm">🏆 Campeonatos</Link>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            Carregando métricas...
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius)', color: 'var(--error)', padding: '12px 16px', marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* KPI Cards — 4 principais */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              <KpiCard
                label="Total de Campeonatos"
                value={stats.totalChampionships}
                sub={`${stats.championshipsFinished} finalizados`}
                color="var(--accent)"
                icon="🏆"
              />
              <KpiCard
                label="Usuários no Sistema"
                value={stats.totalUsers}
                sub={`${stats.totalAdmins} organizadores ativos`}
                color="var(--purple)"
                icon="👥"
              />
              <KpiCard
                label="Em Andamento"
                value={stats.championshipsInProgress}
                sub="campeonatos ativos agora"
                color="var(--warning)"
                icon="⚡"
              />
              <KpiCard
                label="Inscrições Abertas"
                value={stats.championshipsOpen}
                sub="aguardando participantes"
                color="var(--success)"
                icon="📋"
              />
            </div>

            {/* Gráfico + Ranking lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Gráfico por categoria */}
              <div style={cardStyle}>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>
                    Campeonatos por Categoria
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    Distribuição dos jogos cadastrados e seus campeonatos
                  </p>
                </div>
                <CategoryChart stats={stats} />
              </div>

              {/* Status + Jogos top */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Status de campeonatos */}
                <div style={{ ...cardStyle, flex: '0 0 auto' }}>
                  <h2 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>
                    Status dos Campeonatos
                  </h2>
                  {[
                    { label: 'Inscrições abertas', value: stats.championshipsOpen, color: 'var(--success)' },
                    { label: 'Em andamento', value: stats.championshipsInProgress, color: 'var(--accent)' },
                    { label: 'Finalizados', value: stats.championshipsFinished, color: 'var(--text-muted)' },
                    {
                      label: 'Rascunho',
                      value: stats.totalChampionships - stats.championshipsOpen - stats.championshipsInProgress - stats.championshipsFinished,
                      color: 'var(--border)',
                    },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', minWidth: 28, textAlign: 'right' }}>{item.value}</span>
                      <div style={{ width: 72 }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                          <div style={{
                            background: item.color,
                            height: '100%',
                            borderRadius: 4,
                            width: stats.totalChampionships > 0
                              ? `${Math.round((item.value / stats.totalChampionships) * 100)}%`
                              : '0%',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top jogos */}
                <div style={{ ...cardStyle, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Top Jogos</h2>
                    <Link to="/admin/games" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                      Ver todos →
                    </Link>
                  </div>

                  {stats.gameRankings.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum jogo cadastrado ainda.</p>
                  ) : (
                    stats.gameRankings.slice(0, 6).map((g, i) => {
                      const medal = i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c4e' : 'var(--surface-alt)';
                      const medalText = i < 3 ? '#000' : 'var(--text-muted)';
                      return (
                        <div key={g.gameName} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: medal, color: medalText,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, flexShrink: 0,
                          }}>
                            {i + 1}
                          </div>
                          {g.iconUrl && (
                            <img src={g.iconUrl} alt="" style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {g.gameName}
                            </div>
                            <div style={{ fontSize: 11, color: getColor(g.category) }}>{g.category}</div>
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
                            {g.championshipCount} camp.
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
