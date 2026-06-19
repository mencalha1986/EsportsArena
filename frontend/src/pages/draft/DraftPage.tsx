import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface DrawResult {
  enrollmentId: string;
  playerPlatformId: string;
  teamId: string;
  teamName: string;
  teamStars: number;
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function DraftPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const { token } = useAuth();
  const [draws, setDraws] = useState<DrawResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const hubRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const hub = new HubConnectionBuilder()
      .withUrl(`${API}/hubs/draft`, { accessTokenFactory: () => token ?? '' })
      .withAutomaticReconnect()
      .build();

    hub.on('TeamDrawn', (draw: DrawResult) => {
      setDraws(prev => [...prev, draw]);
    });

    hub.start()
      .then(() => hub.invoke('JoinChampionship', id))
      .catch(console.error);

    hubRef.current = hub;
    return () => { hub.stop(); };
  }, [id, token]);

  async function handleRunDraft() {
    setError('');
    setRunning(true);
    try {
      const { data } = await api.post(`/api/v1/championships/${id}/draft`);
      // Results also arrive via SignalR, but set them from HTTP response as fallback
      setDraws(data.data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro no sorteio.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h1>Sorteio ao Vivo</h1>

      <button onClick={handleRunDraft} disabled={running} style={{ marginBottom: 24 }}>
        {running ? 'Sorteando...' : '🎲 Iniciar sorteio'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {draws.map((d, i) => (
          <div key={i} style={{ border: '2px solid #6c63ff', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#666' }}>@{d.playerPlatformId}</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', margin: '8px 0' }}>{d.teamName}</div>
            <div>{'★'.repeat(d.teamStars)}{'☆'.repeat(5 - d.teamStars)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
