import type { Pokemon } from '../types/pokemon';
import './TeamBuilder.css';

export interface TeamBuilderProps {
  team: Pokemon[];
  onRemovePokemon: (pokemonName: string) => void;
  onSelectPokemon: (pokemon: Pokemon) => void;
  onClearTeam: () => void;
}

function TeamBuilder({ team, onRemovePokemon, onSelectPokemon, onClearTeam }: TeamBuilderProps) {
  const maxSlots = 6;
  const slots = Array.from({ length: maxSlots });

  return (
    <div className="team-builder-panel">
      <div className="team-builder-header">
        <h2 className="team-title">
          <span>🎒</span> Mi Equipo Pokémon
          <span className="team-badge">
            {team.length}/{maxSlots}
          </span>
        </h2>
        {team.length > 0 && (
          <div className="team-actions">
            <button className="clear-team-btn" onClick={onClearTeam}>
              Vaciar Equipo
            </button>
          </div>
        )}
      </div>

      <div className="team-slots-grid">
        {slots.map((_, index) => {
          const member = team[index];
          if (member) {
            const sprite =
              member.sprites?.front_default ||
              member.sprites?.other?.['official-artwork']?.front_default;

            return (
              <div
                key={member.name}
                className="team-slot filled"
                onClick={() => onSelectPokemon(member)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectPokemon(member);
                  }
                }}
                role="button"
                tabIndex={0}
                title={`Ver detalles de ${member.name}`}
              >
                <button
                  className="slot-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePokemon(member.name);
                  }}
                  aria-label={`Eliminar ${member.name} del equipo`}
                  title="Eliminar del equipo"
                >
                  ✕
                </button>
                <img src={sprite ?? ''} alt={member.name} className="slot-sprite" />
                <span className="slot-name">{member.name}</span>
              </div>
            );
          }

          return (
            <div key={`empty-${index}`} className="team-slot empty">
              <span className="slot-empty-icon">⚪</span>
              <span className="slot-empty-text">Ranura {index + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeamBuilder;
