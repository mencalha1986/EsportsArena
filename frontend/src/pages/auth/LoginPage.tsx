import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth, saveToken } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'https://esportsarena-mtys.onrender.com';

export default function LoginPage() {
  const { session, loading } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();

  // Login step
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Password-change step
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (!loading && session && !pendingToken) {
    return <Navigate to={role === 'SuperAdmin' ? '/admin/dashboard' : '/championships'} replace />;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
      const token = data.data.accessToken;

      if (data.data.requiresPasswordChange) {
        // Hold the token in state — don't persist yet, force user to change password first
        setPendingToken(token);
        setError('');
        return;
      }

      saveToken(token);
      const payload = JSON.parse(atob(token.split('.')[1]));
      navigate(payload.role === 'SuperAdmin' ? '/admin/dashboard' : '/championships');
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'E-mail ou senha inválidos.';
      setError(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setChangingPassword(true);
    try {
      const { data } = await axios.post(
        `${API}/api/auth/change-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${pendingToken}` } }
      );
      const newToken = data.data.accessToken;
      saveToken(newToken);
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      navigate(payload.role === 'SuperAdmin' ? '/admin/dashboard' : '/championships');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao trocar a senha.');
    } finally {
      setChangingPassword(false);
    }
  }

  // — Password-change step —
  if (pendingToken) {
    return (
      <div className="auth-root">
        <div className="auth-form-panel">
          <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
              <span style={{ fontSize: 22 }}>⚔️</span>
              <span style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 800 }}>EsportsArena</span>
            </div>

            <div style={{ marginBottom: 28 }}>
              <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
                Redefinir senha
              </h2>
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 8, padding: '10px 14px', marginTop: 12,
              }}>
                <p style={{ color: 'var(--warning,#f59e0b)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  Sua conta foi bloqueada após 3 tentativas incorretas. Crie uma nova senha para continuar.
                </p>
              </div>
            </div>

            {error && (
              <div className="alert alert-error fade-in" style={{ marginBottom: 20 }}>
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="field">
                <label className="field-label">Nova senha</label>
                <div className="input-wrapper">
                  <input
                    className="input-field"
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowNewPass(v => !v)}
                    tabIndex={-1}
                  >
                    {showNewPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Confirmar nova senha</label>
                <input
                  className="input-field"
                  type={showNewPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 4 }}
                disabled={changingPassword}
              >
                {changingPassword ? 'Salvando...' : '🔐 Salvar nova senha'}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button
                onClick={() => { setPendingToken(null); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer' }}
              >
                ← Voltar ao login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // — Login step —
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
