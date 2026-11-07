import { useEffect, useState } from 'react';

/**
 * Retrasa la propagación de un valor hasta que deje de cambiar durante `delay` ms.
 * Se usa en el buscador para no filtrar/refetch en cada tecla.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
