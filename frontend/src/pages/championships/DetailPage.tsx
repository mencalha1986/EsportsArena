import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';

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
  gameScoreDisplay: string;
  organizerPlatformId: string;
}

const STATUS_META: Record<string, { label: string; badge: string; color: string; dot: string }> = {
  Draft:            { label: 'Rascunho',          badge: 'badge badge-muted',   color: 'var(--text-muted)', dot: 'var(--text-dim)' },
  EnrollmentsOpen:  { label: 'Inscrições abertas', badge: 'badge badge-green',   color: 'var(--success)',    dot: 'var(--success)' },
  InProgress:       { label: 'Em andamento',       badge: 'badge badge-cyan',    color: 'var(--accent)',     dot: 'var(--accent)' },
  Finished:         { label: 'Encerrado',          badge: 'badge badge-muted',   color: 'var(--text-dim)',   dot: 'var(--text-dim)' },
};

const FORMAT_LABEL: Record<string, string> = {
  SingleRound: 'Somente ida',
  DoubleRound: 'Ida e volta',
};

const INSCRIPTION_LABEL: Record<string, string> = {
  OwnIdentity:  'Clube / Dupla própria',
  LicensedTeam: 'Time licenciado',
};

function InfoCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: string }) {
  return (
    <div style={{
      background: 'var(--surface-alt)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text-dim)' }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 600, color: accent ?? 'var(--text)' }}>{value}</span>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 32px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 36, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 36, width: '55%', marginBottom: 16, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 16, width: '30%', marginBottom: 40, borderRadius: 6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 10 }} />)}
        </div>
        <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
      </div>
    </div>
  );
}

export default function ChampionshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const { session } = useAuth();
  const { role } = useUserRole();
  const [championship, setChampionship] = useState<ChampionshipDetail | null>(null);
  const [identityName, setIdentityName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    api.get(`/api/v1/championships/${id}`)
      .then(r => setChampionship(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEnroll() {
    setMessage(null);
    setEnrolling(true);
    try {
      const payload = championship?.gameInscriptionMode === 'OwnIdentity' ? { identityName } : {};
      await api.post(`/api/v1/championships/${id}/enrollments`, payload);
      setMessage({ type: 'success', text: 'Inscrição realizada com sucesso!' });
      setIdentityName('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error ?? 'Erro ao se inscrever.' });
    } finally {
      setEnrolling(false);
    }
  }

  async function handleOpenEnrollments() {
    setActioning(true);
    try {
      await api.patch(`/api/v1/championships/${id}/open`);
      setChampionship(prev => prev ? { ...prev, status: 'EnrollmentsOpen' } : null);
    } finally {
      setActioning(false);
    }
  }

  async function handleStart() {
    setActioning(true);
    try {
      await api.patch(`/api/v1/championships/${id}/start`);
      setChampionship(prev => prev ? { ...prev, status: 'InProgress' } : null);
    } finally {
      setActioning(false);
    }
  }

  if (loading) return <PageSkeleton />;

  if (!championship) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏟️</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Campeonato não encontrado.</p>
          <Link to="/championships" className="btn btn-outline btn-sm" style={{ marginTop: 16, display: 'inline-flex' }}>
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  const isOrganizer = role === 'SuperAdmin' || role === 'Admin';
  const meta = STATUS_META[championship.status] ?? STATUS_META.Draft;
  const starsRange = championship.minStars != null
    ? `${championship.minStars}${championship.maxStars ? ` – ${championship.maxStars}` : '+'} ⭐`
    : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 32px', animation: 'fadeIn 0.25s ease' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <Link
          to="/championships"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, marginBottom: 36, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ← Campeonatos
        </Link>

        {/* Hero */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 36px',
          marginBottom: 20,
          borderLeft: `4px solid ${meta.color}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: '#fff', margin: 0, flex: 1 }}>
              {championship.name}
            </h1>
            <span className={meta.badge} style={{ flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
              {meta.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>🎮 {championship.gameName}</span>
            <span style={{ color: 'var(--text-dim)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>por @{championship.organizerPlatformId}</span>
          </div>

          {championship.description && (
            <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              {championship.description}
            </p>
          )}
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12, marginBottom: 20 }}>
          <InfoCard icon="🔄" label="Formato" value={FORMAT_LABEL[championship.format] ?? championship.format} />
          <InfoCard icon="📋" label="Inscrição" value={INSCRIPTION_LABEL[championship.gameInscriptionMode] ?? championship.gameInscriptionMode} />
          {starsRange && <InfoCard icon="⭐" label="Estrelas" value={starsRange} accent="var(--warning)" />}
        </div>

        {/* Feedback */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} fade-in`} style={{ marginBottom: 20 }}>
            <span>{message.type === 'success' ? '✓' : '⚠'}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Actions panel */}
        {session && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text-dim)', marginBottom: 16 }}>
              Ações
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>

              {/* Enroll */}
              {championship.status === 'EnrollmentsOpen' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  {championship.gameInscriptionMode === 'OwnIdentity' && (
                    <div className="field" style={{ minWidth: 220 }}>
                      <label className="field-label">Nome do clube / dupla</label>
                      <input
                        className="input-field"
                        placeholder="ex: FC Fenômenos"
                        value={identityName}
                        onChange={e => setIdentityName(e.target.value)}
                        style={{ fontSize: 14, padding: '10px 14px' }}
                      />
                    </div>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handleEnroll}
                    disabled={enrolling || (championship.gameInscriptionMode === 'OwnIdentity' && !identityName.trim())}
                  >
                    {enrolling ? 'Inscrevendo...' : '✓ Inscrever-se'}
                  </button>
                </div>
              )}

              {/* Organizer controls */}
              {isOrganizer && (
                <>
                  {championship.status === 'Draft' && (
                    <button className="btn btn-primary" onClick={handleOpenEnrollments} disabled={actioning}>
                      {actioning ? 'Abrindo...' : '📋 Abrir inscrições'}
                    </button>
                  )}
                  {championship.status === 'EnrollmentsOpen' && (
                    <>
                      <Link to={`/championships/${id}/draft`} className="btn btn-outline">
                        🎲 Sorteio ao vivo
                      </Link>
                      <button className="btn btn-primary" onClick={handleStart} disabled={actioning}>
                        {actioning ? 'Iniciando...' : '⚡ Iniciar campeonato'}
                      </button>
                    </>
                  )}
                  {championship.status === 'InProgress' && (
                    <Link to={`/championships/${id}/league`} className="btn btn-primary">
                      🏆 Ver tabela / rodadas
                    </Link>
                  )}
                </>
              )}

              {/* Player-only: in progress */}
              {!isOrganizer && championship.status === 'InProgress' && (
                <Link to={`/championships/${id}/league`} className="btn btn-outline">
                  🏆 Ver tabela / rodadas
                </Link>
              )}

              {/* No actions available */}
              {championship.status === 'Finished' && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
                  Este campeonato foi encerrado.
                </span>
              )}
              {championship.status === 'Draft' && !isOrganizer && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
                  Aguardando abertura das inscrições.
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
