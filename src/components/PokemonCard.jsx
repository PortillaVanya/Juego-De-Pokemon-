import { useState, useEffect } from 'react';
import { getPokemonDetails, playPokemonCry } from '../services/pokemonService';
import PokemonCardUI from './PokemonCardUI';
import SkeletonCard from './SkeletonCard';

/**
 * Componente "Inteligente" (Container / Lógica):
 * Encapsula la gestión de red con PokéAPI, el estado local de carga,
 * y delega el renderizado visual al componente presentacional PokemonCardUI.
 */
function PokemonCard({
  pokemonName,
  isInTeam,
  onToggleTeam,
  onSelect,
  onLoadedDetails
}) {
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
        console.error(`Error al cargar ${pokemonName}:`, err);
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
  }, [pokemonName, onLoadedDetails]);

  if (loading) {
    return <SkeletonCard />;
  }

  if (!pokemon) return null;

  return (
    <PokemonCardUI
      pokemon={pokemon}
      isInTeam={isInTeam}
      onToggleTeam={onToggleTeam}
      onPlayCry={playPokemonCry}
      onSelect={onSelect}
    />
  );
}

export default PokemonCard;
