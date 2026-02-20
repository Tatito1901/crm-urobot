'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-800/40 border border-slate-700 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
          theme === 'light'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
        }`}
        title="Modo claro"
      >
        <Sun className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Claro</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
          theme === 'dark'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
        }`}
        title="Modo oscuro"
      >
        <Moon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Oscuro</span>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
          theme === 'system'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
        }`}
        title="Tema del sistema"
      >
        <span className="h-3.5 w-3.5 font-bold">A</span>
        <span className="hidden sm:inline">Auto</span>
      </button>
    </div>
  );
}
