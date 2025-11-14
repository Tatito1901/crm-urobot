/**
 * ============================================================
 * CALENDAR GRID - Grid principal del calendario
 * ============================================================
 * Componente principal que integra TimeColumn, DayColumn y CalendarHeader
 */

'use client';

import React, { useMemo } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { useAgendaState } from '../../hooks/useAgendaState';
import type { Appointment, TimeSlot } from '@/types/agenda';

import { CalendarHeader } from './CalendarHeader';
import { TimeColumn } from './TimeColumn';
import { DayColumn } from './DayColumn';

interface CalendarGridProps {
  appointments: Appointment[];
  availableSlots: TimeSlot[];
  viewMode: 'week' | 'day';
  loading?: boolean;
  startHour?: number;
  endHour?: number;
  slotHeight?: number;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  appointments,
  availableSlots,
  viewMode,
  loading = false,
  startHour = 9,
  endHour = 18,
  slotHeight = 48,
}) => {
  const { dateRange } = useAgendaState();

  // Generar días a mostrar según el modo de vista
  const days = useMemo(() => {
    if (viewMode === 'day') {
      return [dateRange.start];
    }

    // Semana: Mostrar 5 días laborales (Lun-Vie)
    const days: Temporal.PlainDate[] = [];
    for (let i = 0; i < 5; i++) {
      days.push(dateRange.start.add({ days: i }));
    }
    return days;
  }, [dateRange, viewMode]);

  // Agrupar citas por día
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();

    for (const apt of appointments) {
      const dateKey = apt.start.toPlainDate().toString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(apt);
    }

    return map;
  }, [appointments]);

  // Agrupar slots por día
  const slotsByDay = useMemo(() => {
    const map = new Map<string, TimeSlot[]>();

    for (const slot of availableSlots) {
      const dateKey = slot.start.toPlainDate().toString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(slot);
    }

    return map;
  }, [availableSlots]);

  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header con días */}
      <CalendarHeader days={days} />

      {/* Grid principal con scroll optimizado */}
      <div className="flex overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-240px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50 hover:scrollbar-thumb-slate-600">
        {/* Columna de horas - sticky en desktop */}
        <div className="sticky left-0 z-10 bg-slate-900 shadow-lg">
          <TimeColumn startHour={startHour} endHour={endHour} slotHeight={slotHeight} />
        </div>

        {/* Columnas por día - flex responsivo */}
        <div className="flex flex-1 min-w-0">
          {days.map((day) => (
            <DayColumn
              key={day.toString()}
              date={day}
              appointments={appointmentsByDay.get(day.toString()) || []}
              availableSlots={slotsByDay.get(day.toString()) || []}
              startHour={startHour}
              endHour={endHour}
              slotHeight={slotHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton de carga para el calendario
 */
function CalendarSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
