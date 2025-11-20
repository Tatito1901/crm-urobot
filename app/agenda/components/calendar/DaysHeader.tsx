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
          ? 'grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]' 
          : 'grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[80px_repeat(7,1fr)]'
      } gap-0.5 md:gap-1 border-b border-slate-700/60 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-20 p-1 md:p-2 pb-2 md:pb-3`}
    >
      {/* Columna vacía para alinear con columna de horas */}
      <div className="border-r border-slate-700/50" />

      {/* Días de la semana */}
      {days.map((date, index) => {
        const dayName = getDayName(date.getDay()).toUpperCase();
        const dayNumber = date.getDate();
        const isTodayDate = isToday(date);
        const occupancy = getOccupancyForDate(date);
        const colors = getOccupancyColors(occupancy.level);
        const isHovered = hoveredDay === index;

        return (
          <div
            key={index}
            className="relative flex flex-col items-center justify-center py-1.5 md:py-3 border-r border-slate-700/50 last:border-r-0 rounded-sm group"
            onMouseEnter={() => setHoveredDay(index)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mb-0.5 md:mb-1.5 tracking-wider">
              {dayName}
            </span>
            {isTodayDate ? (
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse">
                <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                  {dayNumber}
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg md:text-xl font-bold text-slate-100">
                {dayNumber}
              </span>
            )}
            
            {/* Indicador de ocupación (heatmap) */}
            {occupancy.count > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div 
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colors.indicator} transition-all group-hover:scale-125`}
                  title={`${occupancy.count} citas`}
                />
                <span className={`text-[9px] sm:text-[10px] font-medium ${colors.text} opacity-80`}>
                  {occupancy.count}
                </span>
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
