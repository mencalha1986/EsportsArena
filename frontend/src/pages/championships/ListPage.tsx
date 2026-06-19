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

const statusColor: Record<string, string> = {
  Draft: '#707090',
  EnrollmentsOpen: '#33cc88',
  InProgress: '#00aaff',
  Finished: '#9090b0',
};

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
    <div style={{ minHeight: '100vh', background: '#0d0d1a', padding: '40px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
              Campeonatos
            </h2>
            <p style={{ color: '#7070a0', fontSize: 14, marginTop: 4 }}>
              {championships.length > 0 ? `${championships.length} campeonato${championships.length > 1 ? 's' : ''} encontrado${championships.length > 1 ? 's' : ''}` : 'Nenhum campeonato ainda'}
            </p>
          </div>
          {canCreate && (
            <Link to="/championships/new" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#00aaff',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}>
                + Criar campeonato
              </button>
            </Link>
          )}
        </div>

        {loading && (
          <p style={{ color: '#7070a0', textAlign: 'center', marginTop: 60 }}>Carregando...</p>
        )}

        {!loading && championships.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: '#7070a0', fontSize: 16 }}>Nenhum campeonato encontrado.</p>
            {canCreate && (
              <p style={{ color: '#505070', fontSize: 13, marginTop: 8 }}>
                Crie o primeiro campeonato usando o botão acima.
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {championships.map(c => (
            <Link key={c.id} to={`/championships/${c.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '20px 24px',
                transition: 'border-color 0.2s, background 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,170,255,0.3)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,170,255,0.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <h3 style={{ color: '#e0e0ff', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>
                  {c.name}
                </h3>
                <p style={{
                  color: statusColor[c.status] ?? '#9090b0',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin: '0 0 4px',
                }}>
                  {statusLabel[c.status] ?? c.status}
                </p>
                <p style={{ color: '#606080', fontSize: 13, margin: 0 }}>
                  {c.format === 'DoubleRound' ? 'Ida e volta' : 'Somente ida'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
