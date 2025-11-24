/**
 * ============================================================
 * MONTH GRID - Vista mensual completa
 * ============================================================
 * Calendario mensual funcional con citas y navegación
 */

'use client';

import React, { useMemo } from 'react';
import { getMonthMatrix, isSameDay, isToday } from '@/lib/date-utils';
import type { Appointment } from '@/types/agenda';
import { getSedeConfig } from '../../lib/constants';

interface MonthGridProps {
  currentMonth: Date;
  selectedDate: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export const MonthGrid = React.memo(function MonthGrid({
  currentMonth,
  selectedDate,
  appointments,
  onDateSelect,
  onAppointmentClick,
}: MonthGridProps) {
  // Generar matriz de fechas
  const matrix = useMemo(() => 
    getMonthMatrix(currentMonth.getFullYear(), currentMonth.getMonth()), 
    [currentMonth]
  );

  const dayAbbreviations = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

  // Agrupar citas por fecha
  const appointmentsByDate = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();
    
    appointments.forEach(apt => {
      const dateKey = apt.start.toPlainDate().toString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(apt);
    });

    return grouped;
  }, [appointments]);

  return (
    <div className="flex-1 flex flex-col bg-[#050b18] overflow-hidden h-full">
      {/* Header de días */}
      <div className="grid grid-cols-7 border-b border-slate-700/40 bg-slate-900/90 sticky top-0 z-20">
        {dayAbbreviations.map((day) => (
          <div 
            key={day} 
            className="py-2 text-center text-xs font-bold text-slate-400 tracking-wider uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr min-h-0">
        {matrix.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((date) => {
              const dateKey = date.toISOString().split('T')[0];
              const dayAppointments = appointmentsByDate.get(dateKey) || [];
              
              // Ordenar por hora
              dayAppointments.sort((a, b) => 
                Temporal.ZonedDateTime.compare(a.start, b.start)
              );

              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isDayToday = isToday(date);
              const isSelected = isSameDay(date, selectedDate);
              
              // Max visible appointments before "+N more"
              const MAX_VISIBLE = 4;
              const visibleAppointments = dayAppointments.slice(0, MAX_VISIBLE);
              const hiddenCount = Math.max(0, dayAppointments.length - MAX_VISIBLE);

              return (
                <div
                  key={dateKey}
                  className={`
                    border-b border-r border-slate-700/30 p-1 flex flex-col gap-1
                    transition-colors cursor-pointer group relative overflow-hidden
                    ${!isCurrentMonth ? 'bg-slate-900/20 text-slate-600' : 'bg-transparent text-slate-300'}
                    ${isDayToday ? 'bg-blue-900/5' : 'hover:bg-slate-800/30'}
                    ${isSelected ? 'ring-1 ring-inset ring-blue-500/50 bg-blue-500/5' : ''}
                  `}
                  onClick={() => onDateSelect(date)}
                >
                  {/* Date Header */}
                  <div className="flex justify-center mb-0.5">
                    <span 
                      className={`
                        text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full transition-all
                        ${isDayToday ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110' : ''}
                        ${!isDayToday && isSelected ? 'bg-slate-700 text-white' : ''}
                        ${!isDayToday && !isSelected ? 'group-hover:text-white' : ''}
                      `}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Appointments List */}
                  <div className="flex-1 flex flex-col gap-1 min-h-0">
                    {visibleAppointments.map((apt) => {
                      const sedeConfig = getSedeConfig(apt.sede);
                      const startHour = apt.start.hour;
                      const startMinute = apt.start.minute;
                      const hour12 = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour;
                      const timeStr = `${hour12}${startMinute > 0 ? `:${startMinute.toString().padStart(2, '0')}` : ''}`;
                      const ampm = startHour >= 12 ? 'p' : 'a';
                      
                      return (
                        <button
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt);
                          }}
                          className={`
                            w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate
                            border-l-[2px] ${sedeConfig.borderLeftClass}
                            bg-slate-800/60 hover:bg-slate-700 hover:brightness-110 transition-all
                            text-slate-300 hover:text-white flex items-center gap-1 shadow-sm
                          `}
                          title={`${apt.paciente} - ${startHour}:${startMinute.toString().padStart(2, '0')}`}
                        >
                            <span className="font-bold text-slate-400 text-[9px] tracking-tight">{timeStr}{ampm}</span>
                            <span className="truncate font-medium">{apt.paciente}</span>
                        </button>
                      );
                    })}
                    
                    {hiddenCount > 0 && (
                      <div className="text-[9px] text-slate-500 hover:text-blue-400 font-medium pl-1 transition-colors">
                        + {hiddenCount} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

// Necesitamos importar Temporal para el sort
import { Temporal } from '@js-temporal/polyfill';
