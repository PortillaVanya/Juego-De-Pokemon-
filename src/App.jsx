import { useState, useEffect, useCallback } from 'react';
import { getPokemonList, TYPE_TRANSLATIONS } from './services/pokemonService';
import PokemonCard from './components/PokemonCard';
import PokemonModal from './components/PokemonModal';
import './App.css';

const BATCH_SIZE = 40;

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [pokemonDetailsMap, setPokemonDetailsMap] = useState({});
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

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

  // Callback para almacenar los detalles de cada Pokémon al cargarse (para filtro por tipo)
  const handleLoadedDetails = useCallback((details) => {
    setPokemonDetailsMap((prev) => {
      if (prev[details.name]) return prev;
      return { ...prev, [details.name]: details };
    });
  }, []);

  // Carga inicial
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPokemonList(BATCH_SIZE, 0);
        setPokemonList(data);
        setOffset(BATCH_SIZE);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  // Cargar más Pokémon sin duplicar
  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextData = await getPokemonList(BATCH_SIZE, offset);
      setPokemonList((prev) => mergeUniquePokemons(prev, nextData));
      setOffset((prev) => prev + BATCH_SIZE);
    } catch (err) {
      setError('Error al cargar más Pokémon: ' + err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filtrado reactivo por Nombre y por Tipo
  const filteredPokemons = pokemonList.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesName) return false;

    if (selectedType === 'all') return true;

    const details = pokemonDetailsMap[pokemon.name];
    if (!details) return true; // Mientras carga detalles, se muestra por nombre

    return details.types.some((t) => t.type.name === selectedType);
  });

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : ''}`}>
      <div className="app-content">
        {/* Encabezado Principal */}
        <header className="app-header">
          <div className="app-title-group">
            <span style={{ fontSize: '32px' }}>⚡</span>
            <h1 className="app-title">Catálogo Pokédex</h1>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            title="Alternar Modo Claro / Oscuro"
          >
            {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </header>

        {/* Barra de Filtros: Buscador + Dropdown por Tipo */}
        <div className="controls-bar">
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

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-select"
          >
            <option value="all">Todos los Tipos</option>
            {Object.entries(TYPE_TRANSLATIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Contador Informativo */}
        <p className="pokemon-counter">
          Total cargados: <strong>{pokemonList.length}</strong> | Mostrando: <strong>{filteredPokemons.length}</strong>
        </p>

        {/* Estados de Carga y Error */}
        {loading && <p className="status-message loading">⏳ Conectando con PokéAPI...</p>}
        {error && <p className="status-message error">⚠️ {error}</p>}

        {/* Cuadrícula CSS Grid Responsiva */}
        {!loading && !error && (
          <>
            {filteredPokemons.length > 0 ? (
              <div className="pokemon-grid">
                {filteredPokemons.map((pokemon) => (
                  <PokemonCard
                    key={pokemon.name}
                    pokemonName={pokemon.name}
                    onSelect={setSelectedPokemon}
                    onLoadedDetails={handleLoadedDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No se encontraron Pokémon con los criterios de búsqueda.</p>
              </div>
            )}

            {/* Botón Cargar Más */}
            {selectedType === 'all' && !search && (
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
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
}

export default App;
