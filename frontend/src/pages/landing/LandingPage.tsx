import { Link } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    icon: '🏆',
    title: 'Campeonatos em Liga',
    desc: 'Crie torneios completos em formato liga simples ou duplo turno, com rodadas e tabela automática.',
  },
  {
    icon: '⚡',
    title: 'Draft ao Vivo',
    desc: 'Sorteio de equipes em tempo real com SignalR — todos os participantes veem instantaneamente.',
  },
  {
    icon: '📊',
    title: 'Estatísticas Completas',
    desc: 'Perfil de jogador com histórico de títulos, vitórias, empates e derrotas em cada temporada.',
  },
  {
    icon: '🎮',
    title: 'Multi-Jogo',
    desc: 'Suporte a qualquer modalidade: futebol, basquete, FPS, MOBA e muito mais.',
  },
  {
    icon: '👥',
    title: 'Gestão de Inscrições',
    desc: 'Controle quem entra, valide equipes licenciadas (1–5 estrelas) e acompanhe retiradas.',
  },
  {
    icon: '🔒',
    title: 'Seguro e Confiável',
    desc: 'Autenticação própria com BCrypt, controle de acesso por perfil e dados protegidos.',
  },
];

const steps = [
  {
    n: '1',
    title: 'Crie sua conta',
    desc: 'Escolha seu @handle único e se cadastre em segundos. Sem burocracia.',
  },
  {
    n: '2',
    title: 'Entre ou organize',
    desc: 'Jogadores se inscrevem em campeonatos; organizadores criam e gerenciam tudo.',
  },
  {
    n: '3',
    title: 'Jogue e acompanhe',
    desc: 'Registre resultados, veja a tabela atualizada e dispute o título.',
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ── NAVBAR ── */}
      <nav className="landing-nav">
        <span className="landing-nav-logo">⚔️ EsportsArena</span>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn-outline btn-outline-sm">Entrar</Link>
          <Link to="/register" className="btn-primary btn-primary-sm">Criar Conta</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="hero-badge">⚔️ Plataforma de Esports</div>

        <h1>
          Organize. Compita.<br />
          <span>Domine.</span>
        </h1>

        <p className="hero-sub">
          A plataforma completa para criar e gerenciar campeonatos de esports.
          Do draft ao vivo até a tabela final — tudo em um só lugar.
        </p>

        <div className="hero-ctas">
          <Link to="/register" className="btn-primary">Criar Conta Grátis</Link>
          <Link to="/login" className="btn-outline">Entrar</Link>
          <Link to="/championships" className="btn-ghost">Ver Campeonatos</Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">Liga</span>
            <span className="hero-stat-label">Formato completo</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">Ao Vivo</span>
            <span className="hero-stat-label">Draft em tempo real</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">Multi</span>
            <span className="hero-stat-label">Qualquer jogo</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <div className="features-section">
        <div className="features-inner">
          <span className="section-label">Recursos</span>
          <h2 className="section-title">Por que EsportsArena?</h2>
          <p className="section-sub">
            Tudo o que você precisa para competir de forma profissional,
            sem depender de planilhas ou grupos de WhatsApp.
          </p>

          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section">
        <span className="section-label">Simples assim</span>
        <h2 className="section-title">Como funciona</h2>
        <p className="section-sub">
          Do cadastro ao troféu em três passos.
        </p>

        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.n} className="step">
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AUDIENCES ── */}
      <div className="audiences-section">
        <div className="audiences-inner">
          <span className="section-label">Para você</span>
          <h2 className="section-title">Feito para jogadores e organizadores</h2>
          <p className="section-sub">
            Seja você quem compete ou quem gerencia, a EsportsArena tem tudo pronto.
          </p>

          <div className="audiences-grid">
            <div className="audience-card">
              <div className="audience-card-header">
                <span className="audience-icon">🎮</span>
                <h3>Para Jogadores</h3>
              </div>
              <ul>
                <li>Inscreva-se em campeonatos com um clique</li>
                <li>Receba sua equipe via draft ao vivo</li>
                <li>Perfil com histórico completo de partidas e títulos</li>
                <li>Acompanhe a tabela de classificação em tempo real</li>
              </ul>
              <Link to="/register" className="audience-cta">
                Criar conta de jogador →
              </Link>
            </div>

            <div className="audience-card organizer">
              <div className="audience-card-header">
                <span className="audience-icon">🏅</span>
                <h3>Para Organizadores</h3>
              </div>
              <ul>
                <li>Crie campeonatos em poucos minutos</li>
                <li>Gerencie inscrições e equipes licenciadas (1–5 estrelas)</li>
                <li>Realize drafts ao vivo com atualização instantânea</li>
                <li>Controle pontuações e gere a tabela automaticamente</li>
              </ul>
              <Link to="/register" className="audience-cta">
                Quero organizar campeonatos →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <section className="cta-final">
        <h2>Pronto para competir?</h2>
        <p>Crie sua conta gratuitamente e faça parte da arena.</p>
        <Link to="/register" className="btn-primary">Cadastrar Agora</Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-links">
          <Link to="/championships">Campeonatos</Link>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Cadastrar</Link>
        </div>
        <div>© {new Date().getFullYear()} EsportsArena — Todos os direitos reservados</div>
      </footer>
    </div>
  );
}
