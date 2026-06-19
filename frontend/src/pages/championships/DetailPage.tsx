import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface ChampionshipDetail {
  id: string;
  name: string;
  description?: string;
  status: string;
  format: string;
  minStars?: number;
  maxStars?: number;
  gameName: string;
  gameInscriptionMode: string;
  organizerPlatformId: string;
}

const statusLabel: Record<string, string> = {
  Draft: 'Rascunho',
  EnrollmentsOpen: 'Inscrições abertas',
  InProgress: 'Em andamento',
  Finished: 'Encerrado',
};

export default function ChampionshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const { session } = useAuth();
  const [championship, setChampionship] = useState<ChampionshipDetail | null>(null);
  const [identityName, setIdentityName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/v1/championships/${id}`)
      .then(r => setChampionship(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEnroll() {
    setMessage('');
    try {
      const payload = championship?.gameInscriptionMode === 'OwnIdentity' ? { identityName } : {};
      await api.post(`/api/v1/championships/${id}/enrollments`, payload);
      setMessage('Inscrito com sucesso!');
    } catch (err: any) {
      setMessage(err.response?.data?.error ?? 'Erro ao se inscrever.');
    }
  }

  async function handleOpenEnrollments() {
    await api.patch(`/api/v1/championships/${id}/open`);
    setChampionship(prev => prev ? { ...prev, status: 'EnrollmentsOpen' } : null);
  }

  async function handleStart() {
    await api.patch(`/api/v1/championships/${id}/start`);
    setChampionship(prev => prev ? { ...prev, status: 'InProgress' } : null);
  }

  if (loading || !championship) return <p>Carregando...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h1>{championship.name}</h1>
      <p>{championship.description}</p>
      <p><strong>Jogo:</strong> {championship.gameName}</p>
      <p><strong>Formato:</strong> {championship.format === 'DoubleRound' ? 'Ida e volta' : 'Somente ida'}</p>
      <p><strong>Status:</strong> {statusLabel[championship.status]}</p>
      <p><strong>Organizador:</strong> @{championship.organizerPlatformId}</p>
      {championship.minStars && <p><strong>Stars:</strong> {championship.minStars} – {championship.maxStars}</p>}

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {championship.status === 'EnrollmentsOpen' && session && (
          <div>
            {championship.gameInscriptionMode === 'OwnIdentity' && (
              <input placeholder="Nome do seu clube/dupla" value={identityName}
                onChange={e => setIdentityName(e.target.value)} />
            )}
            <button onClick={handleEnroll}>Inscrever-se</button>
          </div>
        )}

        {session && (
          <>
            {championship.status === 'Draft' && (
              <button onClick={handleOpenEnrollments}>Abrir inscrições</button>
            )}
            {championship.status === 'EnrollmentsOpen' && (
              <>
                <Link to={`/championships/${id}/draft`}><button>Sorteio ao vivo</button></Link>
                <button onClick={handleStart}>Iniciar campeonato</button>
              </>
            )}
            {championship.status === 'InProgress' && (
              <Link to={`/championships/${id}/league`}><button>Ver tabela/rodadas</button></Link>
            )}
          </>
        )}
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
