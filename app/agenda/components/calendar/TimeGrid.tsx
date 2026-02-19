/**
 * ============================================================
 * TIME GRID - Grid de horas y columnas por día
 * ============================================================
 * Muestra horario completo de 24 horas con optimización de rendimiento
 */

'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { addDays, generateTimeSlotsDetailed, isToday } from '@/lib/date-utils';
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

  // Estado para la hora actual (evitar hydration mismatch)
  const [currentTime, setCurrentTime] = useState({ hour: 0, minute: 0 });
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime({ hour: now.getHours(), minute: now.getMinutes() });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const currentHour = currentTime.hour;
  const currentMinute = currentTime.minute;
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
      className="flex-1 overflow-auto bg-background scroll-smooth custom-scrollbar"
    >
      <div
        className={`grid ${
          mode === 'day' ? 'grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]' : 'grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[80px_repeat(7,1fr)]'
        } min-h-full gap-0 border-t border-border bg-background`}
      >
        {/* Columna de horas - Solo horas completas */}
        <div className="border-r border-border sticky left-0 bg-background z-10">
          {timeSlots.map((slot) => {
            // Calcular hora 12h
            const hour12 = slot.hour > 12 ? slot.hour - 12 : slot.hour === 0 ? 12 : slot.hour;
            const ampm = slot.hour >= 12 ? 'PM' : 'AM';
            
            // Solo renderizar etiqueta en horas en punto
            if (!slot.isHourStart) return <div key={slot.time} style={{ height: `${slotHeight}px` }} />;

            return (
              <div
                key={slot.time}
                className="relative w-full"
                style={{ height: `${slotHeightPerHour}px` }}
              >
                {/* Etiqueta alineada con la línea superior (Google Style) */}
                <span className="absolute -top-3 right-3 text-[11px] font-medium text-muted-foreground tabular-nums">
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

          // const isTodayDate = isToday(date);
          
          return (
            <div
              key={dayIndex}
              className={`relative border-r border-border last:border-r-0 transition-colors ${
                hasWorkingHours ? 'bg-transparent' : 'bg-muted/30'
              }`}
              role="gridcell"
              aria-label={`${date.toLocaleDateString('es-MX')}`}
            >
              {/* Grid de líneas de tiempo - Solo líneas visibles en horas completas */}
              {timeSlots.map((slot) => {
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
                    className="border-t border-border w-full relative group"
                    style={{ height: `${slotHeightPerHour}px` }} // Altura doble para cubrir la hora completa
                  >
                    {/* Indicador hover sutil */}
                    <div className="hidden group-hover:block absolute left-0 top-0 w-full h-full bg-accent/50 z-0 pointer-events-none" />
                  </div>
                );
              })}
              
              {/* Línea indicadora de hora actual - solo en día de hoy */}
              {isToday(date) && (
                <div
                  ref={dayIndex === 0 ? currentTimeRef : null}
                  data-current-time
                  className="absolute inset-x-0 z-30 pointer-events-none flex items-center"
                  style={{ 
                    top: `${((currentHour - startHour) * slotHeightPerHour) + (currentMinute * slotHeightPerHour / 60)}px` 
                  }}
                >
                  {/* Círculo indicador con pulso */}
                  <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm z-40 ring-2 ring-background">
                    <div className="absolute inset-0 rounded-full bg-red-400/50 animate-ping" />
                  </div>
                  {/* Línea */}
                  <div className="h-[2px] bg-red-400 w-full shadow-sm opacity-80" />
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
