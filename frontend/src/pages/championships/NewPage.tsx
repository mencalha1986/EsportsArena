import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import CustomSelect from '../../components/CustomSelect';

interface Game {
  id: string;
  name: string;
  category: string;
  inscriptionMode: string;
  scoreDisplay: string;
}

interface LicensedTeamDto {
  id: string;
  name: string;
  stars: number;
  logoUrl: string | null;
}


const textareaStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
  fontFamily: 'var(--font)',
  fontSize: 15,
  padding: '12px 16px',
  outline: 'none',
  resize: 'vertical',
  minHeight: 96,
  transition: 'border-color 0.18s, box-shadow 0.18s',
};

const starBtn = (active: boolean): React.CSSProperties => ({
  width: 38,
  height: 38,
  borderRadius: 8,
  border: `1px solid ${active ? 'var(--warning)' : 'var(--border)'}`,
  background: active ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
  color: active ? 'var(--warning)' : 'var(--text-dim)',
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s',
});

export default function NewChampionshipPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('SingleRound');
  const [minStars, setMinStars] = useState(0);
  const [maxStars, setMaxStars] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [teams, setTeams] = useState<LicensedTeamDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState('');

  const selectedGame = games.find(g => g.id === gameId);
  const isLicensedTeams = selectedGame?.inscriptionMode === 'LicensedTeams';

  useEffect(() => {
    api.get('/api/v1/games').then(r => setGames(r.data.data));
  }, []);

  useEffect(() => {
    if (!isLicensedTeams || !gameId) {
      setTeams([]);
      setTeamsError('');
      return;
    }
    setTeamsLoading(true);
    setTeamsError('');
    const params = new URLSearchParams();
    if (minStars > 0) params.set('minStars', String(minStars));
    if (maxStars > 0) params.set('maxStars', String(maxStars));
    api.get(`/api/v1/games/${gameId}/teams?${params}`)
      .then(r => setTeams(r.data.data))
      .catch(() => setTeamsError('Não foi possível carregar os times.'))
      .finally(() => setTeamsLoading(false));
  }, [gameId, minStars, maxStars, isLicensedTeams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { gameId, name, description, format };
      if (isLicensedTeams) {
        if (minStars > 0) payload.minStars = minStars;
        if (maxStars > 0) payload.maxStars = maxStars;
      }
      const { data } = await api.post('/api/v1/championships', payload);
      navigate(`/championships/${data.data}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao criar campeonato.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link to="/championships" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Voltar para campeonatos
          </Link>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
            Criar campeonato
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Configure os detalhes do seu novo campeonato.
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px 36px' }}>
          {error && (
            <div className="alert alert-error fade-in" style={{ marginBottom: 24 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Jogo */}
            <div className="field">
              <label className="field-label">Jogo</label>
              <CustomSelect
                value={gameId}
                onChange={setGameId}
                placeholder="Selecione um jogo..."
                groups={Object.entries(
                  games.reduce<Record<string, Game[]>>((acc, g) => {
                    const cat = g.category || 'Other';
                    (acc[cat] ??= []).push(g);
                    return acc;
                  }, {})
                ).map(([label, catGames]) => ({
                  label,
                  options: catGames.map(g => ({ value: g.id, label: g.name })),
                }))}
              />
              {games.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                  Nenhum jogo cadastrado. Peça ao SuperAdmin para cadastrar jogos.
                </span>
              )}
            </div>

            {/* Nome */}
            <div className="field">
              <label className="field-label">Nome do campeonato</label>
              <input
                className="input-field"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Liga de Verão 2026"
                required
                maxLength={150}
              />
            </div>

            {/* Descrição */}
            <div className="field">
              <label className="field-label">
                Descrição
                <span style={{ marginLeft: 6, color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  — opcional
                </span>
              </label>
              <textarea
                style={textareaStyle}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva as regras, premiações ou qualquer informação relevante..."
                maxLength={500}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Formato */}
            <div className="field">
              <label className="field-label">Formato</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'SingleRound', label: '→ Somente ida', sub: 'Turno único' },
                  { value: 'DoubleRound', label: '↔ Ida e volta', sub: 'Turno e returno' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormat(opt.value)}
                    style={{
                      background: format === opt.value ? 'var(--accent-glow)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${format === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      color: format === opt.value ? 'var(--accent)' : 'var(--text-muted)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de estrelas */}
            {isLicensedTeams && (
              <div className="field">
                <label className="field-label">Filtro de estrelas <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-dim)' }}>— opcional</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Mínimo', value: minStars, set: setMinStars },
                    { label: 'Máximo', value: maxStars, set: setMaxStars },
                  ].map(row => (
                    <div key={row.label}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{row.label}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" style={starBtn(row.value === 0)} onClick={() => row.set(0)}>–</button>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button" style={starBtn(row.value === n)} onClick={() => row.set(n)}>
                            {'★'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview de times disponíveis */}
            {isLicensedTeams && gameId && (
              <div className="field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label className="field-label" style={{ margin: 0 }}>Times disponíveis</label>
                  {!teamsLoading && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {teams.length} time{teams.length !== 1 ? 's' : ''} disponíve{teams.length !== 1 ? 'is' : 'l'}
                    </span>
                  )}
                </div>

                {teamsError && (
                  <p style={{ fontSize: 12, color: 'var(--error)', margin: '0 0 8px' }}>{teamsError}</p>
                )}

                <div style={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 8,
                  padding: 2,
                }}>
                  {teamsLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{
                          height: 86,
                          borderRadius: 'var(--radius)',
                          background: 'rgba(255,255,255,0.05)',
                          opacity: 0.5,
                        }} />
                      ))
                    : teams.map(t => (
                        <div key={t.id} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          padding: '10px 8px',
                          borderRadius: 'var(--radius)',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          textAlign: 'center',
                        }}>
                          {t.logoUrl
                            ? <img src={t.logoUrl} alt={t.name} style={{ width: 32, height: 32, objectFit: 'contain' }}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                          }
                          <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12, lineHeight: 1.2 }}>
                            {t.name}
                          </span>
                          <span style={{ color: 'var(--warning)', fontSize: 10, letterSpacing: 1 }}>
                            {'★'.repeat(t.stars)}
                          </span>
                        </div>
                      ))
                  }
                </div>

                {!teamsLoading && teams.length === 0 && !teamsError && (
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                    Nenhum time encontrado com esse filtro.
                  </p>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="divider" style={{ margin: '4px 0' }} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Link to="/championships" className="btn btn-outline">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting || !gameId}>
                {submitting ? 'Criando...' : 'Criar campeonato'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
