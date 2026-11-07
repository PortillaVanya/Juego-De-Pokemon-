import { memo, useEffect } from 'react';
import { playPokemonCry } from '../services/pokemonService';
import { usePokemon } from '../hooks/usePokemon';
import type { Pokemon } from '../types/pokemon';
import PokemonCardUI from './PokemonCardUI';
import SkeletonCard from './SkeletonCard';

export interface PokemonCardProps {
  pokemonName: string;
  isInTeam: boolean;
  selectedType: string;
  onSelectType: (typeName: string) => void;
  onToggleTeam: (pokemon: Pokemon) => void;
  onSelect: (pokemon: Pokemon) => void;
  onLoadedDetails?: (pokemon: Pokemon) => void;
}

/**
 * Componente contenedor: obtiene los datos mediante `usePokemon` (React Query)
 * y delega el renderizado a PokemonCardUI.
 *
 * `memo` evita re-renderizar las tarjetas cuyas props no cambiaron
 * (por ejemplo, al escribir en el buscador, solo cambian las que entran/salen).
 */
function PokemonCard({
  pokemonName,
  isInTeam,
  selectedType,
  onSelectType,
  onToggleTeam,
  onSelect,
  onLoadedDetails
}: PokemonCardProps) {
  const { pokemon, loading } = usePokemon(pokemonName);

  useEffect(() => {
    if (pokemon && onLoadedDetails) {
      onLoadedDetails(pokemon);
    }
  }, [pokemon, onLoadedDetails]);

  if (loading) {
    return <SkeletonCard />;
  }

  if (!pokemon) return null;

  return (
    <PokemonCardUI
      pokemon={pokemon}
      isInTeam={isInTeam}
      selectedType={selectedType}
      onSelectType={onSelectType}
      onToggleTeam={onToggleTeam}
      onPlayCry={playPokemonCry}
      onSelect={onSelect}
    />
  );
}

export default memo(PokemonCard);
