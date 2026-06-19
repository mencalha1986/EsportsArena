import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import ChampionshipsListPage from './pages/championships/ListPage';
import NewChampionshipPage from './pages/championships/NewPage';
import ChampionshipDetailPage from './pages/championships/DetailPage';
import LeaguePage from './pages/league/LeaguePage';
import DraftPage from './pages/draft/DraftPage';
import { supabase } from './lib/supabaseClient';

function NavBar() {
  const { session } = useAuth();
  return (
    <nav style={{ padding: '12px 24px', background: '#1a1a2e', color: '#fff', display: 'flex', gap: 16, alignItems: 'center' }}>
      <Link to="/championships" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', fontSize: 18 }}>EsportsArena</Link>
      <div style={{ flex: 1 }} />
      {session ? (
        <>
          <Link to="/championships" style={{ color: '#ccc', textDecoration: 'none' }}>Campeonatos</Link>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#ccc', border: '1px solid #555', cursor: 'pointer', padding: '4px 12px', borderRadius: 4 }}>
            Sair
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: '#ccc', textDecoration: 'none' }}>Entrar</Link>
          <Link to="/register" style={{ color: '#ccc', textDecoration: 'none' }}>Cadastrar</Link>
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile/:platformId" element={<ProfilePage />} />
        <Route path="/championships" element={<ChampionshipsListPage />} />
        <Route path="/championships/new" element={<NewChampionshipPage />} />
        <Route path="/championships/:id" element={<ChampionshipDetailPage />} />
        <Route path="/championships/:id/league" element={<LeaguePage />} />
        <Route path="/championships/:id/draft" element={<DraftPage />} />
        <Route path="/" element={<Navigate to="/championships" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
