/**
 * ============================================================
 * UPCOMING APPOINTMENTS - Lista de próximas citas
 * ============================================================
 */

import React from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { AppointmentCard } from './AppointmentCard';
import type { Consulta } from '@/types/consultas';

interface CalendarEvent {
  id: string;
  start: Temporal.ZonedDateTime;
  consulta: Consulta;
}

interface UpcomingAppointmentsProps {
  events: CalendarEvent[];
  onAppointmentClick: (consulta: Consulta) => void;
  maxItems?: number;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = React.memo(({
  events,
  onAppointmentClick,
  maxItems = 5,
}) => {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
        <svg className="mx-auto mb-2 h-10 w-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-slate-500">Sin citas próximas</p>
      </div>
    );
  }

  const displayedEvents = events.slice(0, maxItems);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Próximas Citas</p>
        {events.length > maxItems && (
          <span className="text-xs text-slate-500">
            Mostrando {maxItems} de {events.length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {displayedEvents.map((event) => (
          <AppointmentCard
            key={event.id}
            consulta={event.consulta}
            onClick={() => onAppointmentClick(event.consulta)}
            variant="compact"
          />
        ))}
      </div>

      {events.length > maxItems && (
        <button className="w-full rounded-lg border border-slate-700 bg-slate-800/40 py-2 text-xs font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800">
          Ver todas las citas ({events.length})
        </button>
      )}
    </div>
  );
});

UpcomingAppointments.displayName = 'UpcomingAppointments';
