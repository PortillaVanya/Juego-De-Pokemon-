import { useState, useEffect } from 'react';
import { getPokemonDetails, TYPE_COLORS, TYPE_TRANSLATIONS } from '../services/pokemonService';
import './PokemonCard.css';

function PokemonCard({ pokemonName, onSelect, onLoadedDetails }) {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      try {
        setLoading(true);
        const data = await getPokemonDetails(pokemonName);
        if (isMounted) {
          setPokemon(data);
          if (onLoadedDetails) {
            onLoadedDetails(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [pokemonName]);

  if (loading) {
    return (
      <div className="pokemon-card-loading">
        <span>⏳ Cargando...</span>
      </div>
    );
  }

  if (!pokemon) return null;

  const mainType = pokemon.types[0]?.type?.name || 'normal';
  const mainColor = TYPE_COLORS[mainType] || '#cbd5e1';

  // Usar arte oficial en alta definición con fallback al sprite frontal estándar
  const artwork =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

  const hpStat = pokemon.stats?.find((s) => s.stat.name === 'hp')?.base_stat || pokemon.stats[0]?.base_stat;
  const attackStat = pokemon.stats?.find((s) => s.stat.name === 'attack')?.base_stat || pokemon.stats[1]?.base_stat;

  return (
    <div
      className="pokemon-card"
      style={{ borderTopColor: mainColor }}
      onClick={() => onSelect && onSelect(pokemon)}
      title={`Haz clic para ver detalles completos de ${pokemon.name}`}
    >
      <span className="card-number">{formattedId}</span>

      <div className="card-image-container">
        <img
          src={artwork}
          alt={pokemon.name}
          className="card-image"
          loading="lazy"
        />
      </div>

      <h3 className="card-name">{pokemon.name}</h3>

      <div className="card-types">
        {pokemon.types.map((t) => {
          const typeName = t.type.name;
          return (
            <span
              key={typeName}
              className="type-pill"
              style={{ backgroundColor: TYPE_COLORS[typeName] || '#94a3b8' }}
            >
              {TYPE_TRANSLATIONS[typeName] || typeName}
            </span>
          );
        })}
      </div>

      <div className="card-stats">
        <span className="stat-item">
          ❤️ <strong>HP:</strong> {hpStat}
        </span>
        <span className="stat-item">
          ⚔️ <strong>ATQ:</strong> {attackStat}
        </span>
      </div>
    </div>
  );
}

export default PokemonCard;
