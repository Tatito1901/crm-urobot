/**
 * ============================================================
 * THEME TOGGLE - Componente reutilizable para toda la app
 * ============================================================
 * Botón de tema que funciona en cualquier parte del CRM
 */

'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitar hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-lg p-2 border border-slate-700 dark:border-slate-600 w-10 h-10"
        disabled
      >
        <span className="sr-only">Cargando tema...</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex items-center justify-center rounded-lg p-2 border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
      title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-slate-700 dark:text-slate-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700" />
      )}
      <span className="sr-only">
        {theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      </span>
    </button>
  );
}
