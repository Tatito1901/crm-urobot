/**
 * ============================================================
 * CALENDAR HEADER - Header con días de la semana
 * ============================================================
 * Muestra los nombres de los días y números en la parte superior
 */

'use client';

import React from 'react';
import { Temporal } from '@js-temporal/polyfill';

interface CalendarHeaderProps {
  days: Temporal.PlainDate[];
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ days }) => {
  const today = Temporal.Now.plainDateISO('America/Mexico_City');

  return (
    <div className="flex border-b border-slate-800/60 bg-slate-900/60">
      {/* Espacio para la columna de horas */}
      <div className="w-16 flex-shrink-0 border-r border-slate-800/60" />

      {/* Headers de días */}
      <div className="flex flex-1">
        {days.map((day) => {
          const isToday = day.equals(today);
          const dayOfWeek = day.dayOfWeek % 7; // 0=Dom, 1=Lun, ..., 6=Sáb

          return (
            <div
              key={day.toString()}
              className={`
                flex-1 min-w-[120px] p-3 text-center border-r border-slate-800/60
                ${isToday ? 'bg-blue-500/10' : ''}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                {/* Nombre del día */}
                <p
                  className={`
                    text-xs font-medium uppercase tracking-wide
                    ${isToday ? 'text-blue-400' : 'text-slate-400'}
                  `}
                >
                  {DAY_NAMES[dayOfWeek]}
                </p>

                {/* Número del día */}
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold
                    ${
                      isToday
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-100'
                    }
                  `}
                >
                  {day.day}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
