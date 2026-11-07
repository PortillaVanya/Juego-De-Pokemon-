import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPokemonDetails,
  getAnimatedSprite,
  getBackSprite,
  playPokemonCry,
  playHitSound,
  getPokemonMoves,
  TYPE_COLORS
} from '../services/pokemonService';
import type { Pokemon, PokemonListItem, BattleMove, PokemonTypeName } from '../types/pokemon';
import './BattleArena.css';

export interface BattleArenaProps {
  playerPokemon: Pokemon;
  candidateList: PokemonListItem[];
  onClose: () => void;
}

function BattleArena({ playerPokemon, candidateList, onClose }: BattleArenaProps) {
  const [enemyPokemon, setEnemyPokemon] = useState<Pokemon | null>(null);
  const [loadingEnemy, setLoadingEnemy] = useState(true);

  // Estadísticas y Puntos de Salud
  const playerMaxHp = useMemo(() => {
    const baseHp = playerPokemon.stats[0]?.base_stat || 50;
    return baseHp * 2 + 30;
  }, [playerPokemon]);

  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [enemyMaxHp, setEnemyMaxHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);

  // Estados visuales de combate y VFX
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [isPlayerHurt, setIsPlayerHurt] = useState(false);
  const [isEnemyHurt, setIsEnemyHurt] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [damagePopup, setDamagePopup] = useState<{ target: 'player' | 'enemy'; amount: number } | null>(null);

  // Flujo del juego
  const [combatLog, setCombatLog] = useState(`¡Un Pokémon salvaje apareció! ¿Qué debería hacer ${playerPokemon.name}?`);
  const [isTurnLocked, setIsTurnLocked] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

  // Movimientos disponibles
  const playerMoves = useMemo(() => getPokemonMoves(playerPokemon), [playerPokemon]);

  // Iniciar una nueva batalla con un enemigo aleatorio
  const startNewBattle = useCallback(async () => {
    setLoadingEnemy(true);
    setWinner(null);
    setIsTurnLocked(false);
    setIsPlayerAttacking(false);
    setIsEnemyAttacking(false);
    setIsPlayerHurt(false);
    setIsEnemyHurt(false);
    setScreenShake(false);
    setDamagePopup(null);
    setPlayerHp(playerMaxHp);

    try {
      const candidates = candidateList.filter(
        (p) => p.name.toLowerCase() !== playerPokemon.name.toLowerCase()
      );
      const randomCandidate =
        candidates[Math.floor(Math.random() * candidates.length)] || {
          name: 'pikachu',
          url: ''
        };

      const enemyData = await getPokemonDetails(randomCandidate.name);
      setEnemyPokemon(enemyData);

      const baseHp = enemyData.stats[0]?.base_stat || 50;
      const calculatedMaxHp = baseHp * 2 + 30;
      setEnemyMaxHp(calculatedMaxHp);
      setEnemyHp(calculatedMaxHp);

      setCombatLog(`¡Un ${enemyData.name.toUpperCase()} salvaje apareció!`);
      playPokemonCry(enemyData);
    } catch (err) {
      console.error('Error al preparar oponente:', err);
    } finally {
      setLoadingEnemy(false);
    }
  }, [candidateList, playerPokemon, playerMaxHp]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void startNewBattle();
  }, [startNewBattle]);

  // Ataque del Enemigo (IA por turnos)
  const triggerEnemyTurn = useCallback((currentEnemy: Pokemon, remainingPlayerHp: number) => {
    setTimeout(() => {
      const moves = getPokemonMoves(currentEnemy);
      const chosenMove = moves[Math.floor(Math.random() * moves.length)] || {
        name: 'Placaje',
        type: 'normal',
        power: 40,
        description: ''
      };

      setCombatLog(`¡${currentEnemy.name} usó ${chosenMove.name}!`);
      setIsEnemyAttacking(true);
      playHitSound(chosenMove.type);

      setTimeout(() => {
        setIsEnemyAttacking(false);
        setIsPlayerHurt(true);
        setScreenShake(true);

        const enemyAttack = currentEnemy.stats[1]?.base_stat || 50;
        const playerDefense = playerPokemon.stats[2]?.base_stat || 50;
        const damage = Math.max(10, Math.round((chosenMove.power * (enemyAttack / playerDefense)) * 0.45));

        setDamagePopup({ target: 'player', amount: damage });
        const nextPlayerHp = Math.max(0, remainingPlayerHp - damage);
        setPlayerHp(nextPlayerHp);

        setTimeout(() => {
          setIsPlayerHurt(false);
          setScreenShake(false);
          setDamagePopup(null);

          if (nextPlayerHp <= 0) {
            setWinner('enemy');
            setCombatLog(`¡${playerPokemon.name} se debilitó! ¡Has perdido el combate!`);
          } else {
            setIsTurnLocked(false);
            setCombatLog(`¿Qué debería hacer ${playerPokemon.name}?`);
          }
        }, 500);
      }, 350);
    }, 1000);
  }, [playerPokemon]);

  // Ataque del Jugador
  const handlePlayerAttack = (move: BattleMove) => {
    if (isTurnLocked || !enemyPokemon || winner) return;

    setIsTurnLocked(true);
    setCombatLog(`¡${playerPokemon.name} usó ${move.name}!`);
    setIsPlayerAttacking(true);
    playHitSound(move.type);

    setTimeout(() => {
      setIsPlayerAttacking(false);
      setIsEnemyHurt(true);
      setScreenShake(true);

      const playerAttack = playerPokemon.stats[1]?.base_stat || 50;
      const enemyDefense = enemyPokemon.stats[2]?.base_stat || 50;
      const damage = Math.max(12, Math.round((move.power * (playerAttack / enemyDefense)) * 0.55));

      setDamagePopup({ target: 'enemy', amount: damage });
      const nextEnemyHp = Math.max(0, enemyHp - damage);
      setEnemyHp(nextEnemyHp);

      setTimeout(() => {
        setIsEnemyHurt(false);
        setScreenShake(false);
        setDamagePopup(null);

        if (nextEnemyHp <= 0) {
          setWinner('player');
          setCombatLog(`¡${enemyPokemon.name} enemigo se debilitó! 🎉 ¡Victoria magistral!`);
          playPokemonCry(playerPokemon);
        } else {
          setCombatLog(`¡El impacto fue efectivo! Ahora es el turno de ${enemyPokemon.name}...`);
          triggerEnemyTurn(enemyPokemon, playerHp);
        }
      }, 500);
    }, 350);
  };

  const playerHpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
  const enemyHpPct = Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100));

  const getHpColor = (pct: number) => {
    if (pct > 50) return '#22c55e';
    if (pct > 20) return '#eab308';
    return '#ef4444';
  };

  const enemySprite = getAnimatedSprite(enemyPokemon);
  const playerSprite = getBackSprite(playerPokemon);

  return (
    <div className="battle-backdrop" onClick={onClose}>
      <div className="battle-arena-container" onClick={(e) => e.stopPropagation()}>
        {/* Barra superior */}
        <div className="battle-header">
          <h2 className="battle-header-title">
            <span>⚔️</span> Arena de Batalla Pokémon
          </h2>
          <button className="battle-close-btn" onClick={onClose} aria-label="Salir de la arena">
            ✕
          </button>
        </div>

        {/* Escenario de combate */}
        <div className={`battle-stage ${screenShake ? 'screen-shake' : ''}`}>
          {loadingEnemy ? (
            <div style={{ color: '#ffffff', textAlign: 'center', marginTop: '120px', fontWeight: 'bold' }}>
              ⏳ Buscando oponente salvaje...
            </div>
          ) : (
            <>
              {/* Zona del Enemigo (Arriba) */}
              <div className="enemy-zone">
                <div className="battle-hud">
                  <div className="hud-name-row">
                    <span className="hud-name">{enemyPokemon?.name}</span>
                    <span className="hud-lvl">Nv. 50</span>
                  </div>
                  <div className="hp-bar-container">
                    <span className="hp-tag">PS</span>
                    <div className="hp-bar-track">
                      <div
                        className="hp-bar-fill"
                        style={{
                          width: `${enemyHpPct}%`,
                          backgroundColor: getHpColor(enemyHpPct)
                        }}
                      />
                    </div>
                  </div>
                  <div className="hud-hp-numbers">
                    {enemyHp} / {enemyMaxHp}
                  </div>
                </div>

                <div className="pokemon-platform">
                  <div className="platform-ground" />
                  {damagePopup?.target === 'enemy' && (
                    <span className="damage-floating">-{damagePopup.amount}</span>
                  )}
                  {enemySprite && (
                    <img
                      src={enemySprite}
                      alt={enemyPokemon?.name}
                      className={`battle-sprite ${isEnemyAttacking ? 'enemy-attacking' : ''} ${
                        isEnemyHurt ? 'hit-flash' : ''
                      } ${winner === 'player' ? 'fainted' : ''}`}
                    />
                  )}
                </div>
              </div>

              {/* Zona del Jugador (Abajo) */}
              <div className="player-zone">
                <div className="pokemon-platform">
                  <div className="platform-ground" />
                  {damagePopup?.target === 'player' && (
                    <span className="damage-floating">-{damagePopup.amount}</span>
                  )}
                  {playerSprite && (
                    <img
                      src={playerSprite}
                      alt={playerPokemon.name}
                      className={`battle-sprite ${isPlayerAttacking ? 'player-attacking' : ''} ${
                        isPlayerHurt ? 'hit-flash' : ''
                      } ${winner === 'enemy' ? 'fainted' : ''}`}
                    />
                  )}
                </div>

                <div className="battle-hud">
                  <div className="hud-name-row">
                    <span className="hud-name">{playerPokemon.name}</span>
                    <span className="hud-lvl">Nv. 50</span>
                  </div>
                  <div className="hp-bar-container">
                    <span className="hp-tag">PS</span>
                    <div className="hp-bar-track">
                      <div
                        className="hp-bar-fill"
                        style={{
                          width: `${playerHpPct}%`,
                          backgroundColor: getHpColor(playerHpPct)
                        }}
                      />
                    </div>
                  </div>
                  <div className="hud-hp-numbers">
                    {playerHp} / {playerMaxHp}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Caja de diálogo y controles de ataque */}
        <div className="battle-dialogue-box">
          <p className="battle-log-text">{combatLog}</p>

          {!winner ? (
            <div className="moves-grid">
              {playerMoves.map((m) => {
                const moveColor = TYPE_COLORS[m.type as PokemonTypeName] || '#3b82f6';
                return (
                  <button
                    key={m.name}
                    type="button"
                    className="move-btn"
                    style={{ backgroundColor: moveColor }}
                    disabled={isTurnLocked}
                    onClick={() => handlePlayerAttack(m)}
                    title={m.description}
                  >
                    <span className="move-name">{m.name}</span>
                    <span className="move-power">Pot. {m.power}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="battle-action-row">
              <button type="button" className="battle-again-btn" onClick={startNewBattle}>
                🔄 Siguiente Batalla
              </button>
              <button
                type="button"
                className="clear-team-btn"
                style={{ padding: '12px 20px', fontSize: '15px' }}
                onClick={onClose}
              >
                Cerrar Arena
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BattleArena;
