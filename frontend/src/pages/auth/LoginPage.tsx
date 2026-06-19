import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth, saveToken } from '../../hooks/useAuth';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'https://esportsarena-mtys.onrender.com';

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    background: '#12122a',
    border: '1px solid #2a2a4a',
    borderRadius: 12,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  logo: {
    color: '#00aaff',
    fontSize: 28,
    fontWeight: 800,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    color: '#6a6a8a',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
  },
  heading: {
    color: '#e0e0ff',
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    color: '#9090b0',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  input: {
    background: '#0d0d1a',
    border: '1px solid #2a2a4a',
    borderRadius: 8,
    color: '#e0e0ff',
    fontSize: 15,
    padding: '10px 14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: 8,
    width: '100%',
    padding: '12px',
    background: '#00aaff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.5,
  },
  error: {
    background: 'rgba(255, 60, 60, 0.1)',
    border: '1px solid rgba(255, 60, 60, 0.3)',
    borderRadius: 8,
    color: '#ff6b6b',
    fontSize: 13,
    padding: '10px 14px',
    marginBottom: 12,
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6a6a8a',
    fontSize: 13,
  },
  link: {
    color: '#00aaff',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

export default function LoginPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!loading && session) return <Navigate to="/championships" replace />;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
      saveToken(data.data.accessToken);
      navigate('/championships');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'E-mail ou senha inválidos.');
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>EsportsArena</div>
        <div style={styles.subtitle}>Plataforma de campeonatos competitivos</div>
        <div style={styles.heading}>Entrar</div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>E-MAIL</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>SENHA</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            style={{ ...styles.button, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={styles.footer}>
          Não tem conta?{' '}
          <Link to="/register" style={styles.link}>Cadastrar-se</Link>
        </div>
      </div>
    </div>
  );
}
