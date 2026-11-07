import axios from 'axios';

const BASE_URL = import.meta.env.VITE_POKEAPI_URL || 'https://pokeapi.co/api/v2';

// Caché en memoria para evitar peticiones redundantes
const detailsCache = new Map();

export const getPokemonList = async (limit = 40, offset = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    return response.data.results;
  } catch (error) {
    throw new Error('Error al obtener la lista de datos: ' + error.message);
  }
};

export const getPokemonDetails = async (nameOrId) => {
  const key = String(nameOrId).toLowerCase().trim();

  // 1. Verificar si está en memoria
  if (detailsCache.has(key)) {
    return detailsCache.get(key);
  }

  // 2. Verificar si está en localStorage (persistencia offline)
  try {
    const localCached = localStorage.getItem(`poke_cache_${key}`);
    if (localCached) {
      const parsed = JSON.parse(localCached);
      detailsCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // Continuar si localStorage no está disponible
  }

  // 3. Petición HTTP a la PokéAPI
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${key}`);
    const data = response.data;

    // Guardar en cachés
    detailsCache.set(key, data);
    try {
      localStorage.setItem(`poke_cache_${key}`, JSON.stringify(data));
    } catch {
      // Ignorar cuota de localStorage excedida
    }

    return data;
  } catch (error) {
    throw new Error(`No se pudo obtener la información de "${nameOrId}": ${error.message}`);
  }
};

// Reproductor de gritos (cries)
export const playPokemonCry = (pokemon) => {
  const cryUrl = pokemon?.cries?.latest || pokemon?.cries?.legacy;
  if (!cryUrl) return null;
  try {
    const audio = new Audio(cryUrl);
    audio.volume = 0.45;
    audio.play().catch(() => {});
    return audio;
  } catch {
    return null;
  }
};

export const GENERATIONS = [
  { id: 'all', name: 'Todas las Generaciones', offset: 0, limit: 40 },
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

export const TYPE_COLORS = {
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

export const TYPE_TRANSLATIONS = {
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
