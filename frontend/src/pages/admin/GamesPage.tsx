import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '../../hooks/useUserRole';
import { useApi } from '../../hooks/useApi';

interface GameDto {
  id: string;
  name: string;
  slug: string;
  inscriptionMode: string;
  scoreDisplay: string;
  iconUrl: string | null;
}

const SUGGESTED_GAMES: { category: string; games: string[] }[] = [
  {
    category: 'Football',
    games: ['EA Sports FC 26', 'eFootball', 'Football Manager 2024'],
  },
  {
    category: 'FPS',
    games: [
      'Counter-Strike 2', 'Valorant', 'Rainbow Six Siege', 'Delta Force',
      'Call of Duty: Black Ops 6', 'Call of Duty: Warzone', 'Overwatch 2',
      'Battlefield 2042', 'Halo Infinite', 'Escape from Tarkov',
      'The Finals', 'PUBG: Battlegrounds',
    ],
  },
  {
    category: 'Battle Royale',
    games: [
      'Fortnite', 'Apex Legends', 'PUBG: Battlegrounds', 'Free Fire',
      'Call of Duty: Warzone', 'Naraka: Bladepoint', 'Super People',
    ],
  },
  {
    category: 'MOBA',
    games: [
      'League of Legends', 'Dota 2', 'Smite 2',
      'Mobile Legends: Bang Bang', 'Honor of Kings', 'Heroes of the Storm',
    ],
  },
  {
    category: 'Fighting',
    games: [
      'Street Fighter 6', 'Tekken 8', 'Mortal Kombat 1',
      'Dragon Ball: Sparking! Zero', 'Dragon Ball FighterZ', 'Guilty Gear Strive',
      'Granblue Fantasy Versus Rising', 'Under Night In-Birth II',
      'Brawlhalla', 'MultiVersus',
    ],
  },
  {
    category: 'Racing',
    games: [
      'F1 25', 'Gran Turismo 7', 'Forza Motorsport', 'Forza Horizon 5',
      'Assetto Corsa Competizione', 'Assetto Corsa EVO', 'iRacing',
      'EA Sports WRC', 'Need for Speed Unbound',
    ],
  },
  {
    category: 'Sports',
    games: [
      'NBA 2K26', 'Madden NFL 26', 'MLB The Show 26', 'NHL 26',
      'TopSpin 2K25', 'PGA Tour 2K25', 'WWE 2K26', 'UFC 5',
    ],
  },
  {
    category: 'Strategy',
    games: [
      'Age of Empires II Definitive Edition', 'Age of Empires IV', 'StarCraft II',
      'Warcraft III Reforged', 'Company of Heroes 3',
      'Command & Conquer Remastered', 'Civilization VII',
    ],
  },
  {
    category: 'Card Game',
    games: [
      'Hearthstone', 'Magic: The Gathering Arena', 'Yu-Gi-Oh! Master Duel',
      'Legends of Runeterra', 'Pokémon TCG Live', 'Marvel Snap',
    ],
  },
  {
    category: 'Mobile',
    games: [
      'Free Fire', 'Free Fire MAX', 'PUBG Mobile', 'Call of Duty Mobile',
      'Brawl Stars', 'Clash Royale', 'Honor of Kings',
      'Mobile Legends: Bang Bang', 'Pokémon Unite', 'Arena Breakout', 'Blood Strike',
    ],
  },
  {
    category: 'Party Game',
    games: [
      'Rocket League', 'Fall Guys', 'Stumble Guys', 'Among Us',
      'Party Animals', 'Mario Kart 8 Deluxe', 'Gang Beasts',
    ],
  },
  {
    category: 'Chess',
    games: ['Chess', 'Chess960'],
  },
  {
    category: 'Sandbox',
    games: ['Minecraft', 'Roblox', 'Core', 'Trackmania'],
  },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const INSCRIPTION_LABELS: Record<string, string> = {
  LicensedTeams: 'Times Licenciados',
  OwnIdentity: 'Identidade Própria',
};

const SCORE_LABELS: Record<string, string> = {
  goals: 'Gols',
  points: 'Pontos',
  sets: 'Sets',
};

export default function GamesPage() {
  const { role } = useUserRole();
  const api = useApi();
  const formRef = useRef<HTMLDivElement>(null);

  const [games, setGames] = useState<GameDto[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    inscriptionMode: 'OwnIdentity',
    scoreDisplay: 'points',
    iconUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  function loadGames() {
    setLoadingGames(true);
    api
      .get<{ data: GameDto[] }>('/api/v1/games')
      .then(res => setGames(res.data.data))
      .catch(() => setGames([]))
      .finally(() => setLoadingGames(false));
  }

  useEffect(() => { loadGames(); }, []);

  if (role && role !== 'SuperAdmin') return <Navigate to="/" replace />;

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleNameChange(value: string) {
    setForm(f => ({ ...f, name: value, slug: toSlug(value) }));
  }

  function fillFromSuggestion(gameName: string) {
    setForm({
      name: gameName,
      slug: toSlug(gameName),
      inscriptionMode: 'OwnIdentity',
      scoreDisplay: 'points',
      iconUrl: '',
    });
    setFormError('');
    setFormSuccess('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleCategory(cat: string) {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Nome é obrigatório.'); return; }
    if (!form.slug.trim()) { setFormError('Slug é obrigatório.'); return; }
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await api.post('/api/v1/admin/games', {
        name: form.name.trim(),
        slug: form.slug.trim(),
        inscriptionMode: form.inscriptionMode,
        scoreDisplay: form.scoreDisplay,
        iconUrl: form.iconUrl.trim() || null,
      });
      setFormSuccess(`"${form.name}" cadastrado com sucesso!`);
      setForm({ name: '', slug: '', inscriptionMode: 'OwnIdentity', scoreDisplay: 'points', iconUrl: '' });
      loadGames();
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? 'Erro ao cadastrar jogo.');
    } finally {
      setSubmitting(false);
    }
  }

  const registeredSlugs = new Set(games.map(g => g.slug));

  // ── styles ──────────────────────────────────────────────────────────────────

  const pageStyle: React.CSSProperties = {
    padding: '32px 40px',
    maxWidth: 1100,
    margin: '0 auto',
    animation: 'fadeIn 0.25s ease',
  };

  const sectionCard: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px 28px',
    marginBottom: 28,
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    padding: '8px 14px',
    borderBottom: '1px solid var(--border)',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: 13,
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    padding: '9px 12px',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'var(--text-muted)',
    marginBottom: 6,
    display: 'block',
  };

  const chipStyle = (registered: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 500,
    cursor: registered ? 'default' : 'pointer',
    border: `1px solid ${registered ? 'var(--border)' : 'rgba(0,170,255,0.3)'}`,
    background: registered ? 'rgba(255,255,255,0.03)' : 'rgba(0,170,255,0.07)',
    color: registered ? 'var(--text-muted)' : 'var(--accent)',
    transition: 'background 0.15s, border-color 0.15s',
    opacity: registered ? 0.5 : 1,
    whiteSpace: 'nowrap',
  });

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <span style={{ fontSize: 28 }}>🎮</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            Gerenciar Jogos
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Catálogo de jogos disponíveis para campeonatos
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge-cyan" style={{ fontSize: 13, padding: '4px 12px' }}>
            {games.length} jogo{games.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabela de jogos cadastrados */}
      <div style={sectionCard}>
        <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700 }}>Jogos Cadastrados</h2>
        {loadingGames ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando...</p>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Nenhum jogo cadastrado ainda. Use o formulário abaixo para adicionar.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Jogo</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Modo de Inscrição</th>
                <th style={thStyle}>Placar</th>
              </tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr
                  key={g.id}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {g.iconUrl && (
                        <img
                          src={g.iconUrl}
                          alt=""
                          style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <span style={{ fontWeight: 600 }}>{g.name}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>
                    {g.slug}
                  </td>
                  <td style={tdStyle}>
                    <span className={g.inscriptionMode === 'LicensedTeams' ? 'badge-purple' : 'badge-cyan'}>
                      {INSCRIPTION_LABELS[g.inscriptionMode] ?? g.inscriptionMode}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span className="badge-muted">
                      {SCORE_LABELS[g.scoreDisplay] ?? g.scoreDisplay}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Formulário de cadastro */}
      <div ref={formRef} style={sectionCard}>
        <h2 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Cadastrar Novo Jogo</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
          <div>
            <label style={labelStyle}>Nome do jogo *</label>
            <input
              style={inputStyle}
              className="input-field"
              placeholder="Ex: Counter-Strike 2"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label style={labelStyle}>Slug</label>
            <input
              style={inputStyle}
              className="input-field"
              placeholder="counter-strike-2"
              value={form.slug}
              onChange={e => setField('slug', e.target.value)}
              disabled={submitting}
            />
            <p style={{ margin: '5px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
              Identificador único, gerado automaticamente a partir do nome.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Modo de Inscrição</label>
              <select
                style={selectStyle}
                value={form.inscriptionMode}
                onChange={e => setField('inscriptionMode', e.target.value)}
                disabled={submitting}
              >
                <option value="OwnIdentity">Identidade Própria</option>
                <option value="LicensedTeams">Times Licenciados</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Exibição de Placar</label>
              <select
                style={selectStyle}
                value={form.scoreDisplay}
                onChange={e => setField('scoreDisplay', e.target.value)}
                disabled={submitting}
              >
                <option value="points">Pontos</option>
                <option value="goals">Gols</option>
                <option value="sets">Sets</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>URL do Ícone (opcional)</label>
            <input
              style={inputStyle}
              className="input-field"
              placeholder="https://..."
              value={form.iconUrl}
              onChange={e => setField('iconUrl', e.target.value)}
              disabled={submitting}
            />
          </div>

          {formError && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--error)', fontWeight: 500 }}>
              {formError}
            </p>
          )}
          {formSuccess && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--success)', fontWeight: 500 }}>
              {formSuccess}
            </p>
          )}

          <div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 160 }}>
              {submitting ? 'Cadastrando...' : 'Cadastrar Jogo'}
            </button>
          </div>
        </form>
      </div>

      {/* Jogos sugeridos */}
      <div style={sectionCard}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Jogos Sugeridos</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Clique em um jogo para pré-preencher o formulário acima.
            Jogos já cadastrados aparecem esmaecidos.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SUGGESTED_GAMES.map(({ category, games: suggestions }) => {
            const isOpen = openCategories[category] ?? false;
            return (
              <div key={category} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: isOpen ? 'var(--surface-alt)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'background 0.15s',
                  }}
                >
                  <span>{category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                      {suggestions.filter(n => registeredSlugs.has(toSlug(n))).length}/{suggestions.length} cadastrados
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isOpen && (
                  <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, background: 'var(--surface-alt)' }}>
                    {suggestions.map(gameName => {
                      const registered = registeredSlugs.has(toSlug(gameName));
                      return (
                        <button
                          key={gameName}
                          type="button"
                          onClick={() => !registered && fillFromSuggestion(gameName)}
                          style={chipStyle(registered)}
                          title={registered ? 'Já cadastrado' : `Pré-preencher: ${gameName}`}
                        >
                          {registered && <span style={{ marginRight: 4 }}>✓</span>}
                          {gameName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
