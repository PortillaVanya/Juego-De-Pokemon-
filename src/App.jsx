import { useState, useEffect } from 'react';
import { getPokemonList } from './services/pokemonService';
import PokemonCard from './components/PokemonCard';

const BATCH_SIZE = 40; // Cantidad de Pokémon por carga

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  // Función utilitaria para concatenar Pokémon garantizando que no haya duplicados
  const mergeUniquePokemons = (currentList, newPokemons) => {
    const existingNames = new Set(currentList.map((p) => p.name));
    const uniqueList = newPokemons.filter((p) => !existingNames.has(p.name));
    return [...currentList, ...uniqueList];
  };

  useEffect(() => {
    const fetchInitialPokemons = async () => {
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
    fetchInitialPokemons();
  }, []);

  // Función para cargar el siguiente bloque de Pokémon sin repetir
  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPokemons = await getPokemonList(BATCH_SIZE, offset);
      setPokemonList((prevList) => mergeUniquePokemons(prevList, nextPokemons));
      setOffset((prevOffset) => prevOffset + BATCH_SIZE);
    } catch (err) {
      setError('Error al cargar más registros: ' + err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredPokemons = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#0f172a' }}>Catálogo Pokédex</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '280px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
      </div>

      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        Total cargados: <strong>{pokemonList.length}</strong> | Mostrando: <strong>{filteredPokemons.length}</strong>
      </p>

      {loading && <h2 style={{ textAlign: 'center', color: '#475569' }}>Cargando datos desde el servidor...</h2>}
      {error && <h2 style={{ textAlign: 'center', color: '#dc2626' }}>Error: {error}</h2>}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {filteredPokemons.length > 0 ? (
              filteredPokemons.map((pokemon) => (
                <PokemonCard key={pokemon.name} pokemonName={pokemon.name} />
              ))
            ) : (
              <p>No se encontraron coincidencias para "{search}".</p>
            )}
          </div>

          {/* Botón para cargar más Pokémon sin repetir */}
          {!search && (
            <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  backgroundColor: loadingMore ? '#94a3b8' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {loadingMore ? 'Cargando más Pokémon...' : 'Cargar más Pokémon'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
