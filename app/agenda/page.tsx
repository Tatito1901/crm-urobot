'use client';

/**
 * ============================================================
 * AGENDA PAGE - Vista principal de agenda refactorizada
 * ============================================================
 * Interfaz profesional para visualización de citas médicas
 * - Mobile-first con diseño responsivo
 * - Búsqueda y filtros avanzados
 * - Vista de calendario y lista
 * - Detalles completos en modal
 * - Optimizada para rendimiento
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { viewDay, viewMonthGrid, viewWeek } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';

import { createScheduleXConfig, dateUtils } from '@/app/lib/agenda-config';
import { useConsultas } from '@/hooks/useConsultas';
import { filterAppointments, formatShortTime, getStatusConfig, getShortName } from './lib/agenda-utils';
import type { Consulta } from '@/types/consultas';

// Componentes
import { AppointmentModal } from './components/AppointmentModal';
import { AppointmentListView } from './components/AppointmentListView';
import { FilterBar } from './components/FilterBar';
import { QuickStats } from './components/QuickStats';
import { UpcomingAppointments } from './components/UpcomingAppointments';

// ========== TYPES ==========

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

// ========== HELPERS ==========

const getCalendarInternals = (app: ReturnType<typeof useCalendarApp>): CalendarAppInternals | null => {
  if (!app || typeof app !== 'object') return null;
  const maybeInternals = (app as unknown as CalendarAppWithInternals).$app;
  if (!maybeInternals?.calendarState || !maybeInternals.datePickerState) {
    return null;
  }
  return maybeInternals;
};

const VIEWS = [
  { key: viewWeek.name, label: 'Semana' },
  { key: viewDay.name, label: 'Día' },
  { key: viewMonthGrid.name, label: 'Mes' },
];

// ========== MAIN COMPONENT ==========

export default function AgendaPage() {
  // Estado de datos
  const { consultas, loading } = useConsultas();

  // Debug: Log cuando cambien las consultas
  React.useEffect(() => {
    console.log('[Agenda Page] Consultas cargadas:', consultas.length);
    console.log('[Agenda Page] Loading:', loading);
  }, [consultas, loading]);

  // Estado de UI
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [vistaCalendario, setVistaCalendario] = useState<string>(viewWeek.name);
  const [selectedAppointment, setSelectedAppointment] = useState<Consulta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSede, setSelectedSede] = useState<'ALL' | 'POLANCO' | 'SATELITE'>('ALL');
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyPendingConfirmation, setOnlyPendingConfirmation] = useState(false);

  // Configuración del calendario
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

  // Filtrar consultas
  const filteredConsultas = useMemo(() => {
    const filtered = filterAppointments(consultas, {
      searchQuery,
      sede: selectedSede,
      estados: selectedEstados,
      onlyToday,
      onlyPendingConfirmation,
    });
    console.log('[Agenda] Filtrado:', {
      total: consultas.length,
      filtradas: filtered.length,
      filtros: { searchQuery, selectedSede, estados: selectedEstados.length, onlyToday, onlyPendingConfirmation }
    });
    return filtered;
  }, [consultas, searchQuery, selectedSede, selectedEstados, onlyToday, onlyPendingConfirmation]);

  // Convertir consultas a eventos del calendario
  const events: CalendarEvent[] = useMemo(() => {
    console.log('[Agenda] Total consultas filtradas:', filteredConsultas.length);

    return filteredConsultas.map((consulta) => {
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
  }, [filteredConsultas]);

  // Actualizar eventos del calendario
  React.useEffect(() => {
    // Convertir eventos a formato Schedule-X (sin campo consulta)
    const scheduleXEvents = events.map(({ consulta: _, ...event }) => event);
    console.log('[Agenda] Actualizando calendario con', scheduleXEvents.length, 'eventos');
    eventsService.set(scheduleXEvents);
  }, [events, eventsService]);

  // Cambiar vista del calendario
  React.useEffect(() => {
    if (!calendarApp || !vistaCalendario) return;
    const internals = getCalendarInternals(calendarApp);
    if (!internals) return;
    const { calendarState, datePickerState } = internals;
    const selectedDate = datePickerState.selectedDate.value;
    if (!selectedDate) return;
    calendarState.setView(vistaCalendario, selectedDate);
  }, [calendarApp, vistaCalendario]);

  // Calcular el label del rango de fechas
  const rangeLabel = useMemo(() => {
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

  // Navegación de fechas
  const navigateDate = useCallback((direction: 'prev' | 'today' | 'next') => {
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
  }, [calendarApp, vistaCalendario]);

  // Próximas citas
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => Temporal.ZonedDateTime.compare(event.start, Temporal.Now.zonedDateTimeISO(calendarConfig.timezone)) >= 0)
      .sort((a, b) => Temporal.ZonedDateTime.compare(a.start, b.start))
      .slice(0, 5);
  }, [events, calendarConfig.timezone]);

  // Handlers
  const handleAppointmentClick = useCallback((consulta: Consulta) => {
    setSelectedAppointment(consulta);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAppointment(null), 300);
  }, []);

  // ========== RENDER ==========

  return (
    <div className="min-h-screen bg-[#0b0f16] font-sans">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:flex-row lg:gap-8">

        {/* SIDEBAR IZQUIERDO - Desktop */}
        <aside className="order-last hidden w-full max-w-[280px] shrink-0 lg:order-first lg:block">
          <div className="sticky top-6 space-y-6">
            {/* Estadísticas */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d1118] p-5 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)]">
              <QuickStats consultas={filteredConsultas} />
            </div>

            {/* Próximas citas */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d1118] p-5 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)]">
              <UpcomingAppointments
                events={upcomingEvents}
                onAppointmentClick={handleAppointmentClick}
              />
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="order-first flex w-full flex-1 flex-col gap-6 lg:order-last">

          {/* HEADER */}
          <header className="rounded-2xl border border-slate-800 bg-[#0d1118] px-5 py-6 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)]">
            <div className="flex flex-col gap-5">

              {/* Título y status */}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CRM · Agenda</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">Agenda de Consultas</h1>
                  <span className="rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
                    Sincronización activa
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {loading ? 'Sincronizando...' : `${filteredConsultas.length} ${filteredConsultas.length === 1 ? 'cita' : 'citas'} · Dr. Mario Martínez Thomas`}
                </p>
              </div>

              {/* Barra de filtros */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSede={selectedSede}
                onSedeChange={setSelectedSede}
                selectedEstados={selectedEstados}
                onEstadosChange={setSelectedEstados}
                onlyToday={onlyToday}
                onOnlyTodayChange={setOnlyToday}
                onlyPendingConfirmation={onlyPendingConfirmation}
                onOnlyPendingConfirmationChange={setOnlyPendingConfirmation}
                totalResults={filteredConsultas.length}
              />

              {/* Controles de navegación y vista */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                {/* Navegación de fechas - Solo en vista calendario */}
                {viewMode === 'calendar' && (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-300">
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
                )}

                {/* Selector de modo (Calendario/Lista) */}
                <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 p-1 text-xs font-medium text-slate-300">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition-all ${
                      viewMode === 'calendar'
                        ? 'bg-blue-500 text-white shadow-[0_10px_30px_-15px_rgba(59,130,246,0.9)]'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendario
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition-all ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white shadow-[0_10px_30px_-15px_rgba(59,130,246,0.9)]'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Lista
                  </button>
                </div>

                {/* Selector de vista de calendario - Solo en modo calendario */}
                {viewMode === 'calendar' && (
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
                )}
              </div>
            </div>
          </header>

          {/* CONTENIDO - Calendario o Lista */}
          <section className="rounded-2xl border border-slate-800 bg-[#0d1118] shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)]">
            {viewMode === 'calendar' ? (
              <div className="sx-calendar-container w-full overflow-hidden rounded-2xl">
                <div className="w-full min-w-0 h-[520px] sm:h-[620px] lg:h-[720px] xl:h-[780px]">
                  <ScheduleXCalendar calendarApp={calendarApp} />
                </div>
              </div>
            ) : (
              <div className="p-6">
                <AppointmentListView
                  events={events}
                  onAppointmentClick={handleAppointmentClick}
                  emptyMessage={
                    searchQuery || selectedSede !== 'ALL' || selectedEstados.length > 0
                      ? 'No se encontraron citas con los filtros aplicados'
                      : 'No hay citas programadas'
                  }
                />
              </div>
            )}
          </section>

          {/* PRÓXIMAS CITAS - Mobile */}
          <section className="block rounded-2xl border border-slate-800 bg-[#0d1118] p-5 shadow-[0_25px_70px_-40px_rgba(8,13,23,0.9)] lg:hidden">
            <UpcomingAppointments
              events={upcomingEvents}
              onAppointmentClick={handleAppointmentClick}
            />
          </section>
        </main>
      </div>

      {/* MODAL DE DETALLES */}
      <AppointmentModal
        consulta={selectedAppointment}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
