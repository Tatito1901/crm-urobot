/**
 * ============================================================
 * HEADER BAR - Barra de navegación superior
 * ============================================================
 * Altura ~80px con controles de navegación y acciones
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Settings, MoreVertical } from 'lucide-react';
import { formatWeekRangeMX, startOfWeek, addWeeks } from '@/lib/date-utils';

interface HeaderBarProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
}

export const HeaderBar = React.memo(function HeaderBar({ currentWeekStart, onWeekChange }: HeaderBarProps) {
  const weekRange = formatWeekRangeMX(currentWeekStart);

  const goToThisWeek = () => {
    const today = new Date();
    const thisWeek = startOfWeek(today);
    onWeekChange(thisWeek);
  };

  const goToPreviousWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  return (
    <header className="h-[80px] border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      {/* Controles de navegación izquierda */}
      <div className="flex items-center gap-4">
        <button
          onClick={goToThisWeek}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Esta semana
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={goToNextWeek}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <span className="text-base font-bold text-gray-900">
          {weekRange}
        </span>
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-3">
        {/* Buscador */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre, teléfono o CURP"
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Selector de vista */}
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors">
          <span>Semana</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Configuración */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          aria-label="Configuración"
        >
          <Settings className="h-5 w-5 text-gray-700" />
        </button>

        {/* Más opciones */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          aria-label="Más opciones"
        >
          <MoreVertical className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </header>
  );
});
