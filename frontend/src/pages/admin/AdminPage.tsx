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

export default function AdminPage() {
  const { role, loading } = useUserRole();
  const api = useApi();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role !== 'SuperAdmin') return;
    api.get('/api/v1/admin/users').then(r => setUsers(r.data.data));
  }, [role]);

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;
  if (role !== 'SuperAdmin') return <Navigate to="/" replace />;

  const filtered = filter
    ? users.filter(u => u.role === filter)
    : users;

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

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff' }}>Painel SuperAdmin</h1>
      <p style={{ color: '#aaa' }}>Gestão de clientes (Admins) e assinaturas</p>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['', 'Player', 'Admin', 'SuperAdmin'].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{ padding: '6px 14px', borderRadius: 4, cursor: 'pointer',
              background: filter === r ? '#e60000' : '#333', color: '#fff', border: 'none' }}>
            {r || 'Todos'}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Usuário</th>
            <th style={{ padding: '8px 12px' }}>Role</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}>Notas</th>
            <th style={{ padding: '8px 12px' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #2a2a3e' }}>
              <td style={{ padding: '8px 12px' }}>
                <strong>{u.displayName}</strong><br />
                <span style={{ color: '#888', fontSize: 12 }}>@{u.platformId}</span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ color: u.role === 'SuperAdmin' ? '#f0a' : u.role === 'Admin' ? '#0af' : '#888' }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ color: u.isActive ? '#0f0' : '#f44' }}>
                  {u.isActive ? 'Ativo' : 'Suspenso'}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <input
                  placeholder={u.subscriptionNotes ?? 'Anotação...'}
                  value={notes[u.id] ?? ''}
                  onChange={e => setNotes(n => ({ ...n, [u.id]: e.target.value }))}
                  style={{ background: '#1a1a2e', border: '1px solid #444', color: '#eee',
                    padding: '4px 8px', borderRadius: 4, width: '100%' }}
                />
              </td>
              <td style={{ padding: '8px 12px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {u.role !== 'Admin' && u.role !== 'SuperAdmin' && (
                    <button onClick={() => activate(u.id)}
                      style={{ padding: '4px 10px', background: '#0a5', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Ativar como Admin
                    </button>
                  )}
                  {u.role === 'Admin' && u.isActive && (
                    <button onClick={() => deactivate(u.id)}
                      style={{ padding: '4px 10px', background: '#a00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Suspender
                    </button>
                  )}
                  {u.role === 'Admin' && !u.isActive && (
                    <button onClick={() => reactivate(u.id)}
                      style={{ padding: '4px 10px', background: '#055', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Reativar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
