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

interface MyEnrollment {
  id: string;
  identityName?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  isActive: boolean;
  createdAt: string;
}

interface PendingEnrollment {
  id: string;
  userId: string;
  identityName?: string;
  createdAt: string;
  userDisplayName?: string;
  userPlatformId?: string;
}

interface PlayerSearchResult {
  id: string;
  platformId: string;
  displayName: string;
  avatarUrl?: string;
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

const ENROLLMENT_STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Pending:  { label: 'Aguardando aprovação', color: 'var(--warning)',    bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)' },
  Accepted: { label: 'Inscrito e aceito',    color: 'var(--success)',    bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)' },
  Rejected: { label: 'Inscrição rejeitada',  color: 'var(--danger,#ef4444)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
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
  const { role, isActive } = useUserRole();

  const [championship, setChampionship] = useState<ChampionshipDetail | null>(null);
  const [myEnrollment, setMyEnrollment] = useState<MyEnrollment | null | undefined>(undefined);
  const [pendingEnrollments, setPendingEnrollments] = useState<PendingEnrollment[]>([]);
  const [identityName, setIdentityName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const [playerQuery, setPlayerQuery] = useState('');
  const [playerResults, setPlayerResults] = useState<PlayerSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingPlayerId, setAddingPlayerId] = useState<string | null>(null);
  const [manualIdentityNames, setManualIdentityNames] = useState<Record<string, string>>({});

  const isOrganizer = role === 'Admin' && isActive;

  useEffect(() => {
    api.get(`/api/v1/championships/${id}`)
      .then(r => setChampionship(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  // Load current user's enrollment
  useEffect(() => {
    if (!session) { setMyEnrollment(null); return; }
    api.get(`/api/v1/championships/${id}/enrollments/my`)
      .then(r => setMyEnrollment(r.data.data ?? null))
      .catch(() => setMyEnrollment(null));
  }, [id, session]);

  // Load pending enrollments for organizer
  useEffect(() => {
    if (!isOrganizer || !championship || championship.status !== 'EnrollmentsOpen') return;
    api.get(`/api/v1/championships/${id}/enrollments/pending`)
      .then(r => setPendingEnrollments(r.data.data ?? []))
      .catch(() => setPendingEnrollments([]));
  }, [id, isOrganizer, championship?.status]);

  // Debounced player search
  useEffect(() => {
    if (!isOrganizer) return;
    if (playerQuery.trim().length < 2) { setPlayerResults([]); return; }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      api.get(`/api/v1/users/search?q=${encodeURIComponent(playerQuery.trim())}`)
        .then(r => setPlayerResults(r.data.data ?? []))
        .catch(() => setPlayerResults([]))
        .finally(() => setSearchLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [playerQuery, isOrganizer]);

  async function handleEnroll() {
    setMessage(null);
    setEnrolling(true);
    try {
      const payload = championship?.gameInscriptionMode === 'OwnIdentity' ? { identityName } : {};
      await api.post(`/api/v1/championships/${id}/enrollments`, payload);
      setMessage({ type: 'success', text: 'Inscrição enviada! Aguarde a aprovação do organizador.' });
      setIdentityName('');
      // Refresh my enrollment
      const me = await api.get(`/api/v1/championships/${id}/enrollments/my`);
      setMyEnrollment(me.data.data ?? null);
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

  async function handleManualEnroll(player: PlayerSearchResult) {
    setAddingPlayerId(player.id);
    try {
      const identityName = manualIdentityNames[player.id] ?? '';
      await api.post(`/api/v1/championships/${id}/enrollments/manual`, {
        userId: player.id,
        identityName: identityName || null,
      });
      setMessage({ type: 'success', text: `${player.displayName} adicionado ao campeonato.` });
      setPlayerResults(prev => prev.filter(p => p.id !== player.id));
      setManualIdentityNames(prev => { const n = { ...prev }; delete n[player.id]; return n; });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error ?? 'Erro ao adicionar jogador.' });
    } finally {
      setAddingPlayerId(null);
    }
  }

  async function handleReview(enrollmentId: string, action: 'accept' | 'reject') {
    setReviewingId(enrollmentId);
    try {
      await api.patch(`/api/v1/enrollments/${enrollmentId}/${action}`);
      setPendingEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error ?? `Erro ao ${action === 'accept' ? 'aceitar' : 'rejeitar'}.` });
    } finally {
      setReviewingId(null);
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

  const meta = STATUS_META[championship.status] ?? STATUS_META.Draft;
  const starsRange = championship.minStars != null
    ? `${championship.minStars}${championship.maxStars ? ` – ${championship.maxStars}` : '+'} ⭐`
    : null;

  const enrollMeta = myEnrollment ? ENROLLMENT_STATUS_META[myEnrollment.status] : null;
  const canEnroll = !myEnrollment && championship.status === 'EnrollmentsOpen' && session && !isOrganizer;

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

        {/* Player enrollment status banner */}
        {session && !isOrganizer && myEnrollment && enrollMeta && (
          <div style={{
            background: enrollMeta.bg,
            border: `1px solid ${enrollMeta.border}`,
            borderRadius: 'var(--radius)',
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>
              {myEnrollment.status === 'Accepted' ? '✓' : myEnrollment.status === 'Rejected' ? '✗' : '⏳'}
            </span>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: enrollMeta.color }}>
                {enrollMeta.label}
              </span>
              {myEnrollment.identityName && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                  — {myEnrollment.identityName}
                </span>
              )}
            </div>
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
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text-dim)', marginBottom: 20 }}>
              Ações
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Enroll row — only if not yet enrolled */}
              {canEnroll && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
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

              {/* Organizer rows */}
              {isOrganizer && (
                <>
                  {championship.status === 'EnrollmentsOpen' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <Link to={`/championships/${id}/draft`} className="btn btn-outline">
                        🎲 Sorteio ao vivo
                      </Link>
                      <button className="btn btn-primary" onClick={handleStart} disabled={actioning}>
                        {actioning ? 'Iniciando...' : '⚡ Iniciar campeonato'}
                      </button>
                    </div>
                  )}
                  {championship.status === 'Draft' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button className="btn btn-primary" onClick={handleOpenEnrollments} disabled={actioning}>
                        {actioning ? 'Abrindo...' : '📋 Abrir inscrições'}
                      </button>
                    </div>
                  )}
                  {(championship.status === 'InProgress' || championship.status === 'Finished') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Link to={`/championships/${id}/league`} className="btn btn-primary">
                        🏆 Ver tabela / rodadas
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Player-only: in progress */}
              {!isOrganizer && (championship.status === 'InProgress' || championship.status === 'Finished') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Link to={`/championships/${id}/league`} className="btn btn-outline">
                    🏆 Ver tabela / rodadas
                  </Link>
                </div>
              )}

              {/* No actions */}
              {championship.status === 'Finished' && !isOrganizer && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Este campeonato foi encerrado.
                </span>
              )}
              {championship.status === 'Draft' && !isOrganizer && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Aguardando abertura das inscrições.
                </span>
              )}
              {championship.status === 'EnrollmentsOpen' && !isOrganizer && myEnrollment && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Aguardando início do campeonato.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Organizer: add player by search */}
        {isOrganizer && championship.status === 'EnrollmentsOpen' && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            marginTop: 20,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text-dim)', margin: '0 0 16px 0' }}>
              Adicionar jogador
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <input
                className="input-field"
                placeholder="Buscar por e-mail ou nickname..."
                value={playerQuery}
                onChange={e => setPlayerQuery(e.target.value)}
                style={{ fontSize: 14, padding: '10px 14px', flex: 1 }}
              />
              {searchLoading && (
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Buscando...</span>
              )}
            </div>

            {playerQuery.trim().length >= 2 && !searchLoading && playerResults.length === 0 && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Nenhum jogador encontrado.</p>
            )}

            {playerResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {playerResults.map(player => (
                  <div key={player.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, padding: '12px 16px',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                        {player.displayName}
                        <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--accent)', marginLeft: 6 }}>
                          @{player.platformId}
                        </span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {championship.gameInscriptionMode === 'OwnIdentity' && (
                        <input
                          className="input-field"
                          placeholder="Nome do clube / dupla"
                          value={manualIdentityNames[player.id] ?? ''}
                          onChange={e => setManualIdentityNames(prev => ({ ...prev, [player.id]: e.target.value }))}
                          style={{ fontSize: 13, padding: '8px 12px', width: 190 }}
                        />
                      )}
                      <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.3)' }}
                        disabled={
                          addingPlayerId === player.id ||
                          (championship.gameInscriptionMode === 'OwnIdentity' && !manualIdentityNames[player.id]?.trim())
                        }
                        onClick={() => handleManualEnroll(player)}
                      >
                        {addingPlayerId === player.id ? '...' : '+ Adicionar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Organizer: pending enrollments panel */}
        {isOrganizer && championship.status === 'EnrollmentsOpen' && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            marginTop: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text-dim)', margin: 0 }}>
                Inscrições pendentes
              </p>
              {pendingEnrollments.length > 0 && (
                <span className="badge badge-green">{pendingEnrollments.length} pendente{pendingEnrollments.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {pendingEnrollments.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Nenhuma inscrição pendente no momento.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingEnrollments.map(e => (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 12, padding: '12px 16px',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {(e.userDisplayName || e.userPlatformId) && (
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                          {e.userDisplayName}
                          {e.userPlatformId && (
                            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--accent)', marginLeft: 6 }}>
                              @{e.userPlatformId}
                            </span>
                          )}
                        </span>
                      )}
                      {e.identityName && (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.identityName}</span>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                        {new Date(e.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.3)' }}
                        disabled={reviewingId === e.id}
                        onClick={() => handleReview(e.id, 'accept')}
                      >
                        {reviewingId === e.id ? '...' : '✓ Aceitar'}
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                        disabled={reviewingId === e.id}
                        onClick={() => handleReview(e.id, 'reject')}
                      >
                        {reviewingId === e.id ? '...' : '✗ Rejeitar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
