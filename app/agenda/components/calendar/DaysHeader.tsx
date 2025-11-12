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
    <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200 bg-white sticky top-0 z-10">
      {/* Columna vacía para alinear con columna de horas */}
      <div className="border-r border-gray-200" />

      {/* Días de la semana */}
      {days.map((date, index) => {
        const dayName = getDayName(date.getDay()).toUpperCase();
        const dayNumber = date.getDate();
        const isTodayDate = isToday(date);

        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center py-4 border-r border-gray-200 last:border-r-0"
          >
            <span className="text-xs font-medium text-gray-600 mb-1">
              {dayName}
            </span>
            {isTodayDate ? (
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2E7D32]">
                <span className="text-lg font-semibold text-white">
                  {dayNumber}
                </span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                {dayNumber}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});
