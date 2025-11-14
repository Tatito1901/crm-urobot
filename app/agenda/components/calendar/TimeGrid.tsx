/**
 * ============================================================
 * TIME GRID - Grid de horas y columnas por día
 * ============================================================
 * Muestra horario 11:00-21:30 en slots de 30min
 */

'use client';

import React from 'react';
import { addDays, generateTimeSlots } from '@/lib/date-utils';

interface TimeGridProps {
  weekStart: Date;
  startHour?: number;
  endHour?: number;
}

export const TimeGrid = React.memo(function TimeGrid({ weekStart, startHour = 11, endHour = 21 }: TimeGridProps) {
  const timeSlots = generateTimeSlots(startHour, endHour);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Determinar si un día tiene horario laboral (tinte amarillo pálido)
  // Para este ejemplo: Lunes a Viernes (1-5)
  const isWorkingDay = (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0b0f16]">
      <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-full">
        {/* Columna de horas */}
        <div className="border-r border-slate-800/60 sticky left-0 bg-slate-900/40 z-10">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-12 flex items-start justify-end pr-3 pt-1 text-xs text-slate-400 border-b border-slate-800/40"
              style={{ minHeight: '48px' }}
            >
              <span>{time}</span>
            </div>
          ))}
        </div>

        {/* Columnas por día */}
        {days.map((date, dayIndex) => {
          const hasWorkingHours = isWorkingDay(date);

          return (
            <div
              key={dayIndex}
              className={`border-r border-slate-800/60 last:border-r-0 ${
                hasWorkingHours ? 'bg-slate-900/20' : 'bg-[#0b0f16]'
              }`}
              role="gridcell"
            >
              {timeSlots.map((time) => (
                <div
                  key={`${dayIndex}-${time}`}
                  className="h-12 border-b border-slate-800/40 hover:bg-blue-900/20 transition-colors cursor-pointer"
                  style={{ minHeight: '48px' }}
                  data-time={time}
                  data-date={date.toISOString().split('T')[0]}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});
