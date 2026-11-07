import { useEffect } from 'react';
import { TYPE_COLORS, TYPE_TRANSLATIONS } from '../services/pokemonService';
import './PokemonModal.css';

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad'
};

function PokemonModal({ pokemon, onClose }) {
  // Cerrar modal al presionar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!pokemon) return null;

  const mainType = pokemon.types[0]?.type?.name || 'normal';
  const mainColor = TYPE_COLORS[mainType] || '#3b82f6';

  const artwork =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;
  const heightMeters = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado con color característico del tipo principal */}
        <div
          className="modal-header"
          style={{
            background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}dd 100%)`
          }}
        >
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
          <img src={artwork} alt={pokemon.name} className="modal-artwork" />
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          <div className="modal-title-row">
            <span className="modal-id">{formattedId}</span>
            <h2 className="modal-name">{pokemon.name}</h2>
            <div className="modal-types">
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
          </div>

          {/* Ficha de Altura y Peso */}
          <div className="modal-info-grid">
            <div className="info-item">
              <span>📏 Altura</span>
              <strong>{heightMeters} m</strong>
            </div>
            <div className="info-item">
              <span>⚖️ Peso</span>
              <strong>{weightKg} kg</strong>
            </div>
          </div>

          {/* Habilidades */}
          {pokemon.abilities && pokemon.abilities.length > 0 && (
            <>
              <h3 className="modal-section-title">✨ Habilidades</h3>
              <div className="modal-abilities">
                {pokemon.abilities.map((a) => (
                  <span key={a.ability.name} className="ability-tag">
                    {a.ability.name.replace('-', ' ')}
                    {a.is_hidden && ' (Oculta)'}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Estadísticas Base */}
          <h3 className="modal-section-title">📊 Estadísticas Base</h3>
          <div className="stats-list">
            {pokemon.stats.map((s) => {
              const statName = s.stat.name;
              const val = s.base_stat;
              // Máximo estándar para calcular porcentaje
              const pct = Math.min(100, Math.round((val / 200) * 100));

              return (
                <div key={statName} className="stat-row">
                  <span className="stat-label">
                    {STAT_LABELS[statName] || statName}
                  </span>
                  <span className="stat-value">{val}</span>
                  <div className="stat-bar-container">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: mainColor
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonModal;
