/**
 * ============================================================
 * TIME COLUMN - Columna de horas del calendario
 * ============================================================
 * Muestra las horas del día en la columna izquierda del grid
 */

'use client';

import React from 'react';

interface TimeColumnProps {
  startHour?: number; // Hora de inicio (ej: 9)
  endHour?: number; // Hora de fin (ej: 18)
  slotHeight?: number; // Altura de cada slot de 30 min en px
}

export const TimeColumn: React.FC<TimeColumnProps> = ({
  startHour = 9,
  endHour = 18,
  slotHeight = 48,
}) => {
  // Generar slots de tiempo cada 30 minutos
  const timeSlots: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (const minute of [0, 30]) {
      if (hour === endHour && minute > 0) break; // No mostrar 18:30 si termina a las 18:00

      const hourStr = String(hour).padStart(2, '0');
      const minStr = String(minute).padStart(2, '0');
      timeSlots.push(`${hourStr}:${minStr}`);
    }
  }

  return (
    <div className="w-16 flex-shrink-0 border-r border-slate-800/60 bg-slate-900/40">
      {timeSlots.map((time, index) => (
        <div
          key={time}
          className="relative border-b border-slate-800/50"
          style={{ height: `${slotHeight}px` }}
        >
          {/* Solo mostrar hora en los slots de :00 */}
          {time.endsWith(':00') && (
            <div className="absolute -top-2 right-2 text-[11px] font-mono text-slate-500">
              {time}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
