import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';
import { useApi } from '../../hooks/useApi';

interface UserSummary {
  id: string;
  platformId: string;
  displayName: string;
  role: string;
  isActive: boolean;
  subscriptionNotes: string | null;
  createdAt: string;
}

interface Championship {
  id: string;
  name: string;
  status: string;
  format: string;
}

interface Enrollment {
  id: string;
  userId: string;
  identityName: string | null;
  isActive: boolean;
}

// ── Modal Novo Cliente ─────────────────────────────────────────────────────────

function CreateClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: UserSummary) => void }) {
  const api = useApi();
  const [form, setForm] = useState({ email: '', password: '', platformId: '', displayName: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/v1/admin/users', {
        email: form.email,
        password: form.password,
        platformId: form.platformId,
        displayName: form.displayName,
        notes: form.notes || null,
      });
      onCreated(res.data.data);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Erro ao criar cliente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 32, width: 440, maxWidth: '90vw',
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ color: 'var(--text)', marginBottom: 6 }}>Novo Cliente</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
          Cria uma conta já ativa como Admin.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="field-label">Nome de exibição</label>
            <input className="input-field" placeholder="Ex: Clube das Estrelas" required
              value={form.displayName} onChange={e => set('displayName', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">E-mail</label>
            <input className="input-field" type="email" placeholder="cliente@email.com" required
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">ID da plataforma</label>
            <input className="input-field" placeholder="clube_estrelas" required
              value={form.platformId} onChange={e => set('platformId', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Senha temporária</label>
            <input className="input-field" type="password" placeholder="Mínimo 6 caracteres" required
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Notas de assinatura (opcional)</label>
            <input className="input-field" placeholder="Ex: Plano mensal, vence 30/07"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Painel de detalhes do cliente ──────────────────────────────────────────────

function ClientDetailPanel({ client, onClose }: { client: UserSummary; onClose: () => void }) {
  const api = useApi();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingChamps, setLoadingChamps] = useState(true);

  useEffect(() => {
    api.get(`/api/v1/championships?organizerId=${client.id}`).then(r => {
      setChampionships(r.data.data ?? []);
    }).finally(() => setLoadingChamps(false));
  }, [client.id]);

  async function toggleChampionship(champId: string) {
    if (expanded === champId) {
      setExpanded(null);
      return;
    }
    setExpanded(champId);
    if (!enrollments[champId]) {
      const r = await api.get(`/api/v1/championships/${champId}/enrollments`);
      setEnrollments(prev => ({ ...prev, [champId]: r.data.data ?? [] }));
    }
  }

  const statusColor: Record<string, string> = {
    Draft: 'var(--text-muted)',
    EnrollmentsOpen: 'var(--warning)',
    InProgress: 'var(--accent)',
    Finished: 'var(--success)',
  };

  const statusLabel: Record<string, string> = {
    Draft: 'Rascunho',
    EnrollmentsOpen: 'Inscrições abertas',
    InProgress: 'Em andamento',
    Finished: 'Encerrado',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        width: 460, maxWidth: '95vw', height: '100vh',
        overflowY: 'auto', padding: 28,
        animation: 'fadeIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: 'var(--text)', marginBottom: 2 }}>{client.displayName}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>@{client.platformId}</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: 20, cursor: 'pointer', padding: 4,
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <span className={`badge ${client.isActive ? 'badge-green' : 'badge-muted'}`}>
            {client.isActive ? 'Ativo' : 'Suspenso'}
          </span>
          <span className="badge badge-cyan">{client.role}</span>
          {client.subscriptionNotes && (
            <span className="badge badge-amber">{client.subscriptionNotes}</span>
          )}
        </div>

        <h3 style={{ color: 'var(--text)', marginBottom: 14, fontSize: 15 }}>
          Campeonatos ({championships.length})
        </h3>

        {loadingChamps ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando...</div>
        ) : championships.length === 0 ? (
          <div style={{
            background: 'var(--surface-alt)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px 16px',
            color: 'var(--text-muted)', fontSize: 13, textAlign: 'center',
          }}>
            Este cliente ainda não criou campeonatos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {championships.map(ch => (
              <div key={ch.id} style={{
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                background: 'var(--surface-alt)', overflow: 'hidden',
              }}>
                <button
                  onClick={() => toggleChampionship(ch.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '12px 16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>{ch.name}</div>
                    <div style={{ color: statusColor[ch.status] ?? 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                      {statusLabel[ch.status] ?? ch.status}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {expanded === ch.id ? '▲' : '▼'}
                  </span>
                </button>

                {expanded === ch.id && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
                    {!enrollments[ch.id] ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando players...</div>
                    ) : enrollments[ch.id].length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum player inscrito.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {enrollments[ch.id].map((e, i) => (
                          <div key={e.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '6px 0',
                            borderBottom: i < enrollments[ch.id].length - 1 ? '1px solid var(--border)' : 'none',
                          }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 800, color: '#000', flexShrink: 0,
                            }}>
                              {(e.identityName ?? 'P').slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ color: 'var(--text)', fontSize: 13 }}>
                              {e.identityName ?? `Player ${i + 1}`}
                            </span>
                            {!e.isActive && (
                              <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>Desistiu</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AdminPage principal ────────────────────────────────────────────────────────

export default function AdminPage() {
  const { role, loading } = useUserRole();
  const api = useApi();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClient, setSelectedClient] = useState<UserSummary | null>(null);

  useEffect(() => {
    if (role !== 'SuperAdmin') return;
    api.get('/api/v1/admin/users').then(r => setUsers(r.data.data));
  }, [role]);

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;
  if (role !== 'SuperAdmin') return <Navigate to="/" replace />;

  const filtered = filter ? users.filter(u => u.role === filter) : users;

  async function activate(userId: string) {
    await api.post(`/api/v1/admin/users/${userId}/activate`, { notes: notes[userId] ?? null });
    setUsers(u => u.map(x => x.id === userId ? { ...x, role: 'Admin', isActive: true } : x));
  }

  async function deactivate(userId: string) {
    await api.post(`/api/v1/admin/users/${userId}/deactivate`, { reason: notes[userId] ?? null });
    setUsers(u => u.map(x => x.id === userId ? { ...x, isActive: false } : x));
  }

  async function reactivate(userId: string) {
    await api.post(`/api/v1/admin/users/${userId}/reactivate`, { notes: notes[userId] ?? null });
    setUsers(u => u.map(x => x.id === userId ? { ...x, isActive: true } : x));
  }

  function handleCreated(newUser: UserSummary) {
    setUsers(u => [newUser, ...u]);
  }

  const roleColor: Record<string, string> = {
    SuperAdmin: 'var(--purple)',
    Admin: 'var(--accent)',
    Player: 'var(--text-muted)',
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontSize: 24, marginBottom: 4 }}>Clientes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Gestão de clientes (Admins) e assinaturas</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          + Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 6 }}>
        {['', 'Player', 'Admin', 'SuperAdmin'].map(r => (
          <button key={r} onClick={() => setFilter(r)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13,
            fontWeight: 600, border: '1px solid',
            background: filter === r ? 'var(--accent)' : 'transparent',
            borderColor: filter === r ? 'var(--accent)' : 'var(--border)',
            color: filter === r ? '#000' : 'var(--text-muted)',
          }}>
            {r || 'Todos'}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
              {['Usuário', 'Role', 'Status', 'Notas', 'Ações'].map(h => (
                <th key={h} style={{
                  padding: '11px 16px', textAlign: 'left',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>@{u.platformId}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: roleColor[u.role] ?? 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-muted'}`}>
                    {u.isActive ? 'Ativo' : 'Suspenso'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <input
                    placeholder={u.subscriptionNotes ?? 'Anotação...'}
                    value={notes[u.id] ?? ''}
                    onChange={e => setNotes(n => ({ ...n, [u.id]: e.target.value }))}
                    className="input-field"
                    style={{ padding: '5px 10px', fontSize: 13, height: 32 }}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => setSelectedClient(u)} className="btn btn-outline btn-sm">
                      Ver
                    </button>
                    {u.role !== 'Admin' && u.role !== 'SuperAdmin' && (
                      <button onClick={() => activate(u.id)} className="btn btn-sm" style={{
                        background: 'rgba(52,211,153,0.12)', color: 'var(--success)',
                        border: '1px solid rgba(52,211,153,0.25)',
                      }}>
                        Ativar
                      </button>
                    )}
                    {u.role === 'Admin' && u.isActive && (
                      <button onClick={() => deactivate(u.id)} className="btn btn-danger btn-sm">
                        Suspender
                      </button>
                    )}
                    {u.role === 'Admin' && !u.isActive && (
                      <button onClick={() => reactivate(u.id)} className="btn btn-sm" style={{
                        background: 'rgba(0,170,255,0.12)', color: 'var(--accent)',
                        border: '1px solid rgba(0,170,255,0.25)',
                      }}>
                        Reativar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      {showCreate && (
        <CreateClientModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {selectedClient && (
        <ClientDetailPanel client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
}
