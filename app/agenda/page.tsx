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

  const handleUpdateAppointment = async (id: string, updates: UpdateAppointmentData) => {
    try {
      const result = await updateAppointment(id, updates);

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
        {/* Sidebar fijo */}
        <Sidebar selectedDate={selectedDate} onDateSelect={handleDateSelect} />

        {/* Zona principal */}
        <div className="flex-1 flex flex-col">
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

                {/* Grid de tiempo (scrollable) */}
                <TimeGrid weekStart={currentWeekStart} startHour={11} endHour={21} />
              </>
            )}
          </div>
        </div>
      </div>

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
