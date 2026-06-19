import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth, saveToken } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'https://esportsarena-mtys.onrender.com';

export default function LoginPage() {
  const { session, loading } = useAuth();
  const { role } = useUserRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!loading && session) {
    return <Navigate to={role === 'SuperAdmin' ? '/admin/dashboard' : '/championships'} replace />;
  }

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
      <div className="auth-form-panel">
        <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
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
