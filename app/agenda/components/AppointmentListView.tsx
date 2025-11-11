/**
 * ============================================================
 * APPOINTMENT LIST VIEW - Vista de lista optimizada para mobile
 * ============================================================
 */

import React, { useMemo } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { AppointmentCard } from './AppointmentCard';
import { groupAppointmentsByDay, formatMediumDate } from '../lib/agenda-utils';
import type { Consulta } from '@/types/consultas';

interface CalendarEvent {
  id: string;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  consulta: Consulta;
}

interface AppointmentListViewProps {
  events: CalendarEvent[];
  onAppointmentClick: (consulta: Consulta) => void;
  emptyMessage?: string;
}

export const AppointmentListView: React.FC<AppointmentListViewProps> = ({
  events,
  onAppointmentClick,
  emptyMessage = 'No hay citas programadas'
}) => {
  const groupedEvents = useMemo(() => {
    return groupAppointmentsByDay(events);
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="mb-4 h-16 w-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium text-slate-400">{emptyMessage}</p>
        <p className="mt-2 text-sm text-slate-500">Las citas aparecerán aquí cuando se programen</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map(group => {
        const now = Temporal.Now.plainDateISO('America/Mexico_City');
        const isToday = group.date.equals(now);
        const isTomorrow = group.date.equals(now.add({ days: 1 }));

        let dayLabel = '';
        if (isToday) {
          dayLabel = 'HOY';
        } else if (isTomorrow) {
          dayLabel = 'MAÑANA';
        } else {
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          const dayOfWeek = dayNames[group.date.dayOfWeek % 7];
          const zonedDate = group.date.toZonedDateTime({
            timeZone: 'America/Mexico_City',
            plainTime: '12:00'
          });
          dayLabel = `${dayOfWeek} ${formatMediumDate(zonedDate)}`.toUpperCase();
        }

        return (
          <div key={group.date.toString()}>
            {/* Encabezado de día */}
            <div className="mb-3 flex items-center gap-3">
              <div className={`rounded-lg px-3 py-1.5 ${
                isToday
                  ? 'bg-blue-500/20 border border-blue-500/40'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}>
                <p className={`text-xs font-bold tracking-wide ${
                  isToday ? 'text-blue-200' : 'text-slate-400'
                }`}>
                  {dayLabel}
                </p>
              </div>
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs font-medium text-slate-500">
                {group.appointments.length} {group.appointments.length === 1 ? 'cita' : 'citas'}
              </span>
            </div>

            {/* Lista de citas del día */}
            <div className="space-y-3">
              {group.appointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  consulta={appointment.consulta}
                  onClick={() => onAppointmentClick(appointment.consulta)}
                  variant="default"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
