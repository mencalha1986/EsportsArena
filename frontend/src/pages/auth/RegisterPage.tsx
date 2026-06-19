import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [availability, setAvailability] = useState<{ available: boolean; suggestions: string[] } | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Debounced platform ID check
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

    // 1. Register in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) { setError(authError.message); return; }
    if (!authData.session) { setError('Verifique seu e-mail para confirmar o cadastro.'); return; }

    // 2. Create platform profile in our backend
    try {
      await axios.post(`${API}/api/v1/users/register`,
        { platformId, displayName },
        { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
      );
      navigate('/championships');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao criar perfil.');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>EsportsArena</h1>
      <h2>Criar conta</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div>
          <label>ID da Plataforma (seu @)</label>
          <input value={platformId} onChange={e => setPlatformId(e.target.value)} required minLength={3} maxLength={30} />
          {availability !== null && (
            availability.available
              ? <span style={{ color: 'green' }}>✓ Disponível</span>
              : <div>
                  <span style={{ color: 'red' }}>✗ Em uso. Sugestões: </span>
                  {availability.suggestions.map(s => (
                    <button key={s} type="button" onClick={() => setPlatformId(s)}>{s}</button>
                  ))}
                </div>
          )}
        </div>
        <div>
          <label>Nome de exibição</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} required maxLength={100} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
