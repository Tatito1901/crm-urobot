/**
 * ============================================================
 * TIME GRID - Grid de horas y columnas por día
 * ============================================================
 * Muestra horario completo de 24 horas con optimización de rendimiento
 */

'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { addDays, generateTimeSlots, isToday } from '@/lib/date-utils';
import { AppointmentCard } from '../shared/AppointmentCard';
import { positionAppointmentsForDay, getDayOfWeek } from '../../lib/appointment-positioning';
import { useAgendaState } from '../../hooks/useAgendaState';
import type { Appointment } from '@/types/agenda';

interface TimeGridProps {
  weekStart: Date;
  appointments?: Appointment[];
  startHour?: number;
  endHour?: number;
  mode?: 'week' | 'day';
  onAppointmentClick?: (appointment: Appointment) => void;
}

// Altura de slot por hora según densidad - OPTIMIZADO para vista sin scroll
const DENSITY_HEIGHTS = {
  compact: 32,      // Reducido de 40 → 32 (20% más compacto)
  comfortable: 50,  // Reducido de 60 → 50
  spacious: 70,     // Reducido de 80 → 70
} as const;

export const TimeGrid = React.memo(function TimeGrid({ 
  weekStart, 
  appointments = [],
  startHour = 0, 
  endHour = 24,
  mode = 'week',
  onAppointmentClick,
}: TimeGridProps) {
  const { viewDensity } = useAgendaState();
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  
  // Actualizar hora actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto
    
    return () => clearInterval(interval);
  }, []);
  
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
  
  // Altura de slot según densidad
  const slotHeight = DENSITY_HEIGHTS[viewDensity];

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

  // Auto-scroll al día actual cuando se monta el componente o cambia la densidad
  useEffect(() => {
    if (!gridRef.current) return;
    
    const todayColumnIndex = days.findIndex(day => isToday(day));
    if (todayColumnIndex === -1) return;
    
    // Calcular hora actual
    const now = new Date();
    const currentHour = now.getHours();
    
    // Si estamos en horario de trabajo (8am - 6pm), scroll a hora actual
    if (currentHour >= 8 && currentHour <= 18) {
      const targetScrollPosition = (currentHour - startHour) * slotHeight - 100;
      gridRef.current.scrollTop = Math.max(0, targetScrollPosition);
    } else {
      // Fuera de horario, scroll al inicio del día laboral (8am)
      const targetScrollPosition = (8 - startHour) * slotHeight;
      gridRef.current.scrollTop = Math.max(0, targetScrollPosition);
    }
  }, [days, startHour, slotHeight, viewDensity]);

  return (
    <div ref={gridRef} className="flex-1 overflow-auto bg-slate-900 p-0.5 scroll-smooth">
      <div
        className={`grid ${
          mode === 'day' ? 'grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]' : 'grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[80px_repeat(7,1fr)]'
        } min-h-full gap-0.5 rounded-lg overflow-hidden`}
      >
        {/* Columna de horas - optimizada para todos los tamaños */}
        <div className="border-r border-slate-700/70 sticky left-0 bg-slate-900/95 z-10 backdrop-blur-sm">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="flex items-start justify-end pr-2 pt-0.5 text-[10px] md:text-xs font-medium text-slate-400 border-b border-slate-700/30"
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

          const isTodayDate = isToday(date);
          
          // Calcular posición de línea de hora actual
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();
          const currentTimePosition = ((currentHour - startHour) * slotHeight) + ((currentMinute / 60) * slotHeight);
          const showCurrentTimeLine = isTodayDate && currentHour >= startHour && currentHour < endHour;
          
          return (
            <div
              key={dayIndex}
              className={`relative border-r border-slate-700/50 last:border-r-0 rounded-sm transition-colors ${
                isTodayDate 
                  ? 'bg-blue-900/10 border-blue-500/30' 
                  : hasWorkingHours 
                  ? 'bg-slate-900/30' 
                  : 'bg-[#0b0f16]'
              }`}
              role="gridcell"
              aria-label={`${date.toLocaleDateString('es-MX')}`}
            >
              {/* Grid de slots de tiempo - con hover mejorado */}
              {timeSlots.map((time) => (
                <div
                  key={`${dayIndex}-${time}`}
                  className="border-b border-slate-700/30 hover:bg-blue-500/5 hover:border-blue-500/20 transition-colors cursor-pointer group"
                  style={{ height: `${slotHeight}px` }}
                  data-time={time}
                  data-date={date.toISOString().split('T')[0]}
                  title={`${time} - ${date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}`}
                />
              ))}
              
              {/* Citas posicionadas - optimizadas */}
              {positionedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="absolute inset-x-0 px-0.5 sm:px-1 py-0.5"
                  style={{
                    top: `${apt.top}px`,
                    height: `${Math.max(apt.height - 2, 30)}px`, // Mínimo 30px para mejor click en mobile
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
              
              {/* Línea indicadora de hora actual (solo en día de hoy) */}
              {showCurrentTimeLine && (
                <div 
                  className="absolute left-0 right-0 z-30 pointer-events-none"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  {/* Circulo indicador */}
                  <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
                  {/* Línea */}
                  <div className="w-full h-0.5 bg-red-500 shadow-lg shadow-red-500/30" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
