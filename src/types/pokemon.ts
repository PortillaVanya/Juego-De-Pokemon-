// Sprite structures
export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
  versions?: {
    'generation-v'?: {
      'black-white'?: {
        animated?: {
          front_default: string | null;
          front_shiny: string | null;
          back_default?: string | null;
          back_shiny?: string | null;
        };
      };
    };
  };
}

// Cries (sounds)
export interface PokemonCries {
  latest: string | null;
  legacy: string | null;
}

// Type slot
export interface PokemonTypeSlot {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

// Stat
export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

// Ability
export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

// Full Pokemon details
export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  cries?: PokemonCries;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
}

// List item from /pokemon endpoint
export interface PokemonListItem {
  name: string;
  url: string;
}

// API list response
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

// Type endpoint response item
export interface TypePokemonEntry {
  slot: number;
  pokemon: PokemonListItem;
}

// Type endpoint response
export interface PokemonTypeResponse {
  pokemon: TypePokemonEntry[];
}

// Generation config
export interface GenerationConfig {
  id: string;
  name: string;
  offset: number;
  limit: number;
  minId?: number;
  maxId?: number;
}

export type Generation = GenerationConfig;

// Type color and translation maps
export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'dark' | 'steel' | 'fairy';

// Sort options
export type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'hp-desc' | 'attack-desc';

// Battle move interface
export interface BattleMove {
  name: string;
  type: PokemonTypeName;
  power: number;
  description: string;
}
