import type { KeyboardEvent } from 'react';
import { getTypeColor, getTypeLabel } from '../services/pokemonService';
import type { Pokemon } from '../types/pokemon';
import './PokemonCard.css';

export interface PokemonCardUIProps {
  pokemon: Pokemon;
  isInTeam: boolean;
  selectedType: string;
  onSelectType?: (typeName: string) => void;
  onToggleTeam: (pokemon: Pokemon) => void;
  onPlayCry: (pokemon: Pokemon) => void;
  onSelect: (pokemon: Pokemon) => void;
  onBattle?: (pokemon: Pokemon) => void;
}

/**
 * Componente presentacional (UI):
 * Solo renderiza la tarjeta a partir de las props; no sabe nada de red ni caché.
 */
function PokemonCardUI({
  pokemon,
  isInTeam,
  selectedType,
  onSelectType,
  onToggleTeam,
  onPlayCry,
  onSelect,
  onBattle
}: PokemonCardUIProps) {
  if (!pokemon) return null;

  const mainType = pokemon.types[0]?.type?.name || 'normal';
  const mainColor = getTypeColor(mainType);

  const artwork =
    pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default;

  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;
  const hpStat =
    pokemon.stats?.find((s) => s.stat.name === 'hp')?.base_stat ?? pokemon.stats[0]?.base_stat;
  const attackStat =
    pokemon.stats?.find((s) => s.stat.name === 'attack')?.base_stat ?? pokemon.stats[1]?.base_stat;

  const handleOpen = () => onSelect(pokemon);
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(pokemon);
    }
  };

  return (
    <div
      className="pokemon-card"
      style={{ borderTopColor: mainColor }}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title={`Haz clic para ver detalles de ${pokemon.name}`}
      aria-label={`Ver detalles de ${pokemon.name}`}
    >
      {/* Botones de acción flotantes */}
      <div className="card-action-bar">
        <button
          type="button"
          className="card-icon-btn cry-btn"
          onClick={(e) => {
            e.stopPropagation();
            onPlayCry(pokemon);
          }}
          title={`Escuchar sonido (Cry) de ${pokemon.name}`}
          aria-label={`Reproducir sonido de ${pokemon.name}`}
        >
          🔊
        </button>

        <button
          type="button"
          className="card-icon-btn battle-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onBattle) onBattle(pokemon);
          }}
          title={`Combatir con ${pokemon.name} en la Arena de Batalla`}
          aria-label={`Combatir con ${pokemon.name}`}
        >
          ⚔️
        </button>

        <button
          type="button"
          className={`card-icon-btn team-btn ${isInTeam ? 'in-team' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTeam(pokemon);
          }}
          title={isInTeam ? 'Quitar de mi equipo' : 'Agregar a mi equipo (hasta 6)'}
          aria-label={isInTeam ? `Quitar ${pokemon.name} de mi equipo` : `Agregar ${pokemon.name} a mi equipo`}
        >
          {isInTeam ? '⭐' : '➕'}
        </button>
      </div>

      <span className="card-number">{formattedId}</span>

      <div className="card-image-container">
        {artwork && (
          <img src={artwork} alt={pokemon.name} className="card-image" loading="lazy" />
        )}
      </div>

      <h3 className="card-name">{pokemon.name}</h3>

      {/* Píldoras interactivas de tipo */}
      <div className="card-types">
        {pokemon.types.map((t) => {
          const typeName = t.type.name;
          const isSelected = selectedType === typeName;
          return (
            <button
              key={typeName}
              type="button"
              className={`type-pill-btn ${isSelected ? 'active-filter' : ''}`}
              style={{ backgroundColor: getTypeColor(typeName) }}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectType) onSelectType(typeName);
              }}
              title={`Filtrar por tipo ${getTypeLabel(typeName)}`}
            >
              {getTypeLabel(typeName)}
            </button>
          );
        })}
      </div>

      <div className="card-stats">
        <span className="stat-item">
          ❤️ <strong>HP:</strong> <span>{hpStat}</span>
        </span>
        <span className="stat-item">
          ⚔️ <strong>ATQ:</strong> <span>{attackStat}</span>
        </span>
      </div>
    </div>
  );
}

export default PokemonCardUI;
