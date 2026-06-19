import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

interface ProfileDto {
  id: string;
  platformId: string;
  displayName: string;
  avatarUrl?: string;
  wins: number;
  draws: number;
  losses: number;
  titles: number;
  recentMatches: RecentMatch[];
}

interface RecentMatch {
  championshipName: string;
  opponentPlatformId: string;
  opponentTeamName?: string;
  myScore?: number;
  opponentScore?: number;
  status: string;
  playedAt?: string;
}

export default function ProfilePage() {
  const { platformId } = useParams<{ platformId: string }>();
  const api = useApi();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/v1/users/${platformId}`)
      .then(r => setProfile(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [platformId]);

  if (loading) return <p>Carregando...</p>;
  if (!profile) return <p>Perfil não encontrado.</p>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h1>@{profile.platformId}</h1>
      <h2>{profile.displayName}</h2>
      <div style={{ display: 'flex', gap: 32, margin: '16px 0' }}>
        <div><strong>{profile.titles}</strong><br />Títulos</div>
        <div><strong>{profile.wins}</strong><br />Vitórias</div>
        <div><strong>{profile.draws}</strong><br />Empates</div>
        <div><strong>{profile.losses}</strong><br />Derrotas</div>
      </div>

      <h3>Partidas recentes</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Campeonato</th>
            <th>Adversário</th>
            <th>Placar</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {profile.recentMatches.map((m, i) => (
            <tr key={i}>
              <td>{m.championshipName}</td>
              <td>@{m.opponentPlatformId}{m.opponentTeamName ? ` (${m.opponentTeamName})` : ''}</td>
              <td>{m.myScore ?? '-'} x {m.opponentScore ?? '-'}</td>
              <td>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
