import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pokedex_theme';

interface UseThemeReturn {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function useTheme(): UseThemeReturn {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'dark';
  });

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return { darkMode, toggleDarkMode };
}
