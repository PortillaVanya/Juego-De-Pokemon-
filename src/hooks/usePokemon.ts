import { useQuery } from '@tanstack/react-query';
import { getPokemonDetails } from '../services/pokemonService';
import type { Pokemon } from '../types/pokemon';

export interface UsePokemonResult {
  pokemon: Pokemon | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook reutilizable que encapsula la carga de un Pokémon.
 * Toda la lógica de red, caché y estados vive aquí (React Query),
 * así los componentes quedan limpios: `const { pokemon, loading } = usePokemon(name)`.
 */
export function usePokemon(nameOrId?: string | number | null): UsePokemonResult {
  const enabled = nameOrId !== undefined && nameOrId !== null && nameOrId !== '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['pokemon', String(nameOrId).toLowerCase()],
    queryFn: () => getPokemonDetails(nameOrId as string | number),
    enabled
  });

  return {
    pokemon: data ?? null,
    loading: enabled && isLoading,
    error: error ?? null
  };
}
