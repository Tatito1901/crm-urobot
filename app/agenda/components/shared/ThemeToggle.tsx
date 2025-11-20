/**
 * ============================================================
 * THEME TOGGLE - Con next-themes
 * ============================================================
 * Toggle profesional con soporte SSR perfecto
 */

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitar hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Skeleton mientras carga
    return (
      <div className="p-2 rounded-lg border border-slate-700 w-10 h-10" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-800 transition-colors"
      title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-slate-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
};
