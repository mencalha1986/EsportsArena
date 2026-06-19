import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import StandingsTable from '../../components/StandingsTable';
import RoundsViewer from '../../components/RoundsViewer';

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const [standings, setStandings] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [scoreDisplay, setScoreDisplay] = useState('goals');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [standingsRes, roundsRes, champRes] = await Promise.all([
        api.get(`/api/v1/championships/${id}/standings`),
        api.get(`/api/v1/championships/${id}/rounds`),
        api.get(`/api/v1/championships/${id}`),
      ]);
      setStandings(standingsRes.data.data);
      setRounds(roundsRes.data.data);
      setScoreDisplay(champRes.data.data.gameScoreDisplay ?? 'goals');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h2>Classificação</h2>
          <StandingsTable standings={standings} scoreDisplay={scoreDisplay} />
        </div>
        <div>
          <h2>Rodadas</h2>
          <RoundsViewer rounds={rounds} scoreDisplay={scoreDisplay} onScoreUpdated={fetchData} />
        </div>
      </div>
    </div>
  );
}
