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

import React, { useMemo } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { useAgendaState } from '../hooks/useAgendaState';
import { useAvailability } from '../hooks/useAvailability';
import type { Consulta } from '@/types/consultas';
import type { Appointment } from '@/types/agenda';
import { CalendarGrid } from './calendar/CalendarGrid';
import { getShortName } from '../lib/agenda-utils';

interface NewCalendarViewProps {
  consultas: Consulta[]; // Datos del hook existente
  loading?: boolean;
}

/**
 * Componente que adapta los datos actuales a la nueva UI
 */
export const NewCalendarView: React.FC<NewCalendarViewProps> = ({ consultas, loading = false }) => {
  // Estado global de la agenda
  const { viewMode, dateRange } = useAgendaState();

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

  return (
    <CalendarGrid
      appointments={appointments}
      availableSlots={availableSlots}
      viewMode={viewMode === 'month' ? 'week' : viewMode} // month no está implementado aún
      loading={loading}
      startHour={9}
      endHour={18}
      slotHeight={48}
    />
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
