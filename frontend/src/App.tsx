import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
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
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import OrganizerPage from './pages/organizer/OrganizerPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/landing/LandingPage';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link to={to} className={`nav-link${active ? ' active' : ''}`}>
      {children}
    </Link>
  );
}

function NavBar() {
  const { session, user } = useAuth();
  const { role, isActive } = useUserRole();
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate('/');
  }

  const initials = user?.platformId?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0 28px',
      height: 56,
      background: 'rgba(8,8,15,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      {/* Logo */}
      <Link
        to={session ? '/championships' : '/'}
        style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 24 }}
      >
        <span style={{ fontSize: 18 }}>⚔️</span>
        <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>
          EsportsArena
        </span>
      </Link>

      {/* Nav links */}
      {session && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <NavLink to="/championships">Campeonatos</NavLink>
          {((role === 'Admin' && isActive) || role === 'SuperAdmin') && (
            <NavLink to="/organizer">Organizar</NavLink>
          )}
          {role === 'SuperAdmin' && (
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
          )}
          {role === 'SuperAdmin' && (
            <NavLink to="/admin">Usuários</NavLink>
          )}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Right side */}
      {session ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar" title={`@${user?.platformId}`}>{initials}</div>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            style={{ fontSize: 13 }}
          >
            Sair
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Cadastrar</Link>
        </div>
      )}
    </nav>
  );
}

function HomeRoute() {
  const { session } = useAuth();
  const { role } = useUserRole();
  if (!session) return <LandingPage />;
  if (role === 'SuperAdmin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/championships" replace />;
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
        <Route path="/admin/dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />

        <Route path="/" element={<HomeRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
