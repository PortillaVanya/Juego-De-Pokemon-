import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import { getPokemonList } from './pokemonService';

describe('pokemonService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devuelve la lista paginada de Pokémon', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }] }
    });

    await expect(getPokemonList(1, 0)).resolves.toEqual([
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }
    ]);
  });

  it('lanza un error legible cuando falla la red', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

    await expect(getPokemonList()).rejects.toThrow(
      'Error al obtener la lista de datos: Network Error'
    );
  });
});
