import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

interface Championship {
  id: string;
  name: string;
  status: string;
  format: string;
  gameId: string;
  organizerId: string;
  createdAt: string;
}

export default function ChampionshipsListPage() {
  const api = useApi();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/championships')
      .then(r => setChampionships(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusLabel: Record<string, string> = {
    Draft: 'Rascunho',
    EnrollmentsOpen: 'Inscrições abertas',
    InProgress: 'Em andamento',
    Finished: 'Encerrado',
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Campeonatos</h1>
        <Link to="/championships/new"><button>+ Criar campeonato</button></Link>
      </div>

      {championships.length === 0 && <p>Nenhum campeonato encontrado.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
        {championships.map(c => (
          <Link key={c.id} to={`/championships/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
              <h3>{c.name}</h3>
              <p>{statusLabel[c.status] ?? c.status}</p>
              <p>{c.format === 'DoubleRound' ? 'Ida e volta' : 'Somente ida'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
