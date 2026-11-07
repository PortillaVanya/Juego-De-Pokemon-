import axios from 'axios';
import type {
  BattleMove,
  Generation,
  Pokemon,
  PokemonListResponse,
  PokemonListItem,
  PokemonTypeName,
  PokemonTypeResponse
} from '../types/pokemon';

const BASE_URL = import.meta.env.VITE_POKEAPI_URL || 'https://pokeapi.co/api/v2';

export const DEFAULT_BATCH_SIZE = 80;

/** Extrae el ID numérico del final de una URL de PokéAPI (ej: .../pokemon/25/ -> 25). */
export const getIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean);
  return Number.parseInt(parts[parts.length - 1], 10);
};

/** Normaliza cualquier error desconocido a un mensaje legible. */
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
};

/** Lista paginada de Pokémon. */
export const getPokemonList = async (
  limit: number = DEFAULT_BATCH_SIZE,
  offset = 0
): Promise<PokemonListItem[]> => {
  try {
    const { data } = await axios.get<PokemonListResponse>(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    return data.results;
  } catch (error) {
    throw new Error('Error al obtener la lista de datos: ' + getErrorMessage(error));
  }
};

/** Pokémon que pertenecen a un tipo elemental (fire, water, ...). */
export const getPokemonByType = async (typeName: string): Promise<PokemonListItem[]> => {
  const key = String(typeName).toLowerCase().trim();
  try {
    const { data } = await axios.get<PokemonTypeResponse>(`${BASE_URL}/type/${key}`);
    return data.pokemon.map((entry) => entry.pokemon);
  } catch (error) {
    throw new Error(`Error al obtener Pokémon de tipo ${typeName}: ${getErrorMessage(error)}`);
  }
};

/** Detalles completos de un Pokémon por nombre o ID. */
export const getPokemonDetails = async (nameOrId: string | number): Promise<Pokemon> => {
  const key = String(nameOrId).toLowerCase().trim();
  try {
    const { data } = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${key}`);
    return data;
  } catch (error) {
    throw new Error(`No se pudo obtener la información de "${nameOrId}": ${getErrorMessage(error)}`);
  }
};

/**
 * Resuelve el catálogo que debe mostrarse según el filtro de tipo y generación.
 * Centraliza la lógica que antes vivía dentro del useEffect de App.
 */
export const getPokemonCatalog = async (
  type: string,
  generation: string
): Promise<PokemonListItem[]> => {
  const genConfig = GENERATIONS.find((g) => g.id === generation);

  if (type !== 'all') {
    const typePokemons = await getPokemonByType(type);
    if (genConfig && genConfig.minId !== undefined && genConfig.maxId !== undefined) {
      return typePokemons.filter((item) => {
        const id = getIdFromUrl(item.url);
        return id >= (genConfig.minId as number) && id <= (genConfig.maxId as number);
      });
    }
    return typePokemons;
  }

  const limit = genConfig ? genConfig.limit : DEFAULT_BATCH_SIZE;
  const offset = genConfig ? genConfig.offset : 0;
  return getPokemonList(limit, offset);
};

/** Reproductor de gritos (cries) de un Pokémon. */
export const playPokemonCry = (pokemon: Pokemon | null | undefined): HTMLAudioElement | null => {
  const cryUrl = pokemon?.cries?.latest || pokemon?.cries?.legacy;
  if (!cryUrl) return null;
  try {
    const audio = new Audio(cryUrl);
    audio.volume = 0.45;
    void audio.play().catch(() => {});
    return audio;
  } catch {
    return null;
  }
};

/** Devuelve el sprite animado oficial (Gen 5 GIF) con fallback fluido a artwork o front_default */
export const getAnimatedSprite = (pokemon?: Pokemon | null, shiny = false): string => {
  if (!pokemon) return '';
  const gen5Animated = pokemon.sprites?.versions?.['generation-v']?.['black-white']?.animated;
  if (shiny && gen5Animated?.front_shiny) return gen5Animated.front_shiny;
  if (!shiny && gen5Animated?.front_default) return gen5Animated.front_default;

  // Fallbacks
  if (shiny) {
    return (
      pokemon.sprites?.other?.['official-artwork']?.front_shiny ||
      pokemon.sprites?.front_shiny ||
      pokemon.sprites?.front_default ||
      ''
    );
  }
  return (
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default ||
    ''
  );
};

/** Devuelve el sprite trasero animado para la vista del jugador en combate */
export const getBackSprite = (pokemon?: Pokemon | null, shiny = false): string => {
  if (!pokemon) return '';
  const gen5Animated = pokemon.sprites?.versions?.['generation-v']?.['black-white']?.animated;
  if (shiny && gen5Animated?.back_shiny) return gen5Animated.back_shiny;
  if (!shiny && gen5Animated?.back_default) return gen5Animated.back_default;

  if (shiny && pokemon.sprites?.back_shiny) return pokemon.sprites.back_shiny;
  if (pokemon.sprites?.back_default) return pokemon.sprites.back_default;

  return getAnimatedSprite(pokemon, shiny);
};

/** Sintetiza un efecto de sonido de impacto estilo videojuego retro usando Web Audio API */
export const playHitSound = (type = 'normal'): void => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'electric') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.22);
    } else if (type === 'fire') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.28);
    } else if (type === 'water') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    }

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Continuar si Web Audio no está disponible
  }
};

/** Genera movimientos icónicos de combate según los tipos elementales del Pokémon */
export const getPokemonMoves = (pokemon: Pokemon): BattleMove[] => {
  const typeMoves: Record<string, BattleMove[]> = {
    electric: [
      { name: 'Impactrueno', type: 'electric', power: 40, description: 'Lanza una descarga eléctrica moderada.' },
      { name: 'Rayo', type: 'electric', power: 90, description: 'Poderoso relámpago con alta potencia.' }
    ],
    fire: [
      { name: 'Ascuas', type: 'fire', power: 40, description: 'Lanza pequeñas llamas al oponente.' },
      { name: 'Lanzallamas', type: 'fire', power: 90, description: 'Ráfaga ardiente de fuego continuo.' }
    ],
    water: [
      { name: 'Pistola Agua', type: 'water', power: 40, description: 'Dispara un potente chorro de agua.' },
      { name: 'Hidrobomba', type: 'water', power: 110, description: 'Furia torrencial de agua masiva.' }
    ],
    grass: [
      { name: 'Látigo Cepa', type: 'grass', power: 45, description: 'Azota al enemigo con lianas flexibles.' },
      { name: 'Hoja Afilada', type: 'grass', power: 65, description: 'Cuchillas de hojas cortantes.' }
    ],
    poison: [
      { name: 'Picotazo Veneno', type: 'poison', power: 35, description: 'Ataque venenoso punzante.' },
      { name: 'Bomba Lodo', type: 'poison', power: 90, description: 'Lanza lodo tóxico con gran impacto.' }
    ],
    psychic: [
      { name: 'Confusión', type: 'psychic', power: 50, description: 'Onda mental desestabilizadora.' },
      { name: 'Psíquico', type: 'psychic', power: 90, description: 'Fuerza telequinética aplastante.' }
    ]
  };

  const normalMoves: BattleMove[] = [
    { name: 'Placaje', type: 'normal', power: 40, description: 'Embestida frontal de cuerpo entero.' },
    { name: 'Ataque Rápido', type: 'normal', power: 40, description: 'Velocidad cegadora antes de golpear.' }
  ];

  const primaryType = pokemon.types[0]?.type?.name || 'normal';
  const customList = typeMoves[primaryType] || [
    { name: 'Golpe Cabeza', type: 'normal', power: 70, description: 'Cabezazo contundente con fuerza.' },
    { name: 'Hipercolmillo', type: 'normal', power: 80, description: 'Mordisco feroz devastador.' }
  ];

  return [...customList, ...normalMoves].slice(0, 4);
};

export const GENERATIONS: Generation[] = [
  { id: 'all', name: 'Todas las Generaciones', offset: 0, limit: 80 },
  { id: 'gen1', name: 'Gen 1: Kanto (#1 - #151)', offset: 0, limit: 151, minId: 1, maxId: 151 },
  { id: 'gen2', name: 'Gen 2: Johto (#152 - #251)', offset: 151, limit: 100, minId: 152, maxId: 251 },
  { id: 'gen3', name: 'Gen 3: Hoenn (#252 - #386)', offset: 251, limit: 135, minId: 252, maxId: 386 },
  { id: 'gen4', name: 'Gen 4: Sinnoh (#387 - #493)', offset: 386, limit: 107, minId: 387, maxId: 493 },
  { id: 'gen5', name: 'Gen 5: Teselia (#494 - #649)', offset: 493, limit: 156, minId: 494, maxId: 649 },
  { id: 'gen6', name: 'Gen 6: Kalos (#650 - #721)', offset: 649, limit: 72, minId: 650, maxId: 721 },
  { id: 'gen7', name: 'Gen 7: Alola (#722 - #809)', offset: 721, limit: 88, minId: 722, maxId: 809 },
  { id: 'gen8', name: 'Gen 8: Galar (#810 - #905)', offset: 809, limit: 96, minId: 810, maxId: 905 },
  { id: 'gen9', name: 'Gen 9: Paldea (#906 - #1025)', offset: 905, limit: 120, minId: 906, maxId: 1025 }
];

export const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: '#919aa2',
  fire: '#ff9d55',
  water: '#5090d6',
  grass: '#63bc5a',
  electric: '#f4d23c',
  ice: '#73cec0',
  fighting: '#ce416b',
  poison: '#ab6ac8',
  ground: '#d97845',
  flying: '#89aae3',
  psychic: '#fa7179',
  bug: '#91c12f',
  rock: '#c5b78c',
  ghost: '#5269ad',
  dragon: '#0b6dc3',
  dark: '#5a5465',
  steel: '#5a8fa3',
  fairy: '#ec8fe6'
};

export const TYPE_ICONS: Record<PokemonTypeName, string> = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️',
  ground: '🏜️',
  flying: '🕊️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨'
};

export const TYPE_TRANSLATIONS: Record<PokemonTypeName, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  grass: 'Planta',
  electric: 'Eléctrico',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada'
};

/** Accesores seguros: la API devuelve `string`, así que caemos a un valor por defecto. */
export const getTypeColor = (type?: string): string =>
  (type && TYPE_COLORS[type as PokemonTypeName]) || '#94a3b8';

export const getTypeLabel = (type?: string): string =>
  (type && TYPE_TRANSLATIONS[type as PokemonTypeName]) || type || '';

export const getTypeIcon = (type?: string): string =>
  (type && TYPE_ICONS[type as PokemonTypeName]) || '•';
