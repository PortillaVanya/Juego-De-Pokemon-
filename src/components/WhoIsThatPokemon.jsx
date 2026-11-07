import { useState, useEffect } from 'react';
import { getPokemonDetails, playPokemonCry } from '../services/pokemonService';
import './WhoIsThatPokemon.css';

function WhoIsThatPokemon({ candidateList, onClose }) {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const startNewRound = async () => {
    if (!candidateList || candidateList.length < 4) return;

    setLoading(true);
    setRevealed(false);
    setSelectedOption(null);

    // Seleccionar 4 pokémon aleatorios
    const shuffled = [...candidateList].sort(() => 0.5 - Math.random());
    const roundOptions = shuffled.slice(0, 4);
    const target = roundOptions[Math.floor(Math.random() * roundOptions.length)];

    try {
      const details = await getPokemonDetails(target.name);
      setCurrentPokemon(details);
      setOptions(roundOptions.map((o) => o.name));
    } catch (err) {
      console.error('Error cargando ronda del minijuego:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewRound();
  }, [candidateList]);

  const handleGuess = (guessedName) => {
    if (revealed || !currentPokemon) return;

    setSelectedOption(guessedName);
    setRevealed(true);

    if (guessedName.toLowerCase() === currentPokemon.name.toLowerCase()) {
      setStreak((prev) => prev + 1);
      playPokemonCry(currentPokemon);
    } else {
      setStreak(0);
    }
  };

  if (!candidateList || candidateList.length < 4) {
    return (
      <div className="minigame-backdrop" onClick={onClose}>
        <div className="minigame-modal" onClick={(e) => e.stopPropagation()}>
          <p>Carga más Pokémon en el catálogo para iniciar el minijuego.</p>
          <button className="next-game-btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const artwork =
    currentPokemon?.sprites?.other?.['official-artwork']?.front_default ||
    currentPokemon?.sprites?.front_default;

  const isCorrect =
    selectedOption &&
    currentPokemon &&
    selectedOption.toLowerCase() === currentPokemon.name.toLowerCase();

  return (
    <div className="minigame-backdrop" onClick={onClose}>
      <div className="minigame-modal" onClick={(e) => e.stopPropagation()}>
        <div className="minigame-header">
          <h2 className="minigame-title">❓ ¿Quién es este Pokémon?</h2>
          <span className="streak-badge">🔥 Racha: {streak}</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0' }}>⏳ Preparando Pokémon misterioso...</div>
        ) : (
          <>
            <div className="silhouette-box">
              {artwork && (
                <img
                  src={artwork}
                  alt="Pokémon misterioso"
                  className={`pokemon-silhouette ${revealed ? 'revealed' : 'hidden'}`}
                />
              )}
            </div>

            <p className="minigame-question">
              {revealed
                ? `¡Es ${currentPokemon?.name.toUpperCase()}!`
                : '¿Puedes adivinar su nombre?'}
            </p>

            <div className="options-grid">
              {options.map((optName) => {
                let btnClass = 'option-btn';
                if (revealed) {
                  if (optName.toLowerCase() === currentPokemon.name.toLowerCase()) {
                    btnClass += ' correct';
                  } else if (optName === selectedOption) {
                    btnClass += ' wrong';
                  }
                }

                return (
                  <button
                    key={optName}
                    className={btnClass}
                    onClick={() => handleGuess(optName)}
                    disabled={revealed}
                  >
                    {optName}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div>
                <p className={`minigame-result ${isCorrect ? 'success' : 'failure'}`}>
                  {isCorrect
                    ? '🎉 ¡Excelente! ¡Has acertado!'
                    : `❌ ¡Fallaste! Era ${currentPokemon.name}.`}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button className="next-game-btn" onClick={startNewRound}>
                    Siguiente Pokémon ➔
                  </button>
                  <button
                    className="clear-team-btn"
                    style={{ padding: '12px 20px', fontSize: '14px' }}
                    onClick={onClose}
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WhoIsThatPokemon;
