import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth, clearToken } from './hooks/useAuth';
import { useUserRole } from './hooks/useUserRole';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import ChampionshipsListPage from './pages/championships/ListPage';
import NewChampionshipPage from './pages/championships/NewPage';
import ChampionshipDetailPage from './pages/championships/DetailPage';
import LeaguePage from './pages/league/LeaguePage';
import DraftPage from './pages/draft/DraftPage';
import AdminPage from './pages/admin/AdminPage';
import OrganizerPage from './pages/organizer/OrganizerPage';
import ProtectedRoute from './components/ProtectedRoute';

function NavBar() {
  const { session } = useAuth();
  const { role, isActive } = useUserRole();
  return (
    <nav style={{ padding: '12px 24px', background: '#1a1a2e', color: '#fff', display: 'flex', gap: 16, alignItems: 'center' }}>
      <Link to="/championships" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', fontSize: 18 }}>EsportsArena</Link>
      <div style={{ flex: 1 }} />
      {session ? (
        <>
          <Link to="/championships" style={{ color: '#ccc', textDecoration: 'none' }}>Campeonatos</Link>
          {(role === 'Admin' && isActive) || role === 'SuperAdmin' ? (
            <Link to="/organizer" style={{ color: '#0af', textDecoration: 'none' }}>Organizar</Link>
          ) : null}
          {role === 'SuperAdmin' && (
            <Link to="/admin" style={{ color: '#f0a', textDecoration: 'none' }}>Admin</Link>
          )}
          <button onClick={clearToken} style={{ background: 'transparent', color: '#ccc', border: '1px solid #555', cursor: 'pointer', padding: '4px 12px', borderRadius: 4 }}>
            Sair
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: '#ccc', textDecoration: 'none' }}>Entrar</Link>
          <Link to="/register" style={{ color: '#0af', textDecoration: 'none', fontWeight: 600 }}>Cadastrar</Link>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/championships" element={<ChampionshipsListPage />} />
        <Route path="/championships/:id" element={<ChampionshipDetailPage />} />

        {/* Rotas protegidas */}
        <Route path="/championships/new" element={<ProtectedRoute><NewChampionshipPage /></ProtectedRoute>} />
        <Route path="/championships/:id/league" element={<ProtectedRoute><LeaguePage /></ProtectedRoute>} />
        <Route path="/championships/:id/draft" element={<ProtectedRoute><DraftPage /></ProtectedRoute>} />
        <Route path="/profile/:platformId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/organizer" element={<ProtectedRoute><OrganizerPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/championships" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
