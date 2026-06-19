import { useState } from 'react';
import { useApi } from '../hooks/useApi';

interface MatchDto {
  id: string;
  homeEnrollmentId: string;
  homePlatformId: string;
  homeTeamName?: string;
  homeTeamLogo?: string;
  awayEnrollmentId: string;
  awayPlatformId: string;
  awayTeamName?: string;
  awayTeamLogo?: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  playedAt?: string;
}

interface RoundDto {
  id: string;
  number: number;
  label?: string;
  matches: MatchDto[];
}

interface Props {
  rounds: RoundDto[];
  scoreDisplay: string;
  onScoreUpdated: () => void;
}

export default function RoundsViewer({ rounds, onScoreUpdated }: Props) {
  const api = useApi();
  const [currentRound, setCurrentRound] = useState(0);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const round = rounds[currentRound];
  if (!round) return <p>Nenhuma rodada disponível.</p>;

  async function saveScore(matchId: string) {
    const s = scores[matchId];
    if (!s) return;
    setSaving(matchId);
    try {
      await api.patch(`/api/v1/matches/${matchId}/score`, {
        homeScore: Number(s.home),
        awayScore: Number(s.away)
      });
      onScoreUpdated();
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro ao salvar placar.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setCurrentRound(Math.max(0, currentRound - 1))} disabled={currentRound === 0}>◀</button>
        <h3 style={{ margin: 0 }}>{round.label ?? `Rodada ${round.number}`}</h3>
        <button onClick={() => setCurrentRound(Math.min(rounds.length - 1, currentRound + 1))} disabled={currentRound === rounds.length - 1}>▶</button>
        <span style={{ color: '#666', fontSize: 12 }}>{currentRound + 1} / {rounds.length}</span>
      </div>

      {round.matches.map(match => (
        <div key={match.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ flex: 1, textAlign: 'right' }}>
              {match.homeTeamLogo && <img src={match.homeTeamLogo} alt="" style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 4 }} />}
              @{match.homePlatformId}{match.homeTeamName ? ` (${match.homeTeamName})` : ''}
            </span>

            {match.status === 'Played' || match.status === 'WO' ? (
              <span style={{ fontWeight: 'bold', fontSize: 18, minWidth: 60, textAlign: 'center' }}>
                {match.homeScore} × {match.awayScore}
                {match.status === 'WO' && <span style={{ fontSize: 11, color: '#c00', marginLeft: 4 }}>W.O.</span>}
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="number" min={0} style={{ width: 45, textAlign: 'center' }}
                  placeholder="0"
                  value={scores[match.id]?.home ?? ''}
                  onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
                />
                <span>×</span>
                <input
                  type="number" min={0} style={{ width: 45, textAlign: 'center' }}
                  placeholder="0"
                  value={scores[match.id]?.away ?? ''}
                  onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
                />
                <button
                  onClick={() => saveScore(match.id)}
                  disabled={!scores[match.id]?.home || !scores[match.id]?.away || saving === match.id}
                  style={{ fontSize: 11 }}
                >
                  {saving === match.id ? '...' : 'Salvar'}
                </button>
              </div>
            )}

            <span style={{ flex: 1 }}>
              {match.awayTeamLogo && <img src={match.awayTeamLogo} alt="" style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 4 }} />}
              @{match.awayPlatformId}{match.awayTeamName ? ` (${match.awayTeamName})` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
