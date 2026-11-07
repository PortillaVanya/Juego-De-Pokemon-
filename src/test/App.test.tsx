import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// We test a simple rendering scenario
describe('App Component', () => {
  it('debería renderizar el título de la aplicación', async () => {
    // Import dynamically so mocks apply
    const { default: App } = await import('../App');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Pokédex Pro')).toBeInTheDocument();
  });

  it('debería renderizar el campo de búsqueda', async () => {
    const { default: App } = await import('../App');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon por nombre...');
    expect(searchInput).toBeInTheDocument();
  });

  it('debería renderizar los botones de tipo', async () => {
    const { default: App } = await import('../App');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Todos/i)).toBeInTheDocument();
  });
});
