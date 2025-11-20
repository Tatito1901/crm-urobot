/**
 * ============================================================
 * DAYS HEADER - Encabezado de días de la semana
 * ============================================================
 * Muestra los días con formato: DÍA (mayúsculas) + número
 */

import React from 'react';
import { addDays, getDayName, isToday } from '@/lib/date-utils';
import { useAgendaState } from '../../hooks/useAgendaState';

interface DaysHeaderProps {
  weekStart: Date;
  mode?: 'week' | 'day';
}

export const DaysHeader = React.memo(function DaysHeader({ weekStart, mode = 'week' }: DaysHeaderProps) {
  const { viewDensity } = useAgendaState();
  const days =
    mode === 'day'
      ? [weekStart]
      : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const headerHeight = viewDensity === 'compact' ? 'py-2' : viewDensity === 'comfortable' ? 'py-3' : 'py-4';

  return (
    <div
      className={`grid ${
        mode === 'day' ? 'grid-cols-[60px_1fr]' : 'grid-cols-[60px_repeat(7,1fr)]'
      } border-b border-slate-700/30 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-20`}
    >
      {/* Columna vacía para alinear con columna de horas */}
      <div className="border-r border-slate-700/30" />

      {/* Días de la semana - estilo Google Calendar */}
      {days.map((date, index) => {
        const dayName = getDayName(date.getDay()).slice(0, 3).toUpperCase(); // LUN, MAR, MIE...
        const dayNumber = date.getDate();
        const isTodayDate = isToday(date);

        return (
          <div
            key={index}
            className={`flex flex-col items-center justify-center py-2 border-r border-slate-700/30 last:border-r-0`}
          >
            {/* Día de la semana - pequeño arriba */}
            <span className={`text-[10px] font-medium uppercase tracking-wide mb-0.5 ${
              isTodayDate ? 'text-blue-400' : 'text-slate-500'
            }`}>
              {dayName}
            </span>
            
            {/* Número del día - compacto pero legible */}
            {isTodayDate ? (
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500 ring-2 ring-blue-400/20">
                <span className="text-xl font-semibold text-white">
                  {dayNumber}
                </span>
              </div>
            ) : (
              <span className="text-xl font-semibold text-slate-200">
                {dayNumber}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});
