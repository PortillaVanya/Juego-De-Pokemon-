import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  GENERATIONS,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_TRANSLATIONS,
  getIdFromUrl,
  getPokemonDetails
} from './services/pokemonService';
import { useDebounce } from './hooks/useDebounce';
import { usePokemonCatalog } from './hooks/usePokemonCatalog';
import { useTeam } from './hooks/useTeam';
import { useTheme } from './hooks/useTheme';
import type { Pokemon, PokemonTypeName, SortOption } from './types/pokemon';
import PokemonCard from './components/PokemonCard';
import SkeletonCard from './components/SkeletonCard';
import TeamBuilder from './components/TeamBuilder';
import './App.css';

// Lazy loading para componentes pesados y modales (Optimización de Rendimiento)
const PokemonModal = lazy(() => import('./components/PokemonModal'));
const WhoIsThatPokemon = lazy(() => import('./components/WhoIsThatPokemon'));
const BattleArena = lazy(() => import('./components/BattleArena'));

function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { team, isInTeam, toggleTeamMember, removeMember, clearTeam } = useTeam();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [selectedType, setSelectedType] = useState('all');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('id-asc');

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [battlePlayerPokemon, setBattlePlayerPokemon] = useState<Pokemon | null>(null);
  const [showBattleArena, setShowBattleArena] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mapa en memoria para detalles acumulados (usado en ordenamiento por HP / Ataque)
  const [pokemonDetailsMap, setPokemonDetailsMap] = useState<Record<string, Pokemon>>({});

  // Catálogo consumido mediante React Query (Caché inteligente y deduplicación)
  const {
    list: catalog,
    loading,
    loadingMore,
    canLoadMore,
    loadMore,
    error
  } = usePokemonCatalog(selectedType, selectedGeneration);

  // Mostrar mensaje tipo Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Manejar clic en botón de tipo (Planta, Veneno, Fuego, Agua, etc.)
  const handleSelectType = useCallback(
    (typeName: string) => {
      if (selectedType === typeName) {
        setSelectedType('all');
        showToast('Filtro de tipo desactivado.');
      } else {
        setSelectedType(typeName);
        const spanishName = TYPE_TRANSLATIONS[typeName as PokemonTypeName] || typeName;
        showToast(`Filtrando por tipo: ${spanishName}`);
      }
    },
    [selectedType, showToast]
  );

  // Agregar / Quitar del equipo
  const handleToggleTeam = useCallback(
    (pokemon: Pokemon) => {
      const message = toggleTeamMember(pokemon);
      showToast(message);
      if (message.includes('agregado')) {
        setShowTeamPanel(true);
      }
    },
    [toggleTeamMember, showToast]
  );

  // Callback de detalles para estadísticas
  const handleLoadedDetails = useCallback((details: Pokemon) => {
    setPokemonDetailsMap((prev) => {
      if (prev[details.name]) return prev;
      return { ...prev, [details.name]: details };
    });
  }, []);

  // Iniciar combate en la Arena
  const handleStartBattle = useCallback(
    (fighter?: Pokemon) => {
      if (fighter) {
        setBattlePlayerPokemon(fighter);
        setShowBattleArena(true);
      } else if (team.length > 0) {
        setBattlePlayerPokemon(team[0]);
        setShowBattleArena(true);
      } else if (catalog.length > 0) {
        void getPokemonDetails(catalog[0].name).then((details) => {
          setBattlePlayerPokemon(details);
          setShowBattleArena(true);
        });
      }
    },
    [team, catalog]
  );

  // Soporte para deep-linking con URL hash (ej: #pokemon-25)
  useEffect(() => {
    const checkHash = async () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#pokemon-')) {
        const idOrName = hash.replace('#pokemon-', '');
        try {
          const data = await getPokemonDetails(idOrName);
          setSelectedPokemon(data);
        } catch (err) {
          console.warn('No se pudo abrir el Pokémon del enlace:', err);
        }
      }
    };

    void checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Filtrado y Ordenamiento memoizado (useMemo para alta eficiencia)
  const processedPokemons = useMemo(() => {
    // 1. Filtrado por nombre con debounce
    const filtered = catalog.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    // 2. Ordenamiento
    return [...filtered].sort((a, b) => {
      const detailsA = pokemonDetailsMap[a.name];
      const detailsB = pokemonDetailsMap[b.name];

      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'hp-desc': {
          const hpA = detailsA?.stats?.[0]?.base_stat || 0;
          const hpB = detailsB?.stats?.[0]?.base_stat || 0;
          return hpB - hpA;
        }
        case 'attack-desc': {
          const atqA = detailsA?.stats?.[1]?.base_stat || 0;
          const atqB = detailsB?.stats?.[1]?.base_stat || 0;
          return atqB - atqA;
        }
        case 'id-desc': {
          const idA = detailsA?.id || (a.url ? getIdFromUrl(a.url) : 0);
          const idB = detailsB?.id || (b.url ? getIdFromUrl(b.url) : 0);
          return idB - idA;
        }
        case 'id-asc':
        default: {
          const idA = detailsA?.id || (a.url ? getIdFromUrl(a.url) : 0);
          const idB = detailsB?.id || (b.url ? getIdFromUrl(b.url) : 0);
          return idA - idB;
        }
      }
    });
  }, [catalog, debouncedSearch, sortBy, pokemonDetailsMap]);

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : ''}`}>
      <div className="app-content">
        {/* Encabezado Principal */}
        <header className="app-header">
          <div className="app-title-group">
            <span style={{ fontSize: '34px' }} role="img" aria-label="Pokédex">
              ⚡
            </span>
            <h1 className="app-title">Pokédex Pro</h1>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="battle-header-btn"
              onClick={() => handleStartBattle()}
              title="Entrar a la Arena de Batalla Pokémon"
              aria-label="Iniciar combate en la Arena Pokémon"
            >
              ⚔️ Batalla
            </button>

            <button
              type="button"
              className="minigame-btn"
              onClick={() => setShowMinigame(true)}
              title="Jugar a ¿Quién es este Pokémon?"
              aria-label="Abrir minijuego ¿Quién es este Pokémon?"
            >
              🎮 Minijuego
            </button>

            <button
              type="button"
              className="team-toggle-header-btn"
              onClick={() => setShowTeamPanel(!showTeamPanel)}
              title="Mostrar u ocultar mi equipo"
              aria-label={`Mi equipo Pokémon, ${team.length} de 6`}
            >
              🎒 Equipo ({team.length}/6)
            </button>

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleDarkMode}
              title="Alternar Modo Claro / Oscuro"
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>
        </header>

        {/* Panel Desplegable de Equipo Pokémon */}
        {showTeamPanel && (
          <TeamBuilder
            team={team}
            onRemovePokemon={removeMember}
            onSelectPokemon={setSelectedPokemon}
            onClearTeam={clearTeam}
          />
        )}

        {/* Barra de Filtros y Controles */}
        <div className="controls-bar" role="search">
          {/* Buscador con Debounce */}
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar Pokémon por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              aria-label="Buscar Pokémon por nombre"
            />
          </div>

          {/* Filtro por Generación */}
          <select
            value={selectedGeneration}
            onChange={(e) => setSelectedGeneration(e.target.value)}
            className="select-control"
            title="Filtrar por Generación / Región"
            aria-label="Filtrar por generación"
          >
            {GENERATIONS.map((gen) => (
              <option key={gen.id} value={gen.id}>
                {gen.name}
              </option>
            ))}
          </select>

          {/* Selector de Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="select-control"
            title="Ordenar catálogo"
            aria-label="Ordenar Pokémon"
          >
            <option value="id-asc">Número (Menor a Mayor)</option>
            <option value="id-desc">Número (Mayor a Menor)</option>
            <option value="name-asc">Nombre (A - Z)</option>
            <option value="name-desc">Nombre (Z - A)</option>
            <option value="hp-desc">Mayor HP (Puntos de Salud)</option>
            <option value="attack-desc">Mayor Ataque</option>
          </select>
        </div>

        {/* Barra de Botones Rápidos de Tipos (Agua, Planta, Fuego, Veneno, etc.) */}
        <div className="type-chips-bar" role="toolbar" aria-label="Filtro rápido por tipo de Pokémon">
          <button
            type="button"
            className={`type-chip-btn type-chip-all ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => handleSelectType('all')}
            aria-label="Mostrar todos los tipos"
          >
            🔘 Todos
          </button>

          {(Object.keys(TYPE_TRANSLATIONS) as PokemonTypeName[]).map((key) => {
            const isSelected = selectedType === key;
            const label = TYPE_TRANSLATIONS[key];
            const color = TYPE_COLORS[key];
            const icon = TYPE_ICONS[key] || '•';

            return (
              <button
                key={key}
                type="button"
                className={`type-chip-btn ${isSelected ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleSelectType(key)}
                title={`Filtrar por tipo ${label}`}
                aria-pressed={isSelected}
              >
                <span>{icon}</span> {label}
              </button>
            );
          })}
        </div>

        {/* Contador Informativo */}
        <p className="pokemon-counter">
          Total disponibles: <strong>{catalog.length}</strong> | Mostrando: <strong>{processedPokemons.length}</strong>
          {selectedType !== 'all' && (
            <span
              style={{
                marginLeft: '10px',
                color: TYPE_COLORS[selectedType as PokemonTypeName] || '#3b82f6',
                fontWeight: 'bold'
              }}
            >
              • Tipo:{' '}
              {TYPE_TRANSLATIONS[selectedType as PokemonTypeName] || selectedType}
            </span>
          )}
        </p>

        {/* Mensajes de Error */}
        {error && <p className="status-message error">⚠️ {error.message}</p>}

        {/* Cuadrícula CSS Grid Responsiva */}
        {loading ? (
          <div className="pokemon-grid" aria-busy="true">
            {Array.from({ length: 12 }).map((_, idx) => (
              <SkeletonCard key={`skeleton-${idx}`} />
            ))}
          </div>
        ) : (
          <>
            {processedPokemons.length > 0 ? (
              <main className="pokemon-grid">
                {processedPokemons.map((pokemon) => {
                  return (
                    <PokemonCard
                      key={pokemon.name}
                      pokemonName={pokemon.name}
                      isInTeam={isInTeam(pokemon.name)}
                      selectedType={selectedType}
                      onSelectType={handleSelectType}
                      onToggleTeam={handleToggleTeam}
                      onSelect={setSelectedPokemon}
                      onBattle={handleStartBattle}
                      onLoadedDetails={handleLoadedDetails}
                    />
                  );
                })}
              </main>
            ) : (
              <div className="empty-state">
                <p>No se encontraron Pokémon con los criterios de búsqueda seleccionados.</p>
                {selectedType !== 'all' && (
                  <button
                    type="button"
                    className="clear-team-btn"
                    style={{ marginTop: '14px', padding: '8px 16px', fontSize: '14px' }}
                    onClick={() => handleSelectType('all')}
                  >
                    Quitar filtro de tipo
                  </button>
                )}
              </div>
            )}

            {/* Botón para cargar 80 Pokémon adicionales sin repetir */}
            {canLoadMore && !debouncedSearch && (
              <div className="load-more-container">
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                  aria-label="Cargar 80 Pokémon más sin repetir"
                >
                  {loadingMore ? '⏳ Cargando 80 Pokémon más...' : '➕ Cargar más Pokémon (+80)'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal flotante cargado perezosamente con Suspense */}
      {selectedPokemon && (
        <Suspense fallback={<div className="modal-backdrop">Cargando detalles...</div>}>
          <PokemonModal
            pokemon={selectedPokemon}
            isInTeam={isInTeam(selectedPokemon.name)}
            onToggleTeam={handleToggleTeam}
            onSelectType={handleSelectType}
            onBattle={handleStartBattle}
            onClose={() => setSelectedPokemon(null)}
          />
        </Suspense>
      )}

      {/* Arena de Batalla Pokémon (Modo Combate) */}
      {showBattleArena && battlePlayerPokemon && (
        <Suspense fallback={<div className="battle-backdrop">Cargando Arena de Combate...</div>}>
          <BattleArena
            playerPokemon={battlePlayerPokemon}
            candidateList={catalog}
            onClose={() => setShowBattleArena(false)}
          />
        </Suspense>
      )}

      {/* Minijuego ¿Quién es este Pokémon? con Suspense */}
      {showMinigame && (
        <Suspense fallback={<div className="minigame-backdrop">Cargando minijuego...</div>}>
          <WhoIsThatPokemon candidateList={catalog} onClose={() => setShowMinigame(false)} />
        </Suspense>
      )}

      {/* Notificación Toast flotante */}
      {toastMessage && (
        <div className="app-toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
