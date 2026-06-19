import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth, saveToken } from '../../hooks/useAuth';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'https://esportsarena-mtys.onrender.com';

const features = [
  { icon: '🏆', text: 'Campeonatos em formato liga completo' },
  { icon: '⚡', text: 'Draft ao vivo com atualização em tempo real' },
  { icon: '📊', text: 'Estatísticas detalhadas por jogador' },
];

export default function LoginPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!loading && session) return <Navigate to="/championships" replace />;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
      const token = data.data.accessToken;
      saveToken(token);
      const payload = JSON.parse(atob(token.split('.')[1]));
      navigate(payload.role === 'SuperAdmin' ? '/admin/dashboard' : '/championships');
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'E-mail ou senha inválidos.';
      setError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-root">
      {/* ── Painel esquerdo — branding ── */}
      <div className="auth-brand">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <span style={{ fontSize: 28 }}>⚔️</span>
            <span style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              EsportsArena
            </span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>
            Organize.<br />
            Compita.<br />
            <span style={{ color: 'var(--accent)' }}>Domine.</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.65, maxWidth: 340, marginBottom: 48 }}>
            A plataforma completa para criar e gerenciar campeonatos de esports com profissionalismo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(0,170,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.4 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 64, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: 12, margin: 0 }}>
              Não tem conta ainda?{' '}
              <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                Cadastre-se gratuitamente →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="auth-form-panel">
        <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }} className="mobile-logo">
            <span style={{ fontSize: 22 }}>⚔️</span>
            <span style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 800 }}>EsportsArena</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
              Entrar na Arena
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Bem-vindo de volta. Insira suas credenciais.
            </p>
          </div>

          {error && (
            <div className={`alert alert-error fade-in ${shaking ? 'shake' : ''}`} style={{ marginBottom: 20 }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 4 }}
              disabled={submitting}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: 28, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            Não tem conta?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Cadastrar-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
