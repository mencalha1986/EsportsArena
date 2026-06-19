interface StandingRow {
  enrollmentId: string;
  playerPlatformId: string;
  displayName: string;
  teamName?: string;
  teamLogoUrl?: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  winPct: number;
}

interface Props {
  standings: StandingRow[];
  scoreDisplay: string;
}

export default function StandingsTable({ standings, scoreDisplay }: Props) {
  const gfLabel = scoreDisplay === 'goals' ? 'GP' : scoreDisplay === 'sets' ? 'SP' : 'PF';
  const gcLabel = scoreDisplay === 'goals' ? 'GC' : scoreDisplay === 'sets' ? 'SC' : 'PC';
  const sgLabel = scoreDisplay === 'goals' ? 'SG' : scoreDisplay === 'sets' ? 'SS' : 'SD';

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ background: '#f0f0f0' }}>
          <th>#</th>
          <th style={{ textAlign: 'left' }}>Jogador / Time</th>
          <th>P</th>
          <th>J</th>
          <th>V</th>
          <th>E</th>
          <th>D</th>
          <th>{gfLabel}</th>
          <th>{gcLabel}</th>
          <th>{sgLabel}</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((row, idx) => (
          <tr key={row.enrollmentId} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
            <td>
              {row.teamLogoUrl && <img src={row.teamLogoUrl} alt="" style={{ width: 20, height: 20, marginRight: 6, verticalAlign: 'middle' }} />}
              <span>{row.displayName}</span>
              {row.teamName && <span style={{ color: '#666', fontSize: 12 }}> ({row.teamName})</span>}
            </td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{row.points}</td>
            <td style={{ textAlign: 'center' }}>{row.played}</td>
            <td style={{ textAlign: 'center' }}>{row.wins}</td>
            <td style={{ textAlign: 'center' }}>{row.draws}</td>
            <td style={{ textAlign: 'center' }}>{row.losses}</td>
            <td style={{ textAlign: 'center' }}>{row.goalsFor}</td>
            <td style={{ textAlign: 'center' }}>{row.goalsAgainst}</td>
            <td style={{ textAlign: 'center' }}>{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
            <td style={{ textAlign: 'center' }}>{row.winPct.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
