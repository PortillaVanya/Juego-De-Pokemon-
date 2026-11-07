import { useQuery } from '@tanstack/react-query';
import { getPokemonCatalog } from '../services/pokemonService';
import type { PokemonListItem } from '../types/pokemon';

export interface UsePokemonCatalogResult {
  list: PokemonListItem[];
  loading: boolean;
  error: Error | null;
}

/**
 * Carga el catálogo según el filtro de tipo y generación.
 * React Query cachea cada combinación: al volver a un filtro ya visitado
 * los datos aparecen al instante sin repetir la petición.
 */
export function usePokemonCatalog(type: string, generation: string): UsePokemonCatalogResult {
  const { data, isPending, error } = useQuery({
    queryKey: ['catalog', type, generation],
    queryFn: () => getPokemonCatalog(type, generation)
  });

  return {
    list: data ?? [],
    loading: isPending,
    error: error ?? null
  };
}
