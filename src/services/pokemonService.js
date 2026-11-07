import axios from 'axios';

const BASE_URL = import.meta.env.VITE_POKEAPI_URL || 'https://pokeapi.co/api/v2';

// Caché en memoria para evitar peticiones redundantes
const detailsCache = new Map();

export const getPokemonList = async (limit = 20, offset = 0) => {
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

    // Guardar en memorias
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
