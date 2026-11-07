import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getPokemonList, getPokemonDetails, getPokemonByType } from '../services/pokemonService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('pokemonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPokemonList', () => {
    it('debería retornar la lista de Pokémon desde la API', async () => {
      const mockResults = [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: { results: mockResults } });

      const result = await getPokemonList(2, 0);
      expect(result).toEqual(mockResults);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar un error si la petición falla', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(getPokemonList()).rejects.toThrow('Error al obtener la lista de datos');
    });
  });

  describe('getPokemonDetails', () => {
    it('debería retornar los detalles de un Pokémon', async () => {
      const mockPokemon = {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        sprites: { front_default: 'url' },
        types: [{ slot: 1, type: { name: 'electric', url: '' } }],
        stats: [{ base_stat: 35, stat: { name: 'hp' } }],
        abilities: [],
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPokemon });

      const result = await getPokemonDetails('pikachu');
      expect(result.name).toBe('pikachu');
      expect(result.id).toBe(25);
    });

    it('debería lanzar un error si el Pokémon no existe', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Not Found'));

      await expect(getPokemonDetails('fakemon')).rejects.toThrow(
        'No se pudo obtener la información de "fakemon"',
      );
    });
  });

  describe('getPokemonByType', () => {
    it('debería retornar la lista de Pokémon de un tipo específico', async () => {
      const mockTypeData = {
        pokemon: [
          { slot: 1, pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
          { slot: 1, pokemon: { name: 'vulpix', url: 'https://pokeapi.co/api/v2/pokemon/37/' } },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockTypeData });

      const result = await getPokemonByType('fire');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('charmander');
    });
  });
});
