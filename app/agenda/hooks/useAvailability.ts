/**
 * ============================================================
 * HOOK: useAvailability - Cálculo de slots disponibles
 * ============================================================
 * Calcula qué slots están disponibles en un rango de fechas
 * teniendo en cuenta citas existentes y bloques reservados
 */

import { useMemo } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { useConsultas } from '@/hooks/useConsultas';
import {
  calculateAvailableSlots,
  getDefaultWorkingHours,
} from '@/app/agenda/lib/slot-calculator';
import type { Consulta } from '@/types/consultas';
import type { TimeSlot, Appointment } from '@/types/agenda';

interface UseAvailabilityOptions {
  dateRange: { start: Temporal.PlainDate; end: Temporal.PlainDate };
  sede: 'ALL' | 'POLANCO' | 'SATELITE';
  consultType?: string;
  duration?: number; // Duración del slot en minutos
}

interface UseAvailabilityReturn {
  availableSlots: TimeSlot[];
  occupiedSlots: TimeSlot[];
  blockedSlots: TimeSlot[];
  totalSlots: number;
  occupancyRate: number; // Porcentaje de ocupación
  loading: boolean;
}

/**
 * Hook para obtener slots disponibles
 */
export function useAvailability(options: UseAvailabilityOptions): UseAvailabilityReturn {
  const { dateRange, sede, duration = 30 } = options;

  // Obtener consultas del rango usando el hook existente
  const { consultas, loading } = useConsultas();

  // Filtrar consultas por rango de fechas y sede
  const filteredConsultas = useMemo(() => {
    let filtered = consultas;

    // Filtrar por rango de fechas
    filtered = filtered.filter((consulta) => {
      const fechaConsulta = consulta.fechaConsulta;
      if (!fechaConsulta) return false;

      const consultaDate = Temporal.PlainDate.from(fechaConsulta);
      return (
        Temporal.PlainDate.compare(consultaDate, dateRange.start) >= 0 &&
        Temporal.PlainDate.compare(consultaDate, dateRange.end) <= 0
      );
    });

    // Filtrar por sede
    if (sede !== 'ALL') {
      filtered = filtered.filter((c) => c.sede === sede);
    }

    return filtered;
  }, [consultas, dateRange, sede]);

  // Convertir Consulta a Appointment para el calculador
  const appointments: Appointment[] = useMemo(() => {
    return filteredConsultas.map((consulta) => consultaToAppointment(consulta));
  }, [filteredConsultas]);

  // Calcular slots disponibles
  const { availableSlots, occupiedSlots, blockedSlots, totalSlots } = useMemo(() => {
    const workingHours = getDefaultWorkingHours();

    return calculateAvailableSlots({
      dateRange,
      sede,
      appointments,
      blocks: [], // TODO: Implementar bloques cuando estén en la DB
      slotDuration: duration,
      workingHours,
    });
  }, [dateRange, sede, appointments, duration]);

  // Calcular tasa de ocupación
  const occupancyRate = useMemo(() => {
    if (totalSlots === 0) return 0;
    return Math.round((occupiedSlots.length / totalSlots) * 100);
  }, [occupiedSlots, totalSlots]);

  return {
    availableSlots,
    occupiedSlots,
    blockedSlots,
    totalSlots,
    occupancyRate,
    loading,
  };
}

/**
 * Convierte una Consulta (tipo actual) a Appointment (tipo nuevo)
 * Mantiene compatibilidad con el modelo existente
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
    id: consulta.id,
    uuid: consulta.uuid,
    pacienteId: consulta.pacienteId || '',
    paciente: consulta.paciente,
    telefono: null, // TODO: Agregar a modelo Consulta
    email: null, // TODO: Agregar a modelo Consulta
    start,
    end,
    timezone,
    duracionMinutos: consulta.duracionMinutos ?? 45,
    sede: consulta.sede,
    consultorio: null, // TODO: Agregar a modelo Consulta
    tipo: consulta.tipo,
    prioridad: 'normal', // TODO: Agregar a modelo Consulta
    modalidad: 'presencial', // TODO: Agregar a modelo Consulta
    motivoConsulta: consulta.motivoConsulta,
    notasInternas: null, // TODO: Agregar a modelo Consulta
    requisitosEspeciales: null, // TODO: Agregar a modelo Consulta
    estado: consulta.estado,
    estadoConfirmacion: consulta.estadoConfirmacion,
    confirmadoPaciente: consulta.confirmadoPaciente,
    confirmadoEn: null, // TODO: Agregar a modelo Consulta
    canceladoPor: consulta.canceladoPor ?? null,
    motivoCancelacion: consulta.motivoCancelacion ?? null,
    canceladoEn: null, // TODO: Agregar a modelo Consulta
    calendarEventId: consulta.calendarEventId,
    calendarLink: consulta.calendarLink,
    canalOrigen: consulta.canalOrigen,
    creadoPor: null, // TODO: Agregar a modelo Consulta
    createdAt: consulta.createdAt,
    updatedAt: consulta.updatedAt,
  };
}
