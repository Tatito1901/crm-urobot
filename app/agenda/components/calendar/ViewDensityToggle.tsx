/**
 * ============================================================
 * VIEW DENSITY TOGGLE - Selector de densidad de vista
 * ============================================================
 * Permite cambiar entre vista compacta, cómoda y espaciosa
 */

'use client';

import React from 'react';
import { AlignJustify, AlignCenter, AlignLeft } from 'lucide-react';
import { useAgendaState } from '../../hooks/useAgendaState';

export const ViewDensityToggle = React.memo(function ViewDensityToggle() {
  const { viewDensity, setViewDensity } = useAgendaState();

  const densityOptions = [
    { 
      value: 'compact' as const, 
      label: 'Compacta', 
      icon: AlignJustify,
      description: 'Más citas visibles'
    },
    { 
      value: 'comfortable' as const, 
      label: 'Cómoda', 
      icon: AlignCenter,
      description: 'Balance ideal'
    },
    { 
      value: 'spacious' as const, 
      label: 'Espaciosa', 
      icon: AlignLeft,
      description: 'Más detalles'
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg">
      {densityOptions.map((option) => {
        const Icon = option.icon;
        const isActive = viewDensity === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => setViewDensity(option.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-white dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-blue-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
            title={option.description}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
});
