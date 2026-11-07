import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPokemonList,
  getPokemonDetails,
  TYPE_TRANSLATIONS,
  GENERATIONS
} from './services/pokemonService';
import { useDebounce } from './hooks/useDebounce';
import PokemonCard from './components/PokemonCard';
import PokemonModal from './components/PokemonModal';
import SkeletonCard from './components/SkeletonCard';
import TeamBuilder from './components/TeamBuilder';
import WhoIsThatPokemon from './components/WhoIsThatPokemon';
import './App.css';

const DEFAULT_BATCH_SIZE = 40;

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [pokemonDetailsMap, setPokemonDetailsMap] = useState({});
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [selectedType, setSelectedType] = useState('all');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [sortBy, setSortBy] = useState('id-asc');

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showMinigame, setShowMinigame] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  // Equipo Pokémon (máximo 6) persistido en localStorage
  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem('pokedex_team');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pokedex_team', JSON.stringify(team));
    } catch {
      // Ignorar errores de storage
    }
  }, [team]);

  // Mostrar mensaje tipo Toast temporal
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Agregar o quitar del equipo
  const handleToggleTeam = (pokemon) => {
    const isAlready = team.some((p) => p.name.toLowerCase() === pokemon.name.toLowerCase());
    if (isAlready) {
      setTeam((prev) => prev.filter((p) => p.name.toLowerCase() !== pokemon.name.toLowerCase()));
      showToast(`⭐ ${pokemon.name} eliminado de tu equipo.`);
    } else {
      if (team.length >= 6) {
        showToast('⚠️ Tu equipo ya tiene 6 Pokémon (límite máximo).');
        return;
      }
      setTeam((prev) => [...prev, pokemon]);
      showToast(`🎒 ¡${pokemon.name} agregado a tu equipo!`);
      setShowTeamPanel(true);
    }
  };

  const handleRemoveFromTeam = (pokemonName) => {
    setTeam((prev) => prev.filter((p) => p.name.toLowerCase() !== pokemonName.toLowerCase()));
    showToast(`⭐ ${pokemonName} eliminado de tu equipo.`);
  };

  const handleClearTeam = () => {
    setTeam([]);
    showToast('🎒 Equipo vaciado.');
  };

  // Modo Oscuro persistente en localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('pokedex_theme') === 'dark';
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('pokedex_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Función para fusionar listas de Pokémon garantizando NO DUPLICADOS
  const mergeUniquePokemons = (currentList, newPokemons) => {
    const existingNames = new Set(currentList.map((p) => p.name));
    const unique = newPokemons.filter((p) => !existingNames.has(p.name));
    return [...currentList, ...unique];
  };

  // Callback de detalles para filtros y ordenamientos
  const handleLoadedDetails = useCallback((details) => {
    setPokemonDetailsMap((prev) => {
      if (prev[details.name]) return prev;
      return { ...prev, [details.name]: details };
    });
  }, []);

  // Carga de catálogo según generación o inicial
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        setError(null);

        const genConfig = GENERATIONS.find((g) => g.id === selectedGeneration);
        const reqLimit = genConfig ? genConfig.limit : DEFAULT_BATCH_SIZE;
        const reqOffset = genConfig ? genConfig.offset : 0;

        const data = await getPokemonList(reqLimit, reqOffset);
        setPokemonList(data);
        setOffset(reqOffset + reqLimit);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedGeneration]);

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

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Cargar más Pokémon sin duplicar (solo disponible en modo 'Todas las Generaciones')
  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextData = await getPokemonList(DEFAULT_BATCH_SIZE, offset);
      setPokemonList((prev) => mergeUniquePokemons(prev, nextData));
      setOffset((prev) => prev + DEFAULT_BATCH_SIZE);
    } catch (err) {
      setError('Error al cargar más Pokémon: ' + err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filtrado y Ordenamiento
  const processedPokemons = useMemo(() => {
    // 1. Filtrado por nombre y por tipo
    const filtered = pokemonList.filter((pokemon) => {
      const matchesName = pokemon.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      if (!matchesName) return false;

      if (selectedType === 'all') return true;

      const details = pokemonDetailsMap[pokemon.name];
      if (!details) return true; // Mostrar mientras se obtienen detalles

      return details.types.some((t) => t.type.name === selectedType);
    });

    // 2. Ordenamiento
    return filtered.sort((a, b) => {
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
          const idA = detailsA?.id || 0;
          const idB = detailsB?.id || 0;
          return idB - idA;
        }
        case 'id-asc':
        default: {
          const idA = detailsA?.id || 0;
          const idB = detailsB?.id || 0;
          return idA - idB;
        }
      }
    });
  }, [pokemonList, debouncedSearch, selectedType, sortBy, pokemonDetailsMap]);

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : ''}`}>
      <div className="app-content">
        {/* Encabezado Principal */}
        <header className="app-header">
          <div className="app-title-group">
            <span style={{ fontSize: '34px' }}>⚡</span>
            <h1 className="app-title">Pokédex Pro</h1>
          </div>

          <div className="header-actions">
            <button
              className="minigame-btn"
              onClick={() => setShowMinigame(true)}
              title="Jugar a ¿Quién es este Pokémon?"
            >
              🎮 Minijuego
            </button>

            <button
              className="team-toggle-header-btn"
              onClick={() => setShowTeamPanel(!showTeamPanel)}
              title="Mostrar u ocultar mi equipo"
            >
              🎒 Equipo ({team.length}/6)
            </button>

            <button
              className="theme-toggle-btn"
              onClick={toggleDarkMode}
              title="Alternar Modo Claro / Oscuro"
            >
              {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>
        </header>

        {/* Panel Desplegable de Equipo Pokémon */}
        {showTeamPanel && (
          <TeamBuilder
            team={team}
            onRemovePokemon={handleRemoveFromTeam}
            onSelectPokemon={setSelectedPokemon}
            onClearTeam={handleClearTeam}
          />
        )}

        {/* Barra de Filtros y Controles */}
        <div className="controls-bar">
          {/* Buscador con Debounce */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar Pokémon por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filtro por Generación */}
          <select
            value={selectedGeneration}
            onChange={(e) => {
              setSelectedGeneration(e.target.value);
              setPokemonDetailsMap({});
            }}
            className="select-control"
            title="Filtrar por Generación / Región"
          >
            {GENERATIONS.map((gen) => (
              <option key={gen.id} value={gen.id}>
                {gen.name}
              </option>
            ))}
          </select>

          {/* Filtro por Tipo */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="select-control"
            title="Filtrar por Tipo elemental"
          >
            <option value="all">Todos los Tipos</option>
            {Object.entries(TYPE_TRANSLATIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Selector de Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-control"
            title="Ordenar catálogo"
          >
            <option value="id-asc">Número (Menor a Mayor)</option>
            <option value="id-desc">Número (Mayor a Menor)</option>
            <option value="name-asc">Nombre (A - Z)</option>
            <option value="name-desc">Nombre (Z - A)</option>
            <option value="hp-desc">Mayor HP (Puntos de Salud)</option>
            <option value="attack-desc">Mayor Ataque</option>
          </select>
        </div>

        {/* Contador Informativo */}
        <p className="pokemon-counter">
          Total cargados: <strong>{pokemonList.length}</strong> | Mostrando: <strong>{processedPokemons.length}</strong>
        </p>

        {/* Mensajes de Error */}
        {error && <p className="status-message error">⚠️ {error}</p>}

        {/* Cuadrícula CSS Grid Responsiva */}
        {loading ? (
          <div className="pokemon-grid">
            {Array.from({ length: 12 }).map((_, idx) => (
              <SkeletonCard key={`skeleton-${idx}`} />
            ))}
          </div>
        ) : (
          <>
            {processedPokemons.length > 0 ? (
              <div className="pokemon-grid">
                {processedPokemons.map((pokemon) => {
                  const inTeam = team.some(
                    (p) => p.name.toLowerCase() === pokemon.name.toLowerCase()
                  );
                  return (
                    <PokemonCard
                      key={pokemon.name}
                      pokemonName={pokemon.name}
                      isInTeam={inTeam}
                      onToggleTeam={handleToggleTeam}
                      onSelect={setSelectedPokemon}
                      onLoadedDetails={handleLoadedDetails}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No se encontraron Pokémon con los criterios de búsqueda seleccionados.</p>
              </div>
            )}

            {/* Botón Cargar Más (cuando esté en catálogo general) */}
            {selectedGeneration === 'all' && selectedType === 'all' && !debouncedSearch && (
              <div className="load-more-container">
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? '⏳ Cargando más Pokémon...' : '➕ Cargar más Pokémon'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal flotante con detalles completos */}
      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          isInTeam={team.some(
            (p) => p.name.toLowerCase() === selectedPokemon.name.toLowerCase()
          )}
          onToggleTeam={handleToggleTeam}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      {/* Minijuego ¿Quién es este Pokémon? */}
      {showMinigame && (
        <WhoIsThatPokemon
          candidateList={pokemonList}
          onClose={() => setShowMinigame(false)}
        />
      )}

      {/* Notificación Toast flotante */}
      {toastMessage && <div className="app-toast">{toastMessage}</div>}
    </div>
  );
}

export default App;
