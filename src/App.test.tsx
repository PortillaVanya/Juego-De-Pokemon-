import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getPokemonCatalog, getPokemonDetails } from './services/pokemonService';
import type { Pokemon, PokemonListItem } from './types/pokemon';
import App from './App';

vi.mock('./services/pokemonService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/pokemonService')>();
  return { ...actual, getPokemonCatalog: vi.fn(), getPokemonDetails: vi.fn() };
});

const CATALOG: PokemonListItem[] = [
  { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
  { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }
];

const makePokemon = (name: string, id: number): Pokemon => ({
  id,
  name,
  height: 4,
  weight: 60,
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  stats: [
    { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } }
  ],
  abilities: [],
  sprites: { front_default: null, front_shiny: null }
});

const renderApp = (ui: ReactElement = <App />) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    vi.mocked(getPokemonCatalog).mockResolvedValue(CATALOG);
    vi.mocked(getPokemonDetails).mockImplementation((nameOrId) => {
      const name = String(nameOrId).toLowerCase();
      return Promise.resolve(makePokemon(name, name === 'pikachu' ? 25 : 1));
    });
  });

  it('filtra la lista al buscar "pikachu" en el buscador', async () => {
    renderApp();

    // Espera a que se rendericen ambas tarjetas
    expect(await screen.findByText('pikachu')).toBeInTheDocument();
    expect(await screen.findByText('bulbasaur')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Buscar Pokémon por nombre'), 'pikachu');

    // Tras el debounce, solo debe quedar Pikachu
    await waitFor(
      () => {
        expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    expect(screen.getByText('pikachu')).toBeInTheDocument();
  });

  it('muestra un mensaje de error cuando falla la petición de red', async () => {
    vi.mocked(getPokemonCatalog).mockRejectedValue(
      new Error('Error al obtener la lista de datos: Network Error')
    );

    renderApp();

    expect(
      await screen.findByText(/Error al obtener la lista de datos: Network Error/i)
    ).toBeInTheDocument();
  });
});
