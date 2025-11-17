/**
 * ============================================================
 * FILTER BUTTON - Botón de filtro reutilizable
 * ============================================================
 * Componente reutilizable para todos los filtros de la agenda
 */

import React from 'react';

interface FilterButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: 'primary' | 'colored';
  color?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  selected,
  onClick,
  variant = 'primary',
  color,
  fullWidth = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  };

  const getColorClasses = () => {
    if (variant === 'colored' && color && selected) {
      // Mapeo de colores para variante colored
      const colorMap: Record<string, string> = {
        'blue-600': 'bg-blue-600 text-white',
        'emerald-600': 'bg-emerald-600 text-white',
        'red-600': 'bg-red-600 text-white',
        'amber-500': 'bg-amber-500 text-white',
        'slate': 'bg-slate-500 text-white',
      };
      return colorMap[color] || 'bg-blue-600 text-white';
    }

    // Variante primary (azul cuando seleccionado)
    return selected
      ? 'bg-blue-500 text-white'
      : 'bg-slate-800 text-slate-400 hover:bg-slate-700';
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${fullWidth ? 'flex-1' : ''}
        ${sizeClasses[size]}
        rounded-lg
        font-medium
        transition-all
        ${getColorClasses()}
      `}
    >
      {label}
    </button>
  );
};
