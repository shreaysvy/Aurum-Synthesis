import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
const KEY = 'aurum_theme';

function apply(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try { return (localStorage.getItem(KEY) as ThemeMode) || 'system'; } catch { return 'system'; }
  });

  useEffect(() => {
    apply(mode);
    try { localStorage.setItem(KEY, mode); } catch { /* private mode */ }
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => (m === 'system' ? 'light' : m === 'light' ? 'dark' : 'system'));
  }, []);

  return { mode, setMode, cycle };
}
