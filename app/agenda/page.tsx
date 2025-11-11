'use client';

import React, { useMemo, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { viewDay, viewMonthGrid, viewWeek } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';

import { createScheduleXConfig, dateUtils, type SedeKey } from '@/app/lib/agenda-config';
import { useConsultas } from '@/hooks/useConsultas';

type CalendarEvent = {
  id: string;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  calendarId: string;
  _customContent?: {
    timeGrid?: string;
  };
};

type CalendarAppInternals = {
  calendarState: {
    setView: (view: string, selectedDate: Temporal.PlainDate) => void;
    setRange: (date: Temporal.PlainDate) => void;
  };
  datePickerState: {
    selectedDate: { value: Temporal.PlainDate };
  };
};

type CalendarAppWithInternals = {
  $app?: CalendarAppInternals;
};

const getCalendarInternals = (app: ReturnType<typeof useCalendarApp>): CalendarAppInternals | null => {
  if (!app || typeof app !== 'object') return null;
  const maybeInternals = (app as unknown as CalendarAppWithInternals).$app;
  if (!maybeInternals?.calendarState || !maybeInternals.datePickerState) {
    return null;
  }
  return maybeInternals;
};

const VISTAS: Record<'UNIFICADO' | 'POLANCO' | 'SATELITE', { label: string; sede?: SedeKey }> = {
  UNIFICADO: { label: 'Todas las sedes' },
  POLANCO: { label: 'Polanco', sede: 'POLANCO' },
  SATELITE: { label: 'Satélite', sede: 'SATELITE' },
};

const VIEWS = [
  { key: viewWeek.name, label: 'Semana' },
  { key: viewDay.name, label: 'Día' },
  { key: viewMonthGrid.name, label: 'Mes' },
];

const ESTADO_LABELS: Record<string, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  reagendada: 'Reagendada',
  cancelada: 'Cancelada',
};

const getEstadoLabel = (estado: string) => ESTADO_LABELS[estado] ?? estado.charAt(0).toUpperCase() + estado.slice(1);

const formatHourMinute = (date: Temporal.ZonedDateTime) => date.toPlainTime().toString().slice(0, 5);

// Eliminada formatDayBadge - no se usa actualmente

export default function AgendaPage() {
  const [vistaActiva, setVistaActiva] = useState<keyof typeof VISTAS>('UNIFICADO');
  const [vistaCalendario, setVistaCalendario] = useState<string>(viewWeek.name);
  const { consultas, loading } = useConsultas();

  const calendarConfig = useMemo(() => {
    const selectedDate = dateUtils.toPlainDate(new Date());
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

  const events: CalendarEvent[] = useMemo(() => {
    const filtro = VISTAS[vistaActiva].sede;
    return consultas
      .filter((consulta) => (filtro ? consulta.sede === filtro : true))
      .map((consulta) => {
        const timezone = consulta.timezone ?? 'America/Mexico_City';
        const fechaConsulta = consulta.fechaConsulta ?? Temporal.Now.plainDateISO(timezone).toString();
        const horaConsulta = consulta.horaConsulta && consulta.horaConsulta.trim().length > 0 ? consulta.horaConsulta : '00:00:00';

        const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
        const fechaInicio = fechaBase.toZonedDateTime(timezone);
        const fechaFin = fechaInicio.add({ minutes: consulta.duracionMinutos ?? 45 });

        const nombrePaciente = consulta.paciente.split(' ').slice(0, 2).join(' ');
        const motivo = consulta.motivoConsulta ?? consulta.tipo ?? 'Consulta';
        const estado = (consulta.estado ?? 'PROGRAMADA').toLowerCase();

        const startTime = formatHourMinute(fechaInicio);
        const endTime = formatHourMinute(fechaFin);
        const horario = `${startTime} – ${endTime}`;

        return {
          id: consulta.uuid,
          title: nombrePaciente,
          start: fechaInicio,
          end: fechaFin,
          calendarId: estado,
          _customContent: {
            timeGrid: `
              <div class="sx-event-content">
                <p class="sx-event-content__title">${nombrePaciente}</p>
                <p class="sx-event-content__meta">${horario} · ${motivo}</p>
                <p class="sx-event-content__extra">${consulta.sede} · ${getEstadoLabel(estado)}</p>
              </div>
            `,
          },
        } satisfies CalendarEvent;
      });
  }, [consultas, vistaActiva]);

  React.useEffect(() => {
    eventsService.set(events);
  }, [events, eventsService]);

  React.useEffect(() => {
    if (!calendarApp || !vistaCalendario) return;
    const internals = getCalendarInternals(calendarApp);
    if (!internals) return;
    const { calendarState, datePickerState } = internals;
    const selectedDate = datePickerState.selectedDate.value;
    if (!selectedDate) return;
    calendarState.setView(vistaCalendario, selectedDate);
  }, [calendarApp, vistaCalendario]);

  const rangeLabel = React.useMemo(() => {
    const internals = getCalendarInternals(calendarApp);
    if (!internals) return '';
    const selectedDate = internals.datePickerState.selectedDate.value;
    if (!selectedDate) return '';
    if (vistaCalendario === viewDay.name) {
      return dateUtils.formatRange(selectedDate, 'day');
    }
    if (vistaCalendario === viewWeek.name) {
      return dateUtils.formatRange(selectedDate, 'week');
    }
    return `${dateUtils.monthName(selectedDate.month)} ${selectedDate.year}`;
  }, [calendarApp, vistaCalendario]);

  const navigateDate = (direction: 'prev' | 'today' | 'next') => {
    const internals = getCalendarInternals(calendarApp);
    if (!internals) return;
    const { datePickerState, calendarState } = internals;
    const currentDate = datePickerState.selectedDate.value;

    if (direction === 'today') {
      const today = dateUtils.toPlainDate(new Date());
      datePickerState.selectedDate.value = today;
      calendarState.setRange(today);
      return;
    }

    const delta =
      vistaCalendario === viewDay.name ? { days: direction === 'next' ? 1 : -1 } :
      vistaCalendario === viewWeek.name ? { days: direction === 'next' ? 7 : -7 } :
      { months: direction === 'next' ? 1 : -1 };

    datePickerState.selectedDate.value = currentDate.add(delta);
    calendarState.setRange(datePickerState.selectedDate.value);
  };

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => Temporal.ZonedDateTime.compare(event.start, Temporal.Now.zonedDateTimeISO(calendarConfig.timezone)) >= 0)
      .sort((a, b) => Temporal.ZonedDateTime.compare(a.start, b.start))
      .slice(0, 5);
  }, [events, calendarConfig.timezone]);

  return (
    <div className="min-h-screen bg-[#0b0f16] font-sans">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:flex-row lg:gap-8">
        <aside className="order-last hidden w-full max-w-[280px] shrink-0 rounded-2xl border border-slate-800 bg-[#0d1118] p-5 text-slate-200 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)] lg:order-first lg:block">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vistas</p>
              <h2 className="mt-1 text-lg font-semibold">Sedes & filtros</h2>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-500">GMT-6</span>
          </div>

          <div className="mt-5 space-y-2">
            {Object.entries(VISTAS).map(([key, vista]) => (
              <button
                key={key}
                onClick={() => setVistaActiva(key as keyof typeof VISTAS)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  vistaActiva === key
                    ? 'border-blue-500 bg-blue-500/10 text-blue-100'
                    : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span>{vista.label}</span>
                {vista.sede ? <span className="text-xs uppercase tracking-wide text-slate-500">{vista.sede}</span> : null}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-3 text-sm text-slate-400">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Próximas citas</p>
            <div className="space-y-2">
              {upcomingEvents.length === 0 && <p className="text-xs text-slate-600">Sin eventos próximos</p>}
              {upcomingEvents.map((event) => {
                const startTime = event.start.toPlainTime().toString().slice(0, 5);
                const dayLabel = `${event.start.day}-${event.start.month}`;
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">{event.title}</p>
                      <p className="text-xs text-slate-500">{startTime} · {event.calendarId}</p>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-500">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="order-first flex w-full flex-1 flex-col gap-6 lg:order-last">
          <header className="rounded-2xl border border-slate-800 bg-[#0d1118] px-5 py-6 text-slate-200 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CRM · Agenda</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold">Agenda de Consultas</h1>
                  <span className="rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
                    Tiempo real activado
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {loading ? 'Sincronizando eventos…' : `Eventos sincronizados (${events.length}) · actualizado en vivo`}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="rounded-lg p-2 text-sm hover:bg-slate-800"
                    aria-label="Ver periodo anterior"
                  >
                    ←
                  </button>
                  <span className="px-3 text-sm font-medium text-slate-100">{rangeLabel}</span>
                  <button
                    onClick={() => navigateDate('next')}
                    className="rounded-lg p-2 text-sm hover:bg-slate-800"
                    aria-label="Ver periodo siguiente"
                  >
                    →
                  </button>
                  <button
                    onClick={() => navigateDate('today')}
                    className="ml-3 rounded-lg border border-blue-500/60 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 hover:bg-blue-500/20"
                  >
                    Hoy
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 p-1 text-xs font-medium text-slate-300">
                  {VIEWS.map((view) => (
                    <button
                      key={view.key}
                      onClick={() => setVistaCalendario(view.key)}
                      className={`rounded-full px-4 py-2 transition-all ${
                        vistaCalendario === view.key
                          ? 'bg-blue-500 text-white shadow-[0_10px_30px_-15px_rgba(59,130,246,0.9)]'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <section className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 rounded-2xl border border-slate-800 bg-[#0d1118] shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)]">
              <div className="sx-calendar-container w-full overflow-hidden rounded-2xl">
                <div className="w-full min-w-0 h-[520px] sm:h-[620px] lg:h-[720px] xl:h-[780px]">
                  <ScheduleXCalendar calendarApp={calendarApp} />
                </div>
              </div>
            </div>

            <div className="hidden w-full max-w-[320px] shrink-0 rounded-2xl border border-slate-800 bg-[#0d1118] p-5 text-slate-200 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)] lg:block">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado de la agenda</p>
              <h2 className="mt-2 text-xl font-semibold">Resumen rápido</h2>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total eventos</p>
                    <p className="text-lg font-semibold text-slate-100">{events.length}</p>
                  </div>
                  <span className="h-10 w-10 rounded-full bg-blue-500/15 text-center text-lg leading-10 text-blue-300">📆</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Filtrado</p>
                    <p className="text-sm font-medium text-slate-100">{VISTAS[vistaActiva].label}</p>
                  </div>
                  <span className="h-10 w-10 rounded-full bg-green-500/15 text-center text-lg leading-10 text-green-300">🔍</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Vista activa</p>
                    <p className="text-sm font-medium text-slate-100">{VIEWS.find((view) => view.key === vistaCalendario)?.label}</p>
                  </div>
                  <span className="h-10 w-10 rounded-full bg-yellow-500/15 text-center text-lg leading-10 text-yellow-300">👁️</span>
                </div>
              </div>
            </div>
          </section>

          <section className="block rounded-2xl border border-slate-800 bg-[#0d1118] p-5 text-slate-200 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)] lg:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-100">{VISTAS[vistaActiva].label}</span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-green-400" /> Tiempo real
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">GMT-6</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-400">
              {upcomingEvents.length === 0 && <p className="text-xs text-slate-600">Sin eventos próximos</p>}
              {upcomingEvents.map((event) => {
                const startTime = event.start.toPlainTime().toString().slice(0, 5);
                const dayLabel = `${event.start.day}/${event.start.month}`;
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{event.title}</p>
                      <p className="text-xs text-slate-500">{startTime} · {event.calendarId}</p>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-500">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
