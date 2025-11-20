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
  
  // Auto-scroll a la hora actual al cargar (solo si hay día de hoy visible)
  useEffect(() => {
    if (showCurrentTimeLine && containerRef.current && currentTimeRef.current) {
      // Pequeño delay para asegurar que el DOM está listo
      const timer = setTimeout(() => {
        const container = containerRef.current;
        const currentLine = currentTimeRef.current;
        
        if (container && currentLine) {
          const containerHeight = container.clientHeight;
          const scrollTop = currentLine.offsetTop - containerHeight / 3;
          
          container.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showCurrentTimeLine, mode, weekStart]);

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

  // Altura optimizada: 48px por hora = 24px por slot de 30min (estilo Google Calendar)
  const slotHeightPerHour = 48;
  const slotHeight = slotHeightPerHour / 2; // 24px por slot de 30 minutos

  return (
    <div 
      ref={containerRef}
      data-time-grid
      className="flex-1 overflow-auto bg-slate-900 p-1 md:p-2 scroll-smooth"
    >
      <div
        className={`grid ${
          mode === 'day' ? 'grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]' : 'grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] md:grid-cols-[80px_repeat(7,1fr)]'
        } min-h-full gap-0.5 md:gap-1 rounded-lg overflow-hidden`}
      >
        {/* Columna de horas - Solo mostrar horas completas (estilo Google Calendar) */}
        <div className="border-r border-slate-700/70 sticky left-0 bg-slate-900/95 z-10 backdrop-blur-sm">
          {timeSlots.map((slot) => (
            <div
              key={slot.time}
              className={`flex items-start justify-end pr-1.5 sm:pr-2 md:pr-3 ${
                slot.isHourStart ? 'pt-1' : ''
              } text-[10px] sm:text-xs font-medium text-slate-400 ${
                slot.isHourStart ? 'border-t border-slate-700/50' : ''
              }`}
              style={{ height: `${slotHeight}px` }}
            >
              {/* Solo mostrar hora en slots completos */}
              {slot.isHourStart && (
                <span className="tabular-nums -mt-2">
                  {formatHour12(slot.hour)}
                </span>
              )}
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
            slotHeightPerHour // Pasar altura por hora completa
          );

          return (
            <div
              key={dayIndex}
              className={`relative border-r border-slate-700/50 last:border-r-0 rounded-sm transition-colors ${
                hasWorkingHours ? 'bg-slate-900/30' : 'bg-[#0b0f16]'
              }`}
              role="gridcell"
              aria-label={`${date.toLocaleDateString('es-MX')}`}
            >
              {/* Grid de slots de tiempo - Grid mejorado estilo Google Calendar */}
              {timeSlots.map((slot) => (
                <div
                  key={`${dayIndex}-${slot.time}`}
                  className={`${
                    slot.isHourStart 
                      ? 'border-t border-slate-700/60' 
                      : 'border-t border-slate-700/20'
                  } hover:bg-blue-500/8 transition-colors cursor-pointer group relative`}
                  style={{ height: `${slotHeight}px` }}
                  data-time={slot.time}
                  data-date={date.toISOString().split('T')[0]}
                  title={`${formatHour12(slot.hour)}${slot.minute > 0 ? `:${slot.minute}` : ''} - ${date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}`}
                >
                  {/* Indicador de tiempo al hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute top-0 left-0 text-[9px] text-blue-400 font-medium px-1 bg-slate-900/80 rounded-br">
                      {formatHour12(slot.hour)}{slot.minute > 0 ? `:${slot.minute}` : ''}
                    </div>
                  </div>
                </div>
              ))}
              
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
                  {/* Círculo */}
                  <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" />
                  {/* Línea */}
                  <div className="h-0.5 bg-red-500 shadow-md shadow-red-500/30" />
                  {/* Hora actual */}
                  <div className="absolute -left-16 sm:-left-14 -top-2.5 text-[10px] font-bold text-red-500 bg-slate-900 px-1.5 py-0.5 rounded border border-red-500/30 whitespace-nowrap">
                    {now.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
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
