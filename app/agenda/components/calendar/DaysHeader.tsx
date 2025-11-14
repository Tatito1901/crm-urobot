/**
 * ============================================================
 * DAYS HEADER - Encabezado de días de la semana
 * ============================================================
 * Muestra los días con formato: DÍA (mayúsculas) + número
 */

'use client';

import React from 'react';
import { addDays, getDayName, isToday } from '@/lib/date-utils';

interface DaysHeaderProps {
  weekStart: Date;
}

export const DaysHeader = React.memo(function DaysHeader({ weekStart }: DaysHeaderProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 border-b border-slate-800/40 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-20 p-2 pb-3">
      {/* Columna vacía para alinear con columna de horas */}
      <div className="border-r border-slate-800/40" />

      {/* Días de la semana */}
      {days.map((date, index) => {
        const dayName = getDayName(date.getDay()).toUpperCase();
        const dayNumber = date.getDate();
        const isTodayDate = isToday(date);

        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center py-3 border-r border-slate-800/30 last:border-r-0 rounded-sm"
          >
            <span className="text-xs font-semibold text-slate-400 mb-1.5 tracking-wider">
              {dayName}
            </span>
            {isTodayDate ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                <span className="text-xl font-bold text-white">
                  {dayNumber}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-slate-100">
                {dayNumber}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});
