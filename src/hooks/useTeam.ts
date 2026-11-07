import { useState, useEffect, useCallback } from 'react';
import type { Pokemon } from '../types/pokemon';

const MAX_TEAM_SIZE = 6;
const STORAGE_KEY = 'pokedex_team';

interface UseTeamReturn {
  team: Pokemon[];
  isInTeam: (pokemonName: string) => boolean;
  toggleTeamMember: (pokemon: Pokemon) => string;
  removeMember: (pokemonName: string) => void;
  clearTeam: () => void;
}

export function useTeam(): UseTeamReturn {
  const [team, setTeam] = useState<Pokemon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    } catch {
      // Ignorar errores de storage
    }
  }, [team]);

  const isInTeam = useCallback(
    (pokemonName: string): boolean =>
      team.some((p) => p.name.toLowerCase() === pokemonName.toLowerCase()),
    [team]
  );

  const toggleTeamMember = useCallback(
    (pokemon: Pokemon): string => {
      const alreadyIn = team.some(
        (p) => p.name.toLowerCase() === pokemon.name.toLowerCase()
      );

      if (alreadyIn) {
        setTeam((prev) =>
          prev.filter((p) => p.name.toLowerCase() !== pokemon.name.toLowerCase())
        );
        return `⭐ ${pokemon.name} eliminado de tu equipo.`;
      }

      if (team.length >= MAX_TEAM_SIZE) {
        return '⚠️ Tu equipo ya tiene 6 Pokémon (límite máximo).';
      }

      setTeam((prev) => [...prev, pokemon]);
      return `🎒 ¡${pokemon.name} agregado a tu equipo!`;
    },
    [team]
  );

  const removeMember = useCallback((pokemonName: string) => {
    setTeam((prev) =>
      prev.filter((p) => p.name.toLowerCase() !== pokemonName.toLowerCase())
    );
  }, []);

  const clearTeam = useCallback(() => {
    setTeam([]);
  }, []);

  return { team, isInTeam, toggleTeamMember, removeMember, clearTeam };
}
