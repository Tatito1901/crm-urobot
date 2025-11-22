/**
 * ============================================================
 * DAYS HEADER - Encabezado de días de la semana
 * ============================================================
 * Muestra los días con formato: DÍA (mayúsculas) + número
 */

import React, { useState } from 'react';
import { addDays, getDayName, isToday } from '@/lib/date-utils';
import { useOccupancyHeatmap, getOccupancyColors, getOccupancyLabel } from '../../hooks/useOccupancyHeatmap';

interface DaysHeaderProps {
  weekStart: Date;
  mode?: 'week' | 'day';
}

export const DaysHeader = React.memo(function DaysHeader({ weekStart, mode = 'week' }: DaysHeaderProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const { getOccupancyForDate } = useOccupancyHeatmap();
  
  const days =
    mode === 'day'
      ? [weekStart]
      : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div
      className={`grid ${
        mode === 'day' 
          ? 'grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]' 
          : 'grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[80px_repeat(7,1fr)]'
      } bg-[#18181b] sticky top-0 z-20 border-b border-white/[0.08]`}
    >
      {/* Columna vacía para alinear con columna de horas */}
      <div className="bg-[#18181b] z-20 border-r border-white/[0.08]" />

      {/* Días de la semana - estilo Google Calendar */}
      {days.map((date, index) => {
        const dayName = getDayName(date.getDay()).slice(0, 3).toUpperCase(); // LUN, MAR, MIE...
        const dayNumber = date.getDate();
        const isTodayDate = isToday(date);
        const occupancy = getOccupancyForDate(date);
        const colors = getOccupancyColors(occupancy.level);
        const isHovered = hoveredDay === index;

        return (
          <div
            key={index}
            className={`relative flex flex-col items-center justify-center py-4 border-r border-white/[0.08] last:border-r-0 group transition-colors`}
            onMouseEnter={() => setHoveredDay(index)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <span className={`text-[11px] font-medium mb-1 uppercase tracking-wider ${isTodayDate ? 'text-blue-400' : 'text-gray-400'}`}>
              {dayName}
            </span>
            
            {isTodayDate ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/20">
                <span className="text-2xl font-normal leading-none pt-[2px]">
                  {dayNumber}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors text-gray-200">
                <span className="text-2xl font-normal leading-none pt-[2px]">
                  {dayNumber}
                </span>
              </div>
            )}
            
            {/* Indicador de ocupación minimalista (punto) */}
            {occupancy.count > 0 && (
              <div className="flex items-center gap-1 mt-1 absolute bottom-2">
                <div 
                  className={`w-1.5 h-1.5 rounded-full ${colors.indicator}`}
                  title={`${occupancy.count} citas`}
                />
              </div>
            )}
            
            {/* Tooltip con estadísticas */}
            {isHovered && occupancy.count > 0 && (
              <div className="absolute top-full mt-2 z-50 w-40 p-2 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl">
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-200">
                    {date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Citas:</span>
                    <span className={`font-bold ${colors.text}`}>{occupancy.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nivel:</span>
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {getOccupancyLabel(occupancy.level)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors.indicator} transition-all`}
                      style={{ width: `${occupancy.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
