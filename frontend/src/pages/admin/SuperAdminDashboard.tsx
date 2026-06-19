import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

interface GameRanking {
  gameName: string;
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

function StatCard({ label, value, sub, color = '#00aaff' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 14,
      padding: '28px 24px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ color: '#7070a0', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ color: '#505070', fontSize: 12, marginTop: 8 }}>
          {sub}
        </div>
      )}
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

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.5 }}>
              Dashboard
            </h2>
            <p style={{ color: '#7070a0', fontSize: 14, margin: 0 }}>
              Visão geral da plataforma EsportsArena
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/admin" style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ccc',
              padding: '8px 18px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
            }}>
              Gerenciar Usuários
            </Link>
            <Link to="/championships" style={{
              background: '#00aaff',
              color: '#000',
              padding: '8px 18px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 700,
            }}>
              Ver Campeonatos
            </Link>
          </div>
        </div>

        {loading && (
          <p style={{ color: '#7070a0', textAlign: 'center', marginTop: 60 }}>Carregando métricas...</p>
        )}

        {error && (
          <div style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 8, color: '#ff6b6b', padding: '12px 16px', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
              <StatCard
                label="Usuários cadastrados"
                value={stats.totalUsers}
                sub="jogadores e admins ativos"
                color="#00aaff"
              />
              <StatCard
                label="Admins ativos"
                value={stats.totalAdmins}
                sub="organizadores com licença"
                color="#c084fc"
              />
              <StatCard
                label="Total de campeonatos"
                value={stats.totalChampionships}
                sub={`${stats.championshipsFinished} finalizados`}
                color="#33cc88"
              />
              <StatCard
                label="Em andamento"
                value={stats.championshipsInProgress}
                sub={`${stats.championshipsOpen} com inscrições abertas`}
                color="#f59e0b"
              />
            </div>

            {/* Status breakdown + game ranking side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Status breakdown */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '28px 24px',
              }}>
                <h3 style={{ color: '#e0e0ff', fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>
                  Campeonatos por status
                </h3>
                {[
                  { label: 'Inscrições abertas', value: stats.championshipsOpen, color: '#33cc88' },
                  { label: 'Em andamento', value: stats.championshipsInProgress, color: '#00aaff' },
                  { label: 'Finalizados', value: stats.championshipsFinished, color: '#7070a0' },
                  { label: 'Rascunho', value: stats.totalChampionships - stats.championshipsOpen - stats.championshipsInProgress - stats.championshipsFinished, color: '#505070' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, color: '#9090b0', fontSize: 14 }}>{item.label}</div>
                    <div style={{ color: '#e0e0ff', fontWeight: 700, fontSize: 16 }}>{item.value}</div>
                    <div style={{ width: 80 }}>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{
                          background: item.color,
                          height: '100%',
                          width: stats.totalChampionships > 0
                            ? `${Math.round((item.value / stats.totalChampionships) * 100)}%`
                            : '0%',
                          borderRadius: 4,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Game ranking */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '28px 24px',
              }}>
                <h3 style={{ color: '#e0e0ff', fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>
                  Ranking de jogos
                </h3>
                {stats.gameRankings.length === 0 && (
                  <p style={{ color: '#505070', fontSize: 14 }}>Nenhum jogo cadastrado ainda.</p>
                )}
                {stats.gameRankings.map((g, i) => (
                  <div key={g.gameName} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: i === 0 ? '#f59e0b' : i === 1 ? '#9090b0' : i === 2 ? '#cd7c4e' : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: '#000', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    {g.iconUrl ? (
                      <img src={g.iconUrl} alt={g.gameName} style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }} />
                    ) : null}
                    <div style={{ flex: 1, color: '#e0e0ff', fontSize: 14, fontWeight: 600 }}>{g.gameName}</div>
                    <div style={{ color: '#7070a0', fontSize: 13 }}>
                      {g.championshipCount} camp.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
