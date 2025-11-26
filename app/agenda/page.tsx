/**
 * ============================================================
 * AGENDA PAGE - Vista de calendario profesional mejorada
 * ============================================================
 * Sistema completo de gestión de consultas médicas
 */

'use client';

// ✅ OPTIMIZACIÓN: Importar polyfill solo en esta página que lo necesita
import '@js-temporal/polyfill';
import React, { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { startOfWeek } from '@/lib/date-utils';
import { useAgendaState } from './hooks/useAgendaState';
import { useConsultas } from '@/hooks/useConsultas';
import type { Consulta } from '@/types/consultas';
import type { Appointment } from '@/types/agenda';
import type { CreateAppointmentData, UpdateAppointmentData } from './services/appointments-service';
import { Sidebar } from './components/calendar/Sidebar';
import { HeaderBar } from './components/calendar/HeaderBar';
import { DaysHeader } from './components/calendar/DaysHeader';
import { TimeGrid } from './components/calendar/TimeGrid';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment as cancelAppointmentService,
  confirmAppointment as confirmAppointmentService,
  markPatientArrived as markPatientArrivedService,
} from './services/appointments-service';

// Lazy load de componentes pesados (reduce bundle inicial)
const ListView = lazy(() => import('./components/calendar/ListView').then(m => ({ default: m.ListView })));
const FiltersPanel = lazy(() => import('./components/calendar/FiltersPanel').then(m => ({ default: m.FiltersPanel })));
const MonthGrid = lazy(() => import('./components/calendar/MonthGrid').then(m => ({ default: m.MonthGrid })));
const HeatmapView = lazy(() => import('./components/calendar/HeatmapView').then(m => ({ default: m.HeatmapView })));
const CreateAppointmentModal = lazy(() => import('./components/modals/CreateAppointmentModal').then(m => ({ default: m.CreateAppointmentModal })));
const AppointmentDetailsModal = lazy(() => import('./components/modals/AppointmentDetailsModal').then(m => ({ default: m.AppointmentDetailsModal })));
const EditAppointmentModal = lazy(() => import('./components/modals/EditAppointmentModal').then(m => ({ default: m.EditAppointmentModal })));

// Lazy load del Sidebar solo para mobile (desktop se importa estático arriba)
// Nota: Usamos el mismo componente pero cargado dinámicamente
const MobileSidebar = lazy(() => import('./components/calendar/Sidebar').then(m => ({ default: m.Sidebar })));

// Loading fallback optimizado
const ModalLoader = () => <div className="flex items-center justify-center p-4"><div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>;

// Adaptador: Convierte Consulta a Appointment
function consultaToAppointment(consulta: Consulta): Appointment {
  let startDateTime: Temporal.ZonedDateTime;

  try {
    // Preferir fecha_hora_utc (consulta.fecha) y convertirla al timezone local
    if (consulta.fecha) {
      // Sanitizar fecha (reemplazar espacio por T si es necesario)
      // Formato esperado: 2025-05-23 09:30:00+00
      // Formato Temporal: 2025-05-23T09:30:00+00:00
      let sanitizedDate = consulta.fecha.trim().replace(' ', 'T');
      
      // Asegurar que tenga offset o Z. Si termina en +00, añadir :00
      if (sanitizedDate.endsWith('+00')) {
        sanitizedDate += ':00';
      }
      
      const instant = Temporal.Instant.from(sanitizedDate);
      startDateTime = instant.toZonedDateTimeISO(consulta.timezone);
    } else {
      throw new Error('Missing fecha');
    }
  } catch {
    // Fallback: usar fechaConsulta + horaConsulta como hora local
    const [yearStr, monthStr, dayStr] = consulta.fechaConsulta.split('-');
    const [hourStr, minuteStr, secondStr] = consulta.horaConsulta.split(':');

    startDateTime = Temporal.ZonedDateTime.from({
      timeZone: consulta.timezone,
      year: parseInt(yearStr),
      month: parseInt(monthStr),
      day: parseInt(dayStr),
      hour: parseInt(hourStr || '0'),
      minute: parseInt(minuteStr || '0'),
      second: parseInt((secondStr ?? '0') || '0'),
    });
  }

  const endDateTime = startDateTime.add({ minutes: consulta.duracionMinutos });

  return {
    id: consulta.id,
    uuid: consulta.uuid,
    pacienteId: consulta.pacienteId || '',
    paciente: consulta.paciente,
    telefono: null,
    email: null,
    start: startDateTime,
    end: endDateTime,
    timezone: consulta.timezone,
    duracionMinutos: consulta.duracionMinutos,
    sede: consulta.sede,
    consultorio: null,
    tipo: consulta.tipo,
    prioridad: 'normal',
    modalidad: 'presencial',
    motivoConsulta: consulta.motivoConsulta,
    notasInternas: null,
    requisitosEspeciales: null,
    estado: consulta.estado,
    estadoConfirmacion: consulta.estadoConfirmacion,
    confirmadoPaciente: consulta.confirmadoPaciente,
    confirmadoEn: null,
    canalOrigen: consulta.canalOrigen || 'Sistema',
    calendarEventId: consulta.calendarEventId,
    calendarLink: consulta.calendarLink,
    canceladoPor: consulta.canceladoPor || null,
    canceladoEn: null,
    motivoCancelacion: consulta.motivoCancelacion || null,
    creadoPor: null,
    createdAt: consulta.createdAt,
    updatedAt: consulta.updatedAt,
  };
}

export default function AgendaPage() {
  // Estado: fecha seleccionada (SIEMPRE iniciar en HOY)
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Estado: inicio de la semana actual (SIEMPRE iniciar en semana de HOY)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));
  const [monthViewCurrent, setMonthViewCurrent] = useState(() => new Date());

  // Estado global de agenda
  const {
    viewMode,
    setViewMode,
    getHourBounds,
    searchQuery,
    selectedSede,
    selectedEstados,
    selectedTipos,
    selectedPrioridades,
    onlyToday,
    onlyPendingConfirmation,
    isCreateModalOpen,
    isDetailsModalOpen,
    isEditModalOpen,
    selectedAppointment,
    selectedSlot,
    closeCreateModal,
    closeDetailsModal,
    closeEditModal,
    openEditModal,
    isSidebarOpen,
    setIsSidebarOpen,
    visibleSedes, // Nuevo estado
  } = useAgendaState();
  
  // Obtener rango de horas dinámico
  const { startHour, endHour } = getHourBounds();

  // Cargar consultas
  const { consultas, refetch } = useConsultas();

  // RESPONSIVIDAD: Cambiar a vista de día automáticamente en móviles
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode !== 'day' && viewMode !== 'list') {
        setViewMode('day');
      }
    };

    // Check inicial
    handleResize();

    // Listener opcional (puede ser costoso, pero útil si rotan pantalla)
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setViewMode, viewMode]);

  // Convertir consultas a appointments (memoizado para evitar recálculos)
  const appointments = useMemo(() => consultas.map(consultaToAppointment), [consultas]);

  // Cuando se selecciona una fecha en el mini-calendario, ir a esa semana y cambiar modo si es necesario
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentWeekStart(startOfWeek(date));
    setMonthViewCurrent(date);
    
    // Si cambia de semana, asegurar vista semanal
    const state = useAgendaState.getState();
    if (state.viewMode === 'list' || state.viewMode === 'month') {
      state.setViewMode('week');
    }
  }, []);

  // Filtrar consultas según filtros activos
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Búsqueda global
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          apt.paciente.toLowerCase().includes(query) ||
          (apt.telefono && apt.telefono.includes(query)) ||
          (apt.email && apt.email.toLowerCase().includes(query)) ||
          (apt.motivoConsulta && apt.motivoConsulta.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Filtro de sede (Dropdown)
      if (selectedSede !== 'ALL' && apt.sede !== selectedSede) return false;

      // Filtro de visibilidad de sede (Checkboxes)
      if (apt.sede && visibleSedes[apt.sede] === false) return false;

      // Filtro de estados
      if (selectedEstados.length > 0 && !selectedEstados.includes(apt.estado)) return false;

      // Filtro de tipos
      if (selectedTipos.length > 0 && !selectedTipos.includes(apt.tipo)) return false;

      // Filtro de prioridades
      if (selectedPrioridades.length > 0 && !selectedPrioridades.includes(apt.prioridad))
        return false;

      // Solo hoy
      if (onlyToday) {
        const today = Temporal.Now.plainDateISO('America/Mexico_City');
        const aptDate = apt.start.toPlainDate();
        if (!aptDate.equals(today)) return false;
      }

      // Solo pendientes de confirmación
      if (onlyPendingConfirmation && apt.confirmadoPaciente) return false;

      return true;
    });
  }, [
    appointments,
    searchQuery,
    selectedSede,
    selectedEstados,
    selectedTipos,
    selectedPrioridades,
    onlyToday,
    onlyPendingConfirmation,
    visibleSedes, // ✅ AÑADIDO: Dependencia crítica para re-filtrar al hacer toggle
  ]);

  // Calcular estadísticas (optimizado con single pass)
  const stats = useMemo(() => {
    const today = Temporal.Now.plainDateISO('America/Mexico_City');
    let todayCount = 0;
    let pendingCount = 0;
    
    // Single loop para mejorar performance
    for (const apt of filteredAppointments) {
      if (apt.start.toPlainDate().equals(today)) todayCount++;
      if (!apt.confirmadoPaciente && apt.estado === 'Programada') pendingCount++;
    }

    return {
      total: filteredAppointments.length,
      today: todayCount,
      pending: pendingCount,
    };
  }, [filteredAppointments]);

  const calendarBaseDate = viewMode === 'day' ? selectedDate : currentWeekStart;
  const timeGridMode: 'week' | 'day' = viewMode === 'day' ? 'day' : 'week';

  // Handlers de modales
  const handleCreateAppointment = async (data: Omit<CreateAppointmentData, 'slotId' | 'start' | 'end' | 'timezone'>) => {
    try {
      if (!selectedSlot?.start || !selectedSlot?.end) {
        return { success: false, error: 'No se ha seleccionado un horario válido' };
      }

      const result = await createAppointment({
        ...data,
        slotId: selectedSlot.id || '',
        start: selectedSlot.start,
        end: selectedSlot.end,
        timezone: 'America/Mexico_City',
      });

      if (result.success) {
        await refetch();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      // Adaptar Partial<Appointment> a UpdateAppointmentData
      const updateData: UpdateAppointmentData = {};

      if (updates.start) updateData.start = updates.start;
      if (updates.end) updateData.end = updates.end;
      if (updates.duracionMinutos !== undefined) updateData.duracionMinutos = updates.duracionMinutos;
      if (updates.tipo !== undefined) updateData.tipo = updates.tipo;
      if (updates.motivoConsulta !== undefined) updateData.motivoConsulta = updates.motivoConsulta ?? undefined;
      if (updates.notasInternas !== undefined) updateData.notasInternas = updates.notasInternas ?? undefined;
      if (updates.prioridad !== undefined) updateData.prioridad = updates.prioridad;
      if (updates.modalidad !== undefined) updateData.modalidad = updates.modalidad;
      if (updates.sede !== undefined) updateData.sede = updates.sede;

      const result = await updateAppointment(id, updateData);

      if (result.success) {
        await refetch();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  };

  const handleCancelAppointment = async (id: string, reason: string) => {
    try {
      const result = await cancelAppointmentService(id, {
        reason,
        cancelledBy: 'asistente',
      });

      if (result.success) {
        await refetch();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  };

  const handleConfirmAppointment = async (id: string) => {
    try {
      const result = await confirmAppointmentService(id);

      if (result.success) {
        await refetch();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  };

  const handlePatientArrived = async (id: string) => {
    try {
      const result = await markPatientArrivedService(id);

      if (result.success) {
        await refetch();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar unificado - Desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0 z-30 relative">
          <Sidebar 
            selectedDate={selectedDate} 
            onDateSelect={handleDateSelect}
            onCreateAppointment={() => {
              const state = useAgendaState.getState();
              state.openCreateModal();
            }}
            onAppointmentClick={(consulta) => {
              const appointment = consultaToAppointment(consulta);
              const state = useAgendaState.getState();
              state.openDetailsModal(appointment);
            }}
          />
        </div>

        {/* Sidebar unificado - Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[150] lg:hidden flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar Content */}
            <div className="relative w-[85%] max-w-[340px] h-full shadow-2xl animate-in slide-in-from-left duration-300 bg-sidebar">
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><ModalLoader /></div>}>
                <MobileSidebar 
                  selectedDate={selectedDate} 
                  onDateSelect={(date) => {
                    handleDateSelect(date);
                    setIsSidebarOpen(false); // Close on select
                  }}
                  onCreateAppointment={() => {
                    const state = useAgendaState.getState();
                    state.openCreateModal();
                    setIsSidebarOpen(false);
                  }}
                  onAppointmentClick={(consulta) => {
                    const appointment = consultaToAppointment(consulta);
                    const state = useAgendaState.getState();
                    state.openDetailsModal(appointment);
                    setIsSidebarOpen(false);
                  }}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* Zona principal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header de navegación con estadísticas */}
          <HeaderBar
            currentWeekStart={currentWeekStart}
            onWeekChange={setCurrentWeekStart}
            totalAppointments={stats.total}
            pendingConfirmation={stats.pending}
            todayAppointments={stats.today}
          />

          {/* Panel de filtros */}
          <Suspense fallback={null}>
            <FiltersPanel />
          </Suspense>

          {/* Área del calendario o lista */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {viewMode === 'list' ? (
              <Suspense fallback={<ModalLoader />}>
                <ListView
                  appointments={filteredAppointments}
                  onAppointmentClick={(apt) => {
                    // Abrir modal de detalles
                    const state = useAgendaState.getState();
                    state.openDetailsModal(apt);
                  }}
                  dateRange={{
                    start: currentWeekStart,
                    end: new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
                  }}
                />
              </Suspense>
            ) : viewMode === 'month' ? (
              <Suspense fallback={<ModalLoader />}>
                <MonthGrid
                  currentMonth={monthViewCurrent}
                  selectedDate={selectedDate}
                  appointments={filteredAppointments}
                  onDateSelect={handleDateSelect}
                  onAppointmentClick={(apt) => {
                    const state = useAgendaState.getState();
                    state.openDetailsModal(apt);
                  }}
                />
              </Suspense>
            ) : viewMode === 'heatmap' ? (
              <Suspense fallback={<ModalLoader />}>
                <HeatmapView monthsToShow={12} />
              </Suspense>
            ) : (
              <>
                {/* Header de días (sticky) */}
                <DaysHeader weekStart={calendarBaseDate} mode={timeGridMode} />

                {/* Grid de tiempo (scrollable) con citas - Horario dinámico */}
                <TimeGrid 
                  weekStart={calendarBaseDate} 
                  appointments={filteredAppointments}
                  startHour={startHour} 
                  endHour={endHour}
                  mode={timeGridMode}
                  onAppointmentClick={(apt) => {
                    const state = useAgendaState.getState();
                    state.openDetailsModal(apt);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante para crear cita (móvil) */}
      <button
        onClick={() => {
          const state = useAgendaState.getState();
          // Crear un slot temporal para hoy
          const now = Temporal.Now.zonedDateTimeISO('America/Mexico_City');
          const roundedHour = Math.ceil(now.hour);
          const slotStart = now.with({ hour: roundedHour, minute: 0, second: 0 });
          const slotEnd = slotStart.add({ minutes: 45 });

          state.openCreateModal({
            id: 'quick-slot',
            start: slotStart,
            end: slotEnd,
            timezone: 'America/Mexico_City',
            sede: 'POLANCO',
            duracionMinutos: 45,
            available: true,
            occupied: false,
            blocked: false,
            restrictions: [],
            reason: null,
            appointmentId: null,
            blockId: null,
          });
        }}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Nueva cita"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Modales - Lazy loaded para optimizar bundle */}
      {isCreateModalOpen && (
        <Suspense fallback={<ModalLoader />}>
          <CreateAppointmentModal
            slot={selectedSlot}
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            onCreate={handleCreateAppointment}
          />
        </Suspense>
      )}

      {isDetailsModalOpen && (
        <Suspense fallback={<ModalLoader />}>
          <AppointmentDetailsModal
            appointment={selectedAppointment}
            isOpen={isDetailsModalOpen}
            onClose={closeDetailsModal}
            onUpdate={handleUpdateAppointment}
            onCancel={handleCancelAppointment}
            onEdit={openEditModal}
            onConfirm={handleConfirmAppointment}
            onPatientArrived={handlePatientArrived}
          />
        </Suspense>
      )}

      {isEditModalOpen && (
        <Suspense fallback={<ModalLoader />}>
          <EditAppointmentModal
            appointment={selectedAppointment}
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            onUpdate={handleUpdateAppointment}
          />
        </Suspense>
      )}
    </div>
  );
}
