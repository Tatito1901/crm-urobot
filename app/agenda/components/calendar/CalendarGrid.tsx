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
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
      {/* Header con días */}
      <CalendarHeader days={days} />

      {/* Grid principal */}
      <div className="flex overflow-x-auto">
        {/* Columna de horas */}
        <TimeColumn startHour={startHour} endHour={endHour} slotHeight={slotHeight} />

        {/* Columnas por día */}
        <div className="flex flex-1">
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
