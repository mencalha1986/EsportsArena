import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth, saveToken } from '../../hooks/useAuth';

const API = import.meta.env.VITE_API_URL ?? 'https://esportsarena-mtys.onrender.com';

const perks = [
  { icon: '🎮', text: 'Escolha seu @handle único na plataforma' },
  { icon: '🏅', text: 'Entre em campeonatos com um clique' },
  { icon: '📈', text: 'Acompanhe seu histórico e evolução' },
  { icon: '⚡', text: 'Receba sua equipe via draft ao vivo' },
];

export default function RegisterPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [platformId, setPlatformId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [availability, setAvailability] = useState<{ available: boolean; suggestions: string[] } | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!loading && session) return <Navigate to="/championships" replace />;

  useEffect(() => {
    if (platformId.length < 3) { setAvailability(null); return; }
    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/api/v1/users/platform-id/check?value=${encodeURIComponent(platformId)}`);
        setAvailability(data.data);
      } catch { /* ignore */ }
      finally { setChecking(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [platformId]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (availability && !availability.available) {
      setError('ID da plataforma já está em uso. Escolha outro.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, { email, password, platformId, displayName });
      saveToken(data.data.accessToken);
      navigate('/championships');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao criar conta.');
      setSubmitting(false);
    }
  }

  const pidStatus = checking ? 'checking' : availability === null ? 'idle' : availability.available ? 'ok' : 'taken';

  return (
    <div className="auth-root">
      {/* ── Painel esquerdo ── */}
      <div className="auth-brand">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <span style={{ fontSize: 28 }}>⚔️</span>
            <span style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              EsportsArena
            </span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>
            Crie sua<br />
            <span style={{ color: 'var(--accent)' }}>Arena.</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.65, maxWidth: 340, marginBottom: 44 }}>
            Cadastre-se gratuitamente e entre no mundo dos campeonatos de esports.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {perks.map(p => (
              <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(0,170,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, flexShrink: 0,
                }}>
                  {p.icon}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{p.text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 56, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: 12, margin: 0 }}>
              Já tem uma conta?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                Entrar →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="auth-form-panel">
        <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
              Criar conta
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Preencha os dados abaixo para começar.
            </p>
          </div>

          {error && (
            <div className="alert alert-error fade-in" style={{ marginBottom: 18 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="field">
              <label className="field-label">E-mail</label>
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="field-label">Senha</label>
              <div className="input-wrapper">
                <input
                  className="input-field"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label">
                ID da Plataforma
                <span style={{ marginLeft: 6, color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  — seu @handle único
                </span>
              </label>
              <input
                className={`input-field ${pidStatus === 'taken' ? 'error' : ''}`}
                value={platformId}
                onChange={e => setPlatformId(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                placeholder="ex: jogador123"
                required
                minLength={3}
                maxLength={30}
                autoComplete="off"
              />

              {pidStatus === 'checking' && (
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Verificando disponibilidade…</span>
              )}
              {pidStatus === 'ok' && (
                <span className="fade-in" style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✓ Disponível
                </span>
              )}
              {pidStatus === 'taken' && (
                <div className="fade-in">
                  <span style={{ fontSize: 12, color: 'var(--error)' }}>✗ Já em uso. Sugestões:</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {availability?.suggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 12, padding: '4px 10px', border: '1px solid rgba(0,170,255,0.3)', borderRadius: 6 }}
                        onClick={() => setPlatformId(s)}
                      >
                        @{s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="field">
              <label className="field-label">Nome de exibição</label>
              <input
                className="input-field"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Como você quer ser chamado?"
                required
                maxLength={100}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 4 }}
              disabled={submitting || pidStatus === 'taken'}
            >
              {submitting ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
