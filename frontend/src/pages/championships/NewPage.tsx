import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

interface Game {
  id: string;
  name: string;
  inscriptionMode: string;
  scoreDisplay: string;
}

export default function NewChampionshipPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('SingleRound');
  const [minStars, setMinStars] = useState('');
  const [maxStars, setMaxStars] = useState('');
  const [error, setError] = useState('');

  const selectedGame = games.find(g => g.id === gameId);
  const isLicensedTeams = selectedGame?.inscriptionMode === 'LicensedTeams';

  useEffect(() => {
    api.get('/api/v1/games').then(r => setGames(r.data.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload: Record<string, unknown> = { gameId, name, description, format };
      if (isLicensedTeams) {
        if (minStars) payload.minStars = Number(minStars);
        if (maxStars) payload.maxStars = Number(maxStars);
      }
      const { data } = await api.post('/api/v1/championships', payload);
      navigate(`/championships/${data.data}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao criar campeonato.');
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <h1>Criar campeonato</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Jogo</label>
          <select value={gameId} onChange={e => setGameId(e.target.value)} required>
            <option value="">Selecione...</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label>Nome do campeonato</label>
          <input value={name} onChange={e => setName(e.target.value)} required maxLength={150} />
        </div>
        <div>
          <label>Descrição (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} />
        </div>
        <div>
          <label>Formato</label>
          <select value={format} onChange={e => setFormat(e.target.value)}>
            <option value="SingleRound">Somente ida (turno único)</option>
            <option value="DoubleRound">Ida e volta (turno e returno)</option>
          </select>
        </div>
        {isLicensedTeams && (
          <div>
            <label>Filtro de estrelas (opcional)</label>
            <input type="number" min={1} max={5} placeholder="Mín" value={minStars} onChange={e => setMinStars(e.target.value)} style={{ width: 60 }} />
            {' a '}
            <input type="number" min={1} max={5} placeholder="Máx" value={maxStars} onChange={e => setMaxStars(e.target.value)} style={{ width: 60 }} />
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Criar</button>
      </form>
    </div>
  );
}
