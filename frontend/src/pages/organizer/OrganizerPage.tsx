import { Navigate, Link } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';

export default function OrganizerPage() {
  const { role, isActive, loading } = useUserRole();

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;
  if (role === 'Player' || role === null) return <Navigate to="/" replace />;

  if (role === 'Admin' && !isActive) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: 24, textAlign: 'center', color: '#eee' }}>
        <h2 style={{ color: '#f44' }}>Conta Suspensa</h2>
        <p>Sua assinatura está suspensa. Entre em contato com o administrador para reativar o acesso.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ color: '#fff' }}>Painel do Organizador</h1>
      <p style={{ color: '#aaa' }}>Gerencie seus campeonatos</p>

      <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/championships/new"
          style={{ display: 'block', padding: '20px 32px', background: '#e60000', color: '#fff',
            textDecoration: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 16 }}>
          + Criar Campeonato
        </Link>
        <Link to="/championships"
          style={{ display: 'block', padding: '20px 32px', background: '#1a1a2e', color: '#ccc',
            textDecoration: 'none', borderRadius: 8, border: '1px solid #444', fontSize: 16 }}>
          Ver Todos os Campeonatos
        </Link>
      </div>
    </div>
  );
}
