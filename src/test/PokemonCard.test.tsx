import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PokemonCardUI from '../components/PokemonCardUI';
import type { Pokemon } from '../types/pokemon';

const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  sprites: {
    front_default: 'https://example.com/pikachu.png',
    front_shiny: null,
    back_default: null,
    back_shiny: null,
    other: {
      'official-artwork': {
        front_default: 'https://example.com/pikachu-artwork.png',
        front_shiny: null,
      },
    },
  },
  types: [
    { slot: 1, type: { name: 'electric', url: '' } },
  ],
  stats: [
    { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
  ],
  abilities: [
    { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
  ],
};

describe('PokemonCardUI', () => {
  const defaultProps = {
    pokemon: mockPokemon,
    isInTeam: false,
    selectedType: 'all',
    onSelectType: vi.fn(),
    onToggleTeam: vi.fn(),
    onPlayCry: vi.fn(),
    onSelect: vi.fn(),
  };

  it('debería renderizar correctamente el nombre del Pokémon', () => {
    render(<PokemonCardUI {...defaultProps} />);
    expect(screen.getByText('pikachu')).toBeInTheDocument();
  });

  it('debería mostrar el número de Pokédex con formato correcto', () => {
    render(<PokemonCardUI {...defaultProps} />);
    expect(screen.getByText('#025')).toBeInTheDocument();
  });

  it('debería mostrar las estadísticas HP y ATQ', () => {
    render(<PokemonCardUI {...defaultProps} />);
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  it('debería renderizar las píldoras de tipo', () => {
    render(<PokemonCardUI {...defaultProps} />);
    expect(screen.getByText('Eléctrico')).toBeInTheDocument();
  });

  it('debería mostrar la imagen del Pokémon', () => {
    render(<PokemonCardUI {...defaultProps} />);
    const img = screen.getByAltText('pikachu');
    expect(img).toBeInTheDocument();
  });

  it('no debería renderizar nada si no recibe datos del Pokémon', () => {
    const { container } = render(<PokemonCardUI {...defaultProps} pokemon={null as any} />);
    expect(container.innerHTML).toBe('');
  });
});
