/**
 * ============================================================
 * TIME GRID - Grid de horas y columnas por día
 * ============================================================
 * Muestra horario completo de 24 horas con optimización de rendimiento
 */

'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { addDays, generateTimeSlotsDetailed, formatHour12, isToday } from '@/lib/date-utils';
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

// Función auxiliar fuera del componente para evitar recreación
const isWorkingDay = (date: Date) => {
  const day = date.getDay();
  return day >= 1 && day <= 5;
};

export const TimeGrid = React.memo(function TimeGrid({ 
  weekStart, 
  appointments = [],
  startHour = 0, 
  endHour = 24,
  mode = 'week',
  onAppointmentClick,
}: TimeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  
  // Memoizar slots detallados (cada 30 min) para evitar regeneración
  const timeSlots = useMemo(() => generateTimeSlotsDetailed(startHour, endHour), [startHour, endHour]);
  const days =
    mode === 'day'
      ? [weekStart]
      : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Calcular posición actual del tiempo en tiempo real
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimePosition = (currentHour - startHour) * 60 + currentMinute;
  const showCurrentTimeLine = days.some(day => isToday(day));
  
  // Auto-scroll a la hora actual al cargar
  useEffect(() => {
    if (!showCurrentTimeLine || !containerRef.current || !currentTimeRef.current) return;
    
    const timer = setTimeout(() => {
      const container = containerRef.current;
      const currentLine = currentTimeRef.current;
      if (!container || !currentLine) return;
      
      container.scrollTo({
        top: Math.max(0, currentLine.offsetTop - container.clientHeight / 3),
        behavior: 'smooth'
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [showCurrentTimeLine]);

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

  // Altura optimizada: 48px por hora = 24px por slot de 30min (estilo Google Calendar)
  const slotHeightPerHour = 48;
  const slotHeight = slotHeightPerHour / 2; // 24px por slot de 30 minutos

  return (
    <div 
      ref={containerRef}
      data-time-grid
      className="flex-1 overflow-auto bg-[#121212] scroll-smooth custom-scrollbar"
    >
      <div
        className={`grid ${
          mode === 'day' ? 'grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]' : 'grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[80px_repeat(7,1fr)]'
        } min-h-full gap-0 border-t border-slate-800/40 bg-[#121212]`}
      >
        {/* Columna de horas - Solo horas completas */}
        <div className="border-r border-slate-800/40 sticky left-0 bg-[#121212] z-10 translate-y-[-10px]">
          {timeSlots.map((slot) => {
            // Calcular hora 12h
            const hour12 = slot.hour > 12 ? slot.hour - 12 : slot.hour === 0 ? 12 : slot.hour;
            const ampm = slot.hour >= 12 ? 'PM' : 'AM';
            
            // Solo renderizar etiqueta en horas en punto
            if (!slot.isHourStart) return <div key={slot.time} style={{ height: `${slotHeight}px` }} />;

            return (
              <div
                key={slot.time}
                className="flex flex-col items-end justify-start pr-3 relative"
                style={{ height: `${slotHeightPerHour}px` }}
              >
                <span className="text-[10px] font-medium text-slate-400 tabular-nums leading-none translate-y-[50%]">
                  {hour12} {ampm}
                </span>
              </div>
            );
          })}
        </div>

        {/* Columnas por día - renderizado optimizado */}
        {days.map((date, dayIndex) => {
          const dayAppointments = appointmentsByDay.get(dayIndex) || [];
          const hasWorkingHours = isWorkingDay(date);
          const positionedAppointments = positionAppointmentsForDay(
            dayAppointments,
            dayIndex,
            startHour,
            slotHeightPerHour // Pasar altura por hora completa
          );

          return (
            <div
              key={dayIndex}
              className={`relative border-r border-slate-800/40 last:border-r-0 transition-colors ${
                hasWorkingHours ? 'bg-transparent' : 'bg-slate-900/10'
              }`}
              role="gridcell"
              aria-label={`${date.toLocaleDateString('es-MX')}`}
            >
              {/* Grid de líneas de tiempo - Solo líneas visibles en horas completas */}
              {timeSlots.map((slot, slotIndex) => {
                // Solo renderizar borde en horas completas
                if (!slot.isHourStart) {
                   return (
                    <div
                      key={`${dayIndex}-${slot.time}`}
                      className="relative"
                      style={{ height: `${slotHeight}px` }}
                    />
                   );
                }
                
                return (
                  <div
                    key={`${dayIndex}-${slot.time}`}
                    className="border-t border-slate-800/40 w-full relative group"
                    style={{ height: `${slotHeightPerHour}px` }} // Altura doble para cubrir la hora completa
                  >
                    {/* Indicador hover sutil */}
                    <div className="hidden group-hover:block absolute left-0 top-0 w-full h-full bg-slate-800/10 z-0 pointer-events-none" />
                  </div>
                );
              })}
              
              {/* Línea indicadora de hora actual - solo en día de hoy */}
              {isToday(date) && (
                <div
                  ref={dayIndex === 0 ? currentTimeRef : null}
                  data-current-time
                  className="absolute inset-x-0 z-30 pointer-events-none"
                  style={{ 
                    top: `${((currentHour - startHour) * slotHeightPerHour) + (currentMinute * slotHeightPerHour / 60)}px` 
                  }}
                >
                  {/* Círculo indicador */}
                  <div className="absolute -left-[5px] -top-[5px] w-2.5 h-2.5 rounded-full bg-[#ea4335] shadow-sm" />
                  {/* Línea */}
                  <div className="h-[2px] bg-[#ea4335] w-full shadow-sm" />
                </div>
              )}
              
              {/* Citas posicionadas - usar valores calculados por positionAppointmentsForDay */}
              {positionedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="absolute inset-x-0 px-0.5 sm:px-1 py-0.5"
                  style={{
                    top: `${apt.top}px`,
                    height: `${Math.max(apt.height - 2, 28)}px`, // Mínimo 28px para mejor click
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
