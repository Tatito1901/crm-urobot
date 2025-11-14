/**
 * ============================================================
 * TIME GRID - Grid de horas y columnas por día
 * ============================================================
 * Muestra horario 11:00-21:30 en slots de 30min + citas renderizadas
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
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentConfirm?: (id: string) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
}

export const TimeGrid = React.memo(function TimeGrid({ 
  weekStart, 
  appointments = [],
  startHour = 11, 
  endHour = 21,
  onAppointmentClick,
  onAppointmentConfirm,
  onAppointmentEdit,
}: TimeGridProps) {
  const timeSlots = generateTimeSlots(startHour, endHour);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Determinar si un día tiene horario laboral
  const isWorkingDay = (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  // Agrupar citas por día
  const appointmentsByDay = useMemo(() => {
    const grouped: Map<number, Appointment[]> = new Map();
    
    appointments.forEach((apt) => {
      const aptDate = apt.start.toPlainDate();
      const dayIndex = getDayOfWeek(aptDate, weekStart);
      
      if (dayIndex >= 0 && dayIndex < 7) {
        if (!grouped.has(dayIndex)) {
          grouped.set(dayIndex, []);
        }
        grouped.get(dayIndex)!.push(apt);
      }
    });
    
    return grouped;
  }, [appointments, weekStart]);

  return (
    <div className="flex-1 overflow-auto bg-[#0b0f16] p-2">
      <div className="grid grid-cols-[100px_repeat(7,1fr)] min-h-full gap-1 rounded-lg overflow-hidden">
        {/* Columna de horas */}
        <div className="border-r border-slate-800/40 sticky left-0 bg-slate-900/60 z-10 backdrop-blur-sm">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-16 flex items-start justify-end pr-4 pt-2 text-sm font-medium text-slate-300 border-b border-slate-800/30"
              style={{ minHeight: '64px' }}
            >
              <span>{time}</span>
            </div>
          ))}
        </div>

        {/* Columnas por día */}
        {days.map((date, dayIndex) => {
          const hasWorkingHours = isWorkingDay(date);
          const dayAppointments = appointmentsByDay.get(dayIndex) || [];
          const positionedAppointments = positionAppointmentsForDay(
            dayAppointments,
            dayIndex,
            startHour,
            64 // slot height aumentado para mejor visualización
          );

          return (
            <div
              key={dayIndex}
              className={`relative border-r border-slate-800/30 last:border-r-0 rounded-sm ${
                hasWorkingHours ? 'bg-slate-900/30' : 'bg-[#0b0f16]'
              }`}
              role="gridcell"
            >
              {/* Grid de slots de tiempo */}
              {timeSlots.map((time) => (
                <div
                  key={`${dayIndex}-${time}`}
                  className="h-16 border-b border-slate-800/20 hover:bg-blue-900/10 transition-colors cursor-pointer"
                  style={{ minHeight: '64px' }}
                  data-time={time}
                  data-date={date.toISOString().split('T')[0]}
                />
              ))}
              
              {/* Citas posicionadas absolutamente */}
              {positionedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="absolute inset-x-0 px-2 py-1"
                  style={{
                    top: `${apt.top}px`,
                    height: `${apt.height - 8}px`, // -8px para mejor spacing
                    left: `${apt.left}%`,
                    width: `${apt.width}%`,
                    zIndex: apt.zIndex,
                  }}
                >
                  <AppointmentCard
                    appointment={apt}
                    onClick={onAppointmentClick}
                    onConfirm={onAppointmentConfirm}
                    onEdit={onAppointmentEdit}
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
