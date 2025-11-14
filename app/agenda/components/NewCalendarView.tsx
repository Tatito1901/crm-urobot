/**
 * ============================================================
 * NEW CALENDAR VIEW - Nueva vista de calendario refactorizada
 * ============================================================
 * Wrapper que integra los nuevos componentes de calendario
 * Compatible con los datos actuales de useConsultas
 *
 * Para activar: En page.tsx, importa y usa <NewCalendarView /> en lugar de <CalendarView />
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { useAgendaState } from '../hooks/useAgendaState';
import { useAvailability } from '../hooks/useAvailability';
import type { Consulta } from '@/types/consultas';
import type { Appointment } from '@/types/agenda';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CreateAppointmentModal } from './modals/CreateAppointmentModal';
import { AppointmentDetailsModal } from './modals/AppointmentDetailsModal';
import {
  createAppointment,
  updateAppointment,
  cancelAppointment,
  type CreateAppointmentData,
} from '../services/appointments-service';

interface NewCalendarViewProps {
  consultas: Consulta[]; // Datos del hook existente
  loading?: boolean;
  onRefresh?: () => void; // Callback para refrescar datos después de crear/editar
}

/**
 * Componente que adapta los datos actuales a la nueva UI
 */
export const NewCalendarView: React.FC<NewCalendarViewProps> = ({
  consultas,
  loading = false,
  onRefresh,
}) => {
  // Estado global de la agenda
  const {
    viewMode,
    dateRange,
    selectedSlot,
    selectedAppointment,
    isCreateModalOpen,
    isDetailsModalOpen,
    closeCreateModal,
    closeDetailsModal,
  } = useAgendaState();

  // Convertir Consulta[] a Appointment[]
  const appointments = useMemo(() => {
    return consultas.map((consulta) => consultaToAppointment(consulta));
  }, [consultas]);

  // Calcular slots disponibles
  const { availableSlots } = useAvailability({
    dateRange,
    sede: 'ALL', // TODO: Obtener de filtros
    duration: 30,
  });

  /**
   * Handler para crear nueva cita
   */
  const handleCreateAppointment = useCallback(
    async (formData: any) => {
      try {
        if (!selectedSlot) {
          return {
            success: false,
            error: 'No hay slot seleccionado',
          };
        }

        // Calcular start y end basados en el slot y la duración del formulario
        const start = selectedSlot.start;
        const end = start.add({ minutes: formData.duracionMinutos || 45 });

        // Construir datos completos para el servicio
        const appointmentData: CreateAppointmentData = {
          patientId: formData.patientId,
          patientName: formData.patientName,
          slotId: formData.slotId || selectedSlot.id,
          start,
          end,
          timezone: selectedSlot.timezone,
          duracionMinutos: formData.duracionMinutos || 45,
          sede: formData.sede || selectedSlot.sede,
          tipo: formData.tipo,
          prioridad: formData.prioridad || 'normal',
          modalidad: formData.modalidad || 'presencial',
          motivoConsulta: formData.motivoConsulta || undefined,
          notasInternas: formData.notasInternas || undefined,
          canalOrigen: 'Sistema',
        };

        // Llamada real a la API
        const result = await createAppointment(appointmentData);

        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Error al crear la cita',
          };
        }

        // Refrescar datos después de crear exitosamente
        if (onRefresh) {
          onRefresh();
        }

        return { success: true, data: result.data };
      } catch (error) {
        console.error('Error creating appointment:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error al crear la cita',
        };
      }
    },
    [selectedSlot, onRefresh]
  );

  /**
   * Handler para actualizar cita
   */
  const handleUpdateAppointment = useCallback(
    async (id: string, updates: Partial<Appointment>) => {
      try {
        // Convertir updates de Appointment a formato de servicio
        const updateData: any = {};

        if (updates.start && updates.end) {
          updateData.start = updates.start;
          updateData.end = updates.end;
        }

        if (updates.duracionMinutos) updateData.duracionMinutos = updates.duracionMinutos;
        if (updates.tipo) updateData.tipo = updates.tipo;
        if (updates.motivoConsulta !== undefined) updateData.motivoConsulta = updates.motivoConsulta;
        if (updates.prioridad) updateData.prioridad = updates.prioridad;
        if (updates.modalidad) updateData.modalidad = updates.modalidad;
        if (updates.sede) updateData.sede = updates.sede;
        if (updates.notasInternas !== undefined) updateData.notasInternas = updates.notasInternas;

        // Llamada real a la API
        const result = await updateAppointment(id, updateData);

        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Error al actualizar la cita',
          };
        }

        // Refrescar datos
        if (onRefresh) {
          onRefresh();
        }

        return { success: true };
      } catch (error) {
        console.error('Error updating appointment:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error al actualizar la cita',
        };
      }
    },
    [onRefresh]
  );

  /**
   * Handler para cancelar cita
   */
  const handleCancelAppointment = useCallback(
    async (id: string, reason: string, cancelledBy: string) => {
      try {
        // Mapear cancelledBy a los valores esperados por el servicio
        const cancelledByMapped =
          cancelledBy === 'user'
            ? 'asistente'
            : (cancelledBy as 'paciente' | 'doctor' | 'asistente' | 'sistema');

        // Llamada real a la API
        const result = await cancelAppointment(id, {
          reason,
          cancelledBy: cancelledByMapped,
        });

        if (!result.success) {
          throw new Error(result.error || 'Error al cancelar la cita');
        }

        // Refrescar datos
        if (onRefresh) {
          onRefresh();
        }

        return { success: true };
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
      }
    },
    [onRefresh]
  );

  return (
    <>
      {/* Calendario */}
      <CalendarGrid
        appointments={appointments}
        availableSlots={availableSlots}
        viewMode={viewMode === 'month' ? 'week' : viewMode}
        loading={loading}
        startHour={9}
        endHour={18}
        slotHeight={48}
      />

      {/* Modal de creación */}
      <CreateAppointmentModal
        slot={selectedSlot}
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreate={handleCreateAppointment}
      />

      {/* Modal de detalles */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        onUpdate={handleUpdateAppointment}
        onCancel={handleCancelAppointment}
      />
    </>
  );
};

/**
 * Convierte Consulta (modelo actual) a Appointment (modelo nuevo)
 * Mantiene compatibilidad completa
 */
function consultaToAppointment(consulta: Consulta): Appointment {
  const timezone = consulta.timezone ?? 'America/Mexico_City';
  const fechaConsulta = consulta.fechaConsulta ?? Temporal.Now.plainDateISO(timezone).toString();
  const horaConsulta =
    consulta.horaConsulta && consulta.horaConsulta.trim().length > 0
      ? consulta.horaConsulta
      : '00:00:00';

  const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
  const start = fechaBase.toZonedDateTime(timezone);
  const end = start.add({ minutes: consulta.duracionMinutos ?? 45 });

  return {
    // IDs
    id: consulta.id,
    uuid: consulta.uuid,

    // Paciente
    pacienteId: consulta.pacienteId || '',
    paciente: consulta.paciente,
    telefono: null, // TODO: Agregar a modelo Consulta cuando se haga migración DB
    email: null, // TODO: Agregar a modelo Consulta

    // Fecha y hora
    start,
    end,
    timezone,
    duracionMinutos: consulta.duracionMinutos ?? 45,

    // Ubicación
    sede: consulta.sede,
    consultorio: null, // TODO: Agregar a modelo Consulta

    // Tipo y clasificación
    tipo: consulta.tipo,
    prioridad: 'normal', // TODO: Agregar a modelo Consulta
    modalidad: 'presencial', // TODO: Agregar a modelo Consulta

    // Motivo y contexto
    motivoConsulta: consulta.motivoConsulta,
    notasInternas: null, // TODO: Agregar a modelo Consulta
    requisitosEspeciales: null, // TODO: Agregar a modelo Consulta

    // Estado
    estado: consulta.estado,
    estadoConfirmacion: consulta.estadoConfirmacion,
    confirmadoPaciente: consulta.confirmadoPaciente,
    confirmadoEn: null, // TODO: Agregar a modelo Consulta

    // Cancelación
    canceladoPor: consulta.canceladoPor || null,
    motivoCancelacion: consulta.motivoCancelacion,
    canceladoEn: null, // TODO: Agregar a modelo Consulta

    // Integración Google Calendar
    calendarEventId: consulta.calendarEventId,
    calendarLink: consulta.calendarLink,

    // Metadata
    canalOrigen: consulta.canalOrigen,
    creadoPor: null, // TODO: Agregar a modelo Consulta
    createdAt: consulta.createdAt,
    updatedAt: consulta.updatedAt,
  };
}
