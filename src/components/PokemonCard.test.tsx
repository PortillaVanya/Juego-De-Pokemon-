import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getPokemonDetails } from '../services/pokemonService';
import type { Pokemon } from '../types/pokemon';
import PokemonCard from './PokemonCard';

vi.mock('../services/pokemonService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/pokemonService')>();
  return { ...actual, getPokemonDetails: vi.fn() };
});

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

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

const baseProps = {
  pokemonName: 'pikachu',
  isInTeam: false,
  selectedType: 'all',
  onSelectType: vi.fn(),
  onToggleTeam: vi.fn(),
  onSelect: vi.fn()
};

describe('PokemonCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de "Cargando" (skeleton) mientras llegan los datos', () => {
    // Promesa que nunca se resuelve: la tarjeta debe quedarse en estado de carga.
    vi.mocked(getPokemonDetails).mockReturnValue(new Promise<Pokemon>(() => {}));

    renderWithClient(<PokemonCard {...baseProps} />);

    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('renderiza la información del Pokémon cuando la petición termina', async () => {
    vi.mocked(getPokemonDetails).mockResolvedValue(makePokemon('pikachu', 25));

    renderWithClient(<PokemonCard {...baseProps} />);

    expect(await screen.findByText('pikachu')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton-card')).not.toBeInTheDocument();
  });
});
