import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

// Cliente global de React Query: caché, deduplicación y reintentos por nosotros.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min: los datos se consideran frescos
      gcTime: 1000 * 60 * 30, // 30 min en memoria
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
