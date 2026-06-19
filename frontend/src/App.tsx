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

interface SidebarLinkProps { to: string; icon: string; label: string; }

function SidebarLink({ to, icon, label }: SidebarLinkProps) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px', borderRadius: 'var(--radius)',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        background: active ? 'var(--accent-glow)' : 'transparent',
        fontWeight: active ? 600 : 400, fontSize: 14,
        textDecoration: 'none',
        transition: 'color 0.15s, background 0.15s',
      }}
    >
      <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function Sidebar() {
  const { user } = useAuth();
  const { role, isActive } = useUserRole();
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate('/');
  }

  const initials = user?.platformId?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 220, zIndex: 100,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <Link
          to="/championships"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <img src="/favicon.svg" alt="EsportsArena" style={{ width: 28, height: 28 }} />
          <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>
            Esports<span style={{ color: '#863bff' }}>Arena</span>
          </span>
        </Link>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px' }}>
        <SidebarLink to="/championships" icon="🏆" label="Campeonatos" />
        {((role === 'Admin' && isActive) || role === 'SuperAdmin') && (
          <SidebarLink to="/organizer" icon="🎯" label="Organizar" />
        )}
        {role === 'SuperAdmin' && (
          <SidebarLink to="/admin/dashboard" icon="📊" label="Dashboard" />
        )}
        {role === 'SuperAdmin' && (
          <SidebarLink to="/admin" icon="👥" label="Clientes" />
        )}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.platformId}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-sm btn-full">
          Sair
        </button>
      </div>
    </aside>
  );
}

function Layout() {
  const { session } = useAuth();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {session && <Sidebar />}
      <main style={{ flex: 1, marginLeft: session ? 220 : 0 }}>
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
      </main>
    </div>
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
      <Layout />
    </BrowserRouter>
  );
}

export default App;
