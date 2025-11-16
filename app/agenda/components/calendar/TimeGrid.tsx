/**
 * ============================================================
 * TIME GRID - Grid de horas y columnas por día
 * ============================================================
 * Muestra horario completo de 24 horas con optimización de rendimiento
 */

'use client';

import React, { useMemo } from 'react';
import { addDays, generateTimeSlots } from '@/lib/date-utils';
import { AppointmentCard } from '../shared/AppointmentCard';
import { positionAppointmentsForDay, getDayOfWeek } from '../../lib/appointment-positioning';
import type { Appointment } from '@/types/agenda';

interface TimeGridProps {
  weekStart: Date;
  appointments?: Appointment[];
  startHour?: number;
  endHour?: number;
  mode?: 'week' | 'day';
  onAppointmentClick?: (appointment: Appointment) => void;
}

export const TimeGrid = React.memo(function TimeGrid({ 
  weekStart, 
  appointments = [],
  startHour = 0, 
  endHour = 24,
  mode = 'week',
  onAppointmentClick,
}: TimeGridProps) {
  // Memoizar slots para evitar regeneración en cada render
  const timeSlots = useMemo(() => generateTimeSlots(startHour, endHour), [startHour, endHour]);
  const days =
    mode === 'day'
      ? [weekStart]
      : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Determinar si un día tiene horario laboral
  const isWorkingDay = (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  // Agrupar y posicionar citas por día (optimizado)
  const appointmentsByDay = useMemo(() => {
    const grouped: Map<number, Appointment[]> = new Map();
    const numDays = mode === 'day' ? 1 : 7;
    
    // Pre-inicializar para evitar checks en el loop
    for (let i = 0; i < numDays; i++) {
      grouped.set(i, []);
    }
    
    appointments.forEach((apt) => {
      const aptDate = apt.start.toPlainDate();
      const dayIndex = getDayOfWeek(aptDate, weekStart);
      
      if (dayIndex >= 0 && dayIndex < numDays) {
        grouped.get(dayIndex)!.push(apt);
      }
    });
    
    return grouped;
  }, [appointments, weekStart, mode]);

  // Altura de slot por hora (más espacio que antes al dividir por hora completa)
  const slotHeight = 60;

  return (
    <div className="flex-1 overflow-auto bg-slate-900 p-1 md:p-2">
      <div
        className={`grid ${
          mode === 'day' ? 'grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]' : 'grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[80px_repeat(7,1fr)]'
        } min-h-full gap-0.5 md:gap-1 rounded-lg overflow-hidden`}
      >
        {/* Columna de horas - más compacta en móvil */}
        <div className="border-r border-slate-700/70 sticky left-0 bg-slate-900/90 z-10 backdrop-blur-sm">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="flex items-start justify-end pr-2 md:pr-3 pt-1.5 text-xs md:text-sm font-medium text-slate-400 border-b border-slate-700/40"
              style={{ height: `${slotHeight}px` }}
            >
              <span className="tabular-nums">{time}</span>
            </div>
          ))}
        </div>

        {/* Columnas por día - renderizado optimizado */}
        {days.map((date, dayIndex) => {
          const dayAppointments = appointmentsByDay.get(dayIndex) || [];
          const hasWorkingHours = isWorkingDay(date);
          const positionedAppointments = positionAppointmentsForDay(
            dayAppointments,
            dayIndex,
            startHour,
            slotHeight
          );

          return (
            <div
              key={dayIndex}
              className={`relative border-r border-slate-700/50 last:border-r-0 rounded-sm ${
                hasWorkingHours ? 'bg-slate-900/30' : 'bg-[#0b0f16]'
              }`}
              role="gridcell"
            >
              {/* Grid de slots de tiempo */}
              {timeSlots.map((time) => (
                <div
                  key={`${dayIndex}-${time}`}
                  className="border-b border-slate-700/30 hover:bg-blue-900/5 transition-colors cursor-pointer"
                  style={{ height: `${slotHeight}px` }}
                  data-time={time}
                  data-date={date.toISOString().split('T')[0]}
                />
              ))}
              
              {/* Citas posicionadas absolutamente */}
              {positionedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="absolute inset-x-0 px-1 py-0.5"
                  style={{
                    top: `${apt.top}px`,
                    height: `${apt.height - 2}px`, // -2px para pequeño espaciado
                    left: `${apt.left}%`,
                    width: `${apt.width}%`,
                    zIndex: apt.zIndex,
                  }}
                >
                  <AppointmentCard
                    appointment={apt}
                    onClick={onAppointmentClick}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});
