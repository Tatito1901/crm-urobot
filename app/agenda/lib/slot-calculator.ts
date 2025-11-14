/**
 * ============================================================
 * SLOT CALCULATOR - Cálculo de disponibilidad de slots
 * ============================================================
 * Lógica central para calcular qué slots están disponibles,
 * ocupados o bloqueados en un rango de fechas
 */

import { Temporal } from '@js-temporal/polyfill';
import type { Appointment, TimeSlot, CalendarBlock } from '@/types/agenda';

interface WorkingHoursConfig {
  [sede: string]: {
    [dayOfWeek: number]: {
      start: string;
      end: string;
    } | null;
  };
}

interface CalculateSlotsParams {
  dateRange: { start: Temporal.PlainDate; end: Temporal.PlainDate };
  sede: 'ALL' | 'POLANCO' | 'SATELITE';
  appointments: Appointment[];
  blocks: CalendarBlock[];
  slotDuration: number; // minutos
  workingHours: WorkingHoursConfig;
}

interface CalculateSlotsResult {
  allSlots: TimeSlot[];
  availableSlots: TimeSlot[];
  occupiedSlots: TimeSlot[];
  blockedSlots: TimeSlot[];
  totalSlots: number;
}

/**
 * Calcula todos los slots disponibles en un rango de fechas
 */
export function calculateAvailableSlots(params: CalculateSlotsParams): CalculateSlotsResult {
  const { dateRange, sede, appointments, blocks, slotDuration, workingHours } = params;

  const allSlots: TimeSlot[] = [];
  const occupiedSlots: TimeSlot[] = [];
  const blockedSlots: TimeSlot[] = [];
  const availableSlots: TimeSlot[] = [];

  // Determinar qué sedes procesar
  const sedesToProcess: Array<'POLANCO' | 'SATELITE'> =
    sede === 'ALL' ? ['POLANCO', 'SATELITE'] : [sede];

  // Generar todos los slots posibles en el rango
  let currentDate = dateRange.start;
  while (Temporal.PlainDate.compare(currentDate, dateRange.end) <= 0) {
    const dayOfWeek = currentDate.dayOfWeek; // 1=Lunes, 7=Domingo

    for (const sedeKey of sedesToProcess) {
      const hours = workingHours[sedeKey]?.[dayOfWeek];
      if (!hours) continue; // No hay horario laboral este día

      // Generar slots para este día y sede
      const daySlots = generateDaySlots(currentDate, hours.start, hours.end, slotDuration, sedeKey);
      allSlots.push(...daySlots);
    }

    currentDate = currentDate.add({ days: 1 });
  }

  // Clasificar cada slot
  for (const slot of allSlots) {
    // Verificar si está ocupado por una cita
    const occupyingAppointment = appointments.find((apt) =>
      slotOverlapsWithRange(slot, { start: apt.start, end: apt.end })
    );

    if (occupyingAppointment) {
      occupiedSlots.push({
        ...slot,
        occupied: true,
        available: false,
        appointmentId: occupyingAppointment.id,
        reason: `Ocupado por cita de ${occupyingAppointment.paciente}`,
      });
      continue;
    }

    // Verificar si está bloqueado
    const blockingBlock = blocks.find((block) =>
      slotOverlapsWithRange(slot, { start: block.start, end: block.end })
    );

    if (blockingBlock) {
      blockedSlots.push({
        ...slot,
        blocked: true,
        available: false,
        blockId: blockingBlock.id,
        reason: blockingBlock.titulo,
      });
      continue;
    }

    // Slot disponible
    availableSlots.push({
      ...slot,
      available: true,
      occupied: false,
      blocked: false,
    });
  }

  return {
    allSlots,
    availableSlots,
    occupiedSlots,
    blockedSlots,
    totalSlots: allSlots.length,
  };
}

/**
 * Genera todos los slots de un día específico
 */
function generateDaySlots(
  date: Temporal.PlainDate,
  startTime: string, // "09:00"
  endTime: string, // "18:00"
  duration: number, // minutos
  sede: 'POLANCO' | 'SATELITE'
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const timezone = 'America/Mexico_City';

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentTime = Temporal.PlainTime.from({ hour: startHour, minute: startMin });
  const endTimePlain = Temporal.PlainTime.from({ hour: endHour, minute: endMin });

  while (Temporal.PlainTime.compare(currentTime, endTimePlain) < 0) {
    const startDateTime = date.toPlainDateTime(currentTime).toZonedDateTime(timezone);
    const endDateTime = startDateTime.add({ minutes: duration });

    // Verificar que el slot no se pase del horario de cierre
    const slotEndTime = endDateTime.toPlainTime();
    if (Temporal.PlainTime.compare(slotEndTime, endTimePlain) > 0) {
      break; // No agregar slots que excedan el horario
    }

    const slotId = generateSlotId(date, currentTime, sede);

    slots.push({
      id: slotId,
      start: startDateTime,
      end: endDateTime,
      timezone,
      sede,
      duracionMinutos: duration,
      available: true,
      occupied: false,
      blocked: false,
      restrictions: [],
      reason: null,
      appointmentId: null,
      blockId: null,
    });

    currentTime = currentTime.add({ minutes: duration });
  }

  return slots;
}

/**
 * Verifica si un slot se traslapa con un rango de tiempo
 */
function slotOverlapsWithRange(
  slot: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime },
  range: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime }
): boolean {
  // Dos rangos se traslapan si:
  // - El inicio del slot es antes del fin del rango, Y
  // - El fin del slot es después del inicio del rango
  return (
    Temporal.ZonedDateTime.compare(slot.start, range.end) < 0 &&
    Temporal.ZonedDateTime.compare(slot.end, range.start) > 0
  );
}

/**
 * Genera un ID único para un slot
 */
function generateSlotId(
  date: Temporal.PlainDate,
  time: Temporal.PlainTime,
  sede: 'POLANCO' | 'SATELITE'
): string {
  const dateStr = date.toString(); // "2025-11-13"
  const timeStr = time.toString().replace(':', ''); // "0930"
  const sedeStr = sede.toLowerCase();

  return `slot_${dateStr}_${timeStr}_${sedeStr}`;
}

/**
 * Parsea un slotId y devuelve su fecha/hora
 */
export function parseSlotId(slotId: string): {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  sede: 'POLANCO' | 'SATELITE';
} {
  // Formato: "slot_2025-11-13_0930_polanco"
  const parts = slotId.split('_');
  const date = parts[1]; // "2025-11-13"
  const time = parts[2]; // "0930"
  const sede = parts[3].toUpperCase() as 'POLANCO' | 'SATELITE';

  const hour = time.substring(0, 2);
  const minute = time.substring(2, 4);

  const start = Temporal.ZonedDateTime.from(
    `${date}T${hour}:${minute}:00[America/Mexico_City]`
  );
  const end = start.add({ minutes: 30 }); // Duración por defecto

  return { start, end, sede };
}

/**
 * Configuración de horarios laborales por defecto
 * TODO: Mover a base de datos o archivo de configuración
 */
export function getDefaultWorkingHours(): WorkingHoursConfig {
  return {
    POLANCO: {
      1: { start: '09:00', end: '18:00' }, // Lunes
      2: { start: '09:00', end: '18:00' }, // Martes
      3: { start: '09:00', end: '18:00' }, // Miércoles
      4: { start: '09:00', end: '18:00' }, // Jueves
      5: { start: '09:00', end: '18:00' }, // Viernes
      6: null, // Sábado cerrado
      7: null, // Domingo cerrado
    },
    SATELITE: {
      1: { start: '10:00', end: '17:00' }, // Lunes
      2: { start: '10:00', end: '17:00' }, // Martes
      3: null, // Miércoles cerrado
      4: { start: '10:00', end: '17:00' }, // Jueves
      5: { start: '10:00', end: '17:00' }, // Viernes
      6: null,
      7: null,
    },
  };
}
