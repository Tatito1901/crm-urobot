'use client';

/**
 * ============================================================
 * CALENDAR VIEW - Componente lazy-loaded del calendario
 * ============================================================
 * Contiene la lógica de Schedule-X separada para optimizar bundle size.
 * Este componente se carga dinámicamente solo cuando es necesario.
 */

import React, { useMemo, useEffect } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { viewDay, viewMonthGrid, viewWeek } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';

import { createScheduleXConfig } from '@/app/lib/agenda-config';
import type { Consulta } from '@/types/consultas';
import { formatShortTime, getStatusConfig, getShortName } from '../lib/agenda-utils';

type CalendarEvent = {
  id: string;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  calendarId: string;
  consulta: Consulta;
  _customContent?: {
    timeGrid?: string;
  };
};

interface CalendarViewProps {
  /** Consultas filtradas a mostrar */
  consultas: Consulta[];
  /** Vista actual del calendario */
  vistaCalendario: string;
  /** Callback cuando cambia la vista */
  onViewChange?: (view: string) => void;
}

/**
 * Componente del calendario Schedule-X
 * Se carga dinámicamente para reducir bundle inicial
 */
export function CalendarView({ consultas, vistaCalendario }: CalendarViewProps) {
  // Configuración del calendario
  const calendarConfig = useMemo(() => {
    const selectedDate = Temporal.Now.plainDateISO('America/Mexico_City');
    return createScheduleXConfig(selectedDate);
  }, []);

  const eventsService = useMemo(() => createEventsServicePlugin(), []);

  const calendarApp = useCalendarApp({
    ...calendarConfig,
    defaultView: viewWeek.name,
    views: [viewWeek, viewDay, viewMonthGrid],
    plugins: [eventsService],
    events: [],
  });

  // Convertir consultas a eventos del calendario
  const events: CalendarEvent[] = useMemo(() => {
    return consultas.map((consulta) => {
      const timezone = consulta.timezone ?? 'America/Mexico_City';
      const fechaConsulta = consulta.fechaConsulta ?? Temporal.Now.plainDateISO(timezone).toString();
      const horaConsulta = consulta.horaConsulta && consulta.horaConsulta.trim().length > 0 ? consulta.horaConsulta : '00:00:00';

      const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
      const fechaInicio = fechaBase.toZonedDateTime(timezone);
      const fechaFin = fechaInicio.add({ minutes: consulta.duracionMinutos ?? 45 });

      const nombrePaciente = getShortName(consulta.paciente);
      const motivo = consulta.motivoConsulta ?? consulta.tipo ?? 'Consulta';
      const estado = (consulta.estado ?? 'PROGRAMADA').toLowerCase();
      const statusConfig = getStatusConfig(estado);

      const startTime = formatShortTime(fechaInicio);
      const endTime = formatShortTime(fechaFin);
      const horario = `${startTime} – ${endTime}`;

      return {
        id: consulta.uuid,
        title: nombrePaciente,
        start: fechaInicio,
        end: fechaFin,
        calendarId: estado,
        consulta,
        _customContent: {
          timeGrid: `
            <div class="sx-event-content">
              <p class="sx-event-content__title" style="font-weight: 600; margin-bottom: 2px;">${nombrePaciente}</p>
              <p class="sx-event-content__meta" style="font-size: 11px; opacity: 0.9;">${horario} · ${motivo}</p>
              <p class="sx-event-content__extra" style="font-size: 10px; opacity: 0.8; margin-top: 2px;">${consulta.sede} · ${statusConfig.label}</p>
            </div>
          `,
        },
      } satisfies CalendarEvent;
    });
  }, [consultas]);

  // Actualizar eventos del calendario
  useEffect(() => {
    eventsService.set(events);
  }, [events, eventsService]);

  // Cambiar vista del calendario
  useEffect(() => {
    if (!calendarApp || !vistaCalendario) return;

    // Type-safe access to internal calendar state
    const app = calendarApp as unknown as {
      $app?: {
        calendarState?: { setView: (view: string, date: unknown) => void };
        datePickerState?: { selectedDate: { value: unknown } };
      };
    };

    if (!app.$app?.calendarState || !app.$app?.datePickerState) return;

    const { calendarState, datePickerState } = app.$app;
    const selectedDate = datePickerState.selectedDate.value;
    if (!selectedDate) return;

    calendarState.setView(vistaCalendario, selectedDate);
  }, [calendarApp, vistaCalendario]);

  return (
    <div className="sx-calendar-container w-full overflow-hidden">
      <div className="w-full min-w-0 h-[600px] sm:h-[680px] lg:h-[760px] xl:h-[820px]">
        <ScheduleXCalendar calendarApp={calendarApp} />
      </div>
    </div>
  );
}
