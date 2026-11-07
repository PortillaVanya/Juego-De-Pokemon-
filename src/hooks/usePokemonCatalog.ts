import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPokemonCatalog, getPokemonList, DEFAULT_BATCH_SIZE } from '../services/pokemonService';
import type { PokemonListItem } from '../types/pokemon';

export interface UsePokemonCatalogResult {
  list: PokemonListItem[];
  loading: boolean;
  loadingMore: boolean;
  canLoadMore: boolean;
  loadMore: () => Promise<void>;
  error: Error | null;
}

/**
 * Función utilitaria para fusionar dos listas de Pokémon garantizando NO DUPLICADOS
 */
export const mergeUniquePokemonList = (
  currentList: PokemonListItem[],
  newPokemons: PokemonListItem[]
): PokemonListItem[] => {
  const existingNames = new Set(currentList.map((p) => p.name.toLowerCase()));
  const unique = newPokemons.filter((p) => !existingNames.has(p.name.toLowerCase()));
  return [...currentList, ...unique];
};

/**
 * Carga el catálogo según el filtro de tipo y generación.
 * Maneja lotes iniciales de 80 Pokémon y paginación continua de 80 en 80
 * sin repetir ningún Pokémon previo.
 */
export function usePokemonCatalog(type: string, generation: string): UsePokemonCatalogResult {
  const [filterKey, setFilterKey] = useState<string>(`${type}-${generation}`);
  const [extraItems, setExtraItems] = useState<PokemonListItem[]>([]);
  const [offset, setOffset] = useState<number>(DEFAULT_BATCH_SIZE);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Reiniciar estado acumulado si cambia el filtro sin activar renders en cascada
  const currentKey = `${type}-${generation}`;
  if (filterKey !== currentKey) {
    setFilterKey(currentKey);
    setExtraItems([]);
    setOffset(DEFAULT_BATCH_SIZE);
  }

  const { data, isPending, error } = useQuery({
    queryKey: ['catalog', type, generation],
    queryFn: () => getPokemonCatalog(type, generation)
  });

  const baseList = useMemo(() => data ?? [], [data]);

  // Lista combinada y sin duplicados
  const combinedList = useMemo(() => {
    return mergeUniquePokemonList(baseList, extraItems);
  }, [baseList, extraItems]);

  const canLoadMore = type === 'all' && generation === 'all';

  const loadMore = useCallback(async () => {
    if (!canLoadMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextBatch = await getPokemonList(DEFAULT_BATCH_SIZE, offset);
      setExtraItems((prev) => mergeUniquePokemonList(prev, nextBatch));
      setOffset((prevOffset) => prevOffset + DEFAULT_BATCH_SIZE);
    } catch (err) {
      console.error('Error al cargar más Pokémon:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [canLoadMore, loadingMore, offset]);

  return {
    list: combinedList,
    loading: isPending,
    loadingMore,
    canLoadMore,
    loadMore,
    error: error ?? null
  };
}
