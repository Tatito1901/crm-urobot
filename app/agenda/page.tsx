/**
 * ============================================================
 * AGENDA PAGE - Vista de calendario profesional mejorada
 * ============================================================
 * Sistema completo de gestión de consultas médicas
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
import { ListView } from './components/calendar/ListView';
import { FiltersPanel } from './components/calendar/FiltersPanel';
import { CreateAppointmentModal } from './components/modals/CreateAppointmentModal';
import { AppointmentDetailsModal } from './components/modals/AppointmentDetailsModal';
import { EditAppointmentModal } from './components/modals/EditAppointmentModal';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment as cancelAppointmentService,
  confirmAppointment as confirmAppointmentService,
} from './services/appointments-service';

// Adaptador: Convierte Consulta a Appointment
function consultaToAppointment(consulta: Consulta): Appointment {
  const startDateTime = Temporal.ZonedDateTime.from({
    timeZone: consulta.timezone,
    year: parseInt(consulta.fechaConsulta.split('-')[0]),
    month: parseInt(consulta.fechaConsulta.split('-')[1]),
    day: parseInt(consulta.fechaConsulta.split('-')[2]),
    hour: parseInt(consulta.horaConsulta.split(':')[0]),
    minute: parseInt(consulta.horaConsulta.split(':')[1]),
    second: parseInt(consulta.horaConsulta.split(':')[2] || '0'),
  });

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
  // Estado: fecha seleccionada (default: hoy)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estado: inicio de la semana actual
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));

  // Estado global de agenda
  const {
    viewMode,
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
  } = useAgendaState();

  // Cargar consultas
  const { consultas, refetch } = useConsultas();

  // Convertir consultas a appointments
  const appointments = useMemo(() => {
    return consultas.map(consultaToAppointment);
  }, [consultas]);

  // Cuando se selecciona una fecha en el mini-calendario, ir a esa semana
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentWeekStart(startOfWeek(date));
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

      // Filtro de sede
      if (selectedSede !== 'ALL' && apt.sede !== selectedSede) return false;

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
  ]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const today = Temporal.Now.plainDateISO('America/Mexico_City');

    const todayAppointments = filteredAppointments.filter((apt) =>
      apt.start.toPlainDate().equals(today)
    ).length;

    const pendingConfirmation = filteredAppointments.filter(
      (apt) => !apt.confirmadoPaciente && apt.estado === 'Programada'
    ).length;

    return {
      total: filteredAppointments.length,
      today: todayAppointments,
      pending: pendingConfirmation,
    };
  }, [filteredAppointments]);

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

  return (
    <div className="h-screen flex flex-col bg-[#0b0f16] font-roboto">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar unificado - oculto en móvil */}
        <div className="hidden lg:block">
          <Sidebar 
            selectedDate={selectedDate} 
            onDateSelect={handleDateSelect}
            onCreateAppointment={() => {
              const state = useAgendaState.getState();
              state.openCreateModal();
            }}
            onAppointmentClick={(consulta) => {
              // Convertir Consulta a Appointment y abrir detalles
              const appointment = consultaToAppointment(consulta);
              const state = useAgendaState.getState();
              state.openDetailsModal(appointment);
            }}
          />
        </div>

        {/* Zona principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header de navegación con estadísticas */}
          <HeaderBar
            currentWeekStart={currentWeekStart}
            onWeekChange={setCurrentWeekStart}
            totalAppointments={stats.total}
            pendingConfirmation={stats.pending}
            todayAppointments={stats.today}
          />

          {/* Panel de filtros */}
          <FiltersPanel />

          {/* Área del calendario o lista */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'list' ? (
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
            ) : (
              <>
                {/* Header de días (sticky) */}
                <DaysHeader weekStart={currentWeekStart} />

                {/* Grid de tiempo (scrollable) con citas */}
                <TimeGrid 
                  weekStart={currentWeekStart} 
                  appointments={filteredAppointments}
                  startHour={11} 
                  endHour={21}
                  onAppointmentClick={(apt) => {
                    const state = useAgendaState.getState();
                    state.openDetailsModal(apt);
                  }}
                  onAppointmentConfirm={handleConfirmAppointment}
                  onAppointmentEdit={(apt) => {
                    const state = useAgendaState.getState();
                    state.openEditModal(apt);
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

      {/* Modales */}
      <CreateAppointmentModal
        slot={selectedSlot}
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreate={handleCreateAppointment}
      />

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        onUpdate={handleUpdateAppointment}
        onCancel={handleCancelAppointment}
        onEdit={openEditModal}
        onConfirm={handleConfirmAppointment}
      />

      <EditAppointmentModal
        appointment={selectedAppointment}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdate={handleUpdateAppointment}
      />
    </div>
  );
}
