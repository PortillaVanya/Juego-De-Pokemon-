import { useState, useEffect } from 'react';
import { TYPE_COLORS, TYPE_TRANSLATIONS, playPokemonCry } from '../services/pokemonService';
import './PokemonModal.css';

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad'
};

function PokemonModal({ pokemon, isInTeam, onToggleTeam, onSelectType, onClose }) {
  const [showShiny, setShowShiny] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Vincular con URL hash para enlace compartible (ej: #pokemon-25)
  useEffect(() => {
    if (pokemon) {
      window.history.replaceState(null, '', `#pokemon-${pokemon.id}`);
    }
    return () => {
      window.history.replaceState(null, '', window.location.pathname);
    };
  }, [pokemon]);

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

  const normalArtwork =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  const shinyArtwork =
    pokemon.sprites?.other?.['official-artwork']?.front_shiny ||
    pokemon.sprites?.front_shiny ||
    normalArtwork;

  const currentArtwork = showShiny ? shinyArtwork : normalArtwork;

  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;
  const heightMeters = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#pokemon-${pokemon.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTypeClick = (typeName) => {
    if (onSelectType) {
      onSelectType(typeName);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado con color temático */}
        <div
          className="modal-header"
          style={{
            background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}cc 100%)`
          }}
        >
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>

          <img
            src={currentArtwork}
            alt={pokemon.name}
            className="modal-artwork"
          />

          {/* Acciones del encabezado: Shiny, Sonido, Compartir */}
          <div className="modal-actions-bar">
            <button
              className={`modal-btn-action ${showShiny ? 'active' : ''}`}
              onClick={() => setShowShiny(!showShiny)}
              title="Alternar versión Shiny (Variocolor)"
            >
              ✨ {showShiny ? 'Normal' : 'Shiny'}
            </button>

            <button
              className="modal-btn-action"
              onClick={() => playPokemonCry(pokemon)}
              title="Reproducir grito del Pokémon"
            >
              🔊 Sonido
            </button>

            <button
              className="modal-btn-action"
              onClick={handleShare}
              title="Copiar enlace directo"
            >
              🔗 {copiedLink ? '¡Copiado!' : 'Compartir'}
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          <div className="modal-title-row">
            <span className="modal-id">{formattedId}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <h2 className="modal-name">{pokemon.name}</h2>
              {onToggleTeam && (
                <button
                  className={`team-toggle-icon-btn ${isInTeam ? 'in-team' : ''}`}
                  onClick={() => onToggleTeam(pokemon)}
                  title={isInTeam ? 'Quitar de mi equipo' : 'Agregar a mi equipo'}
                >
                  {isInTeam ? '⭐ En equipo' : '➕ Al equipo'}
                </button>
              )}
            </div>

            {/* Píldoras interactivas de tipo */}
            <div className="modal-types">
              {pokemon.types.map((t) => {
                const typeName = t.type.name;
                return (
                  <button
                    key={typeName}
                    type="button"
                    className="modal-type-btn"
                    style={{ backgroundColor: TYPE_COLORS[typeName] || '#94a3b8' }}
                    onClick={() => handleTypeClick(typeName)}
                    title={`Ver todos los Pokémon de tipo ${TYPE_TRANSLATIONS[typeName] || typeName}`}
                  >
                    {TYPE_TRANSLATIONS[typeName] || typeName}
                  </button>
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

          {/* Estadísticas Base con Barras */}
          <h3 className="modal-section-title">📊 Estadísticas Base</h3>
          <div className="stats-list">
            {pokemon.stats.map((s) => {
              const statName = s.stat.name;
              const val = s.base_stat;
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
