'use client';

/**
 * ============================================================
 * AGENDA PAGE - Vista principal de agenda (OPTIMIZADA)
 * ============================================================
 * Interfaz profesional para visualización de citas médicas
 * - Mobile-first con diseño responsivo
 * - Búsqueda y filtros avanzados
 * - Vista de calendario y lista
 * - Detalles completos en modal
 * - ✨ Schedule-X lazy-loaded (~150KB reducidos del bundle inicial)
 */

import React, { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Temporal } from '@js-temporal/polyfill';

import { useConsultas } from '@/hooks/useConsultas';
import { filterAppointments, getShortName } from './lib/agenda-utils';
import type { Consulta } from '@/types/consultas';

// Componentes estáticos
import { AppointmentModal } from './components/AppointmentModal';
import { AppointmentListView } from './components/AppointmentListView';
import { FilterBar } from './components/FilterBar';
import { QuickStats } from './components/QuickStats';
import { UpcomingAppointments } from './components/UpcomingAppointments';
import { CalendarSkeleton } from './components/CalendarSkeleton';

// ✅ OPTIMIZACIÓN: Lazy load del calendario Schedule-X (~150KB)
// Solo se carga cuando el usuario selecciona la vista de calendario
const CalendarView = dynamic(
  () => import('./components/CalendarView').then((mod) => ({ default: mod.CalendarView })),
  {
    ssr: false,
    loading: () => <CalendarSkeleton />,
  }
);

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

// ========== HELPERS ==========

const VIEWS = [
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Día' },
  { key: 'month-grid', label: 'Mes' },
];

// ========== MAIN COMPONENT ==========

export default function AgendaPage() {
  // Estado de datos
  const { consultas, loading } = useConsultas();

  // Estado de UI
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [vistaCalendario, setVistaCalendario] = useState<string>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Consulta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSede, setSelectedSede] = useState<'ALL' | 'POLANCO' | 'SATELITE'>('ALL');
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyPendingConfirmation, setOnlyPendingConfirmation] = useState(false);

  // Filtrar consultas
  const filteredConsultas = useMemo(() => {
    return filterAppointments(consultas, {
      searchQuery,
      sede: selectedSede,
      estados: selectedEstados,
      onlyToday,
      onlyPendingConfirmation,
    });
  }, [consultas, searchQuery, selectedSede, selectedEstados, onlyToday, onlyPendingConfirmation]);

  // Convertir consultas a eventos (solo para lista y próximas citas)
  const events: CalendarEvent[] = useMemo(() => {
    return filteredConsultas.map((consulta) => {
      const timezone = consulta.timezone ?? 'America/Mexico_City';
      const fechaConsulta = consulta.fechaConsulta ?? Temporal.Now.plainDateISO(timezone).toString();
      const horaConsulta = consulta.horaConsulta && consulta.horaConsulta.trim().length > 0 ? consulta.horaConsulta : '00:00:00';

      const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
      const fechaInicio = fechaBase.toZonedDateTime(timezone);
      const fechaFin = fechaInicio.add({ minutes: consulta.duracionMinutos ?? 45 });

      const nombrePaciente = getShortName(consulta.paciente);

      return {
        id: consulta.uuid,
        title: nombrePaciente,
        start: fechaInicio,
        end: fechaFin,
        calendarId: (consulta.estado ?? 'PROGRAMADA').toLowerCase(),
        consulta,
      } satisfies CalendarEvent;
    });
  }, [filteredConsultas]);

  // Próximas citas
  const upcomingEvents = useMemo(() => {
    const now = Temporal.Now.zonedDateTimeISO('America/Mexico_City');
    return [...events]
      .filter((event) => Temporal.ZonedDateTime.compare(event.start, now) >= 0)
      .sort((a, b) => Temporal.ZonedDateTime.compare(a.start, b.start))
      .slice(0, 5);
  }, [events]);

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

              {/* Controles de vista */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

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
              <CalendarView
                consultas={filteredConsultas}
                vistaCalendario={vistaCalendario}
              />
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
