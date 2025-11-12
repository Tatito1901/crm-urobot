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
    <div className="flex-1 overflow-auto bg-white">
      <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-full">
        {/* Columna de horas */}
        <div className="border-r border-gray-200 sticky left-0 bg-white z-10">
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className="h-12 flex items-start justify-end pr-3 pt-1 text-xs text-gray-600 border-b border-gray-100"
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
              className={`border-r border-gray-200 last:border-r-0 ${
                hasWorkingHours ? 'bg-[#FFFEF7]' : 'bg-white'
              }`}
              role="gridcell"
            >
              {timeSlots.map((time, slotIndex) => (
                <div
                  key={`${dayIndex}-${time}`}
                  className="h-12 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
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
