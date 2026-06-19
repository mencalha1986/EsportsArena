import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth, saveToken } from '../../hooks/useAuth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

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
    maxWidth: 440,
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
  availableMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#33cc88',
    fontSize: 12,
    marginTop: 4,
  },
  unavailableMsg: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  suggestionsRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  suggestionBtn: {
    background: 'transparent',
    border: '1px solid #00aaff',
    borderRadius: 6,
    color: '#00aaff',
    cursor: 'pointer',
    fontSize: 12,
    padding: '3px 10px',
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

export default function RegisterPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [availability, setAvailability] = useState<{ available: boolean; suggestions: string[] } | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!loading && session) return <Navigate to="/championships" replace />;

  useEffect(() => {
    if (platformId.length < 3) { setAvailability(null); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/api/v1/users/platform-id/check?value=${encodeURIComponent(platformId)}`);
        setAvailability(data.data);
      } catch { /* ignore */ }
    }, 300);
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
      const { data } = await axios.post(`${API}/api/auth/register`, {
        email,
        password,
        platformId,
        displayName,
      });
      saveToken(data.data.accessToken);
      navigate('/championships');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao criar conta.');
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>EsportsArena</div>
        <div style={styles.subtitle}>Plataforma de campeonatos competitivos</div>
        <div style={styles.heading}>Criar conta</div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleRegister}>
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
              placeholder="mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>ID DA PLATAFORMA (seu @)</label>
            <input
              style={styles.input}
              value={platformId}
              onChange={e => setPlatformId(e.target.value)}
              placeholder="ex: jogador123"
              required
              minLength={3}
              maxLength={30}
            />
            {availability !== null && (
              availability.available
                ? <div style={styles.availableMsg}>✓ Disponível</div>
                : <div>
                    <div style={styles.unavailableMsg}>✗ Já em uso. Sugestões:</div>
                    <div style={styles.suggestionsRow}>
                      {availability.suggestions.map(s => (
                        <button key={s} type="button" style={styles.suggestionBtn} onClick={() => setPlatformId(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>NOME DE EXIBIÇÃO</label>
            <input
              style={styles.input}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Como você quer ser chamado?"
              required
              maxLength={100}
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.button, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div style={styles.footer}>
          Já tem conta?{' '}
          <Link to="/login" style={styles.link}>Entrar</Link>
        </div>
      </div>
    </div>
  );
}
