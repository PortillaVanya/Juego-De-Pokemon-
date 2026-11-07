import { TYPE_COLORS, TYPE_TRANSLATIONS } from '../services/pokemonService';
import './PokemonCard.css';

/**
 * Componente "Tonto" (Presentacional / UI):
 * Solo se encarga de renderizar la tarjeta a partir de las props recibidas,
 * sin realizar llamadas HTTP ni efectos colaterales de red.
 */
function PokemonCardUI({
  pokemon,
  isInTeam,
  onToggleTeam,
  onPlayCry,
  onSelect
}) {
  if (!pokemon) return null;

  const mainType = pokemon.types[0]?.type?.name || 'normal';
  const mainColor = TYPE_COLORS[mainType] || '#cbd5e1';

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
      onClick={() => onSelect(pokemon)}
      title={`Haz clic para ver detalles de ${pokemon.name}`}
    >
      {/* Botones de acción flotantes: Altavoz (Cry) y Agregar a Equipo */}
      <div className="card-action-bar">
        <button
          className="card-icon-btn cry-btn"
          onClick={(e) => {
            e.stopPropagation();
            onPlayCry(pokemon);
          }}
          title={`Escuchar sonido (Cry) de ${pokemon.name}`}
          aria-label="Reproducir sonido"
        >
          🔊
        </button>

        <button
          className={`card-icon-btn team-btn ${isInTeam ? 'in-team' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTeam(pokemon);
          }}
          title={isInTeam ? 'Quitar de mi equipo' : 'Agregar a mi equipo (hasta 6)'}
          aria-label="Agregar o quitar de mi equipo"
        >
          {isInTeam ? '⭐' : '➕'}
        </button>
      </div>

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

export default PokemonCardUI;
