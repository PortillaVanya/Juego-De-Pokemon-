import { useState, useEffect } from 'react';
import { getPokemonDetails } from '../services/pokemonService';
import type { Pokemon } from '../types/pokemon';

interface UsePokemonDetailsReturn {
  pokemon: Pokemon | null;
  loading: boolean;
  error: string | null;
}

export function usePokemonDetails(nameOrId: string): UsePokemonDetailsReturn {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPokemonDetails(nameOrId);
        if (isMounted) {
          setPokemon(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : `Error al cargar ${nameOrId}`);
        }
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
  }, [nameOrId]);

  return { pokemon, loading, error };
}
