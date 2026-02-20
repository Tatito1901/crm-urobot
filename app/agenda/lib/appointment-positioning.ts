/**
 * ============================================================
 * APPOINTMENT POSITIONING - Cálculo de posiciones para citas
 * ============================================================
 * Utilidades para posicionar citas en el TimeGrid
 */

import { Temporal } from '@js-temporal/polyfill';
import type { Appointment } from '@/types/agenda';

interface PositionedAppointment extends Appointment {
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

/**
 * Calcula la posición vertical de una cita basado en su hora de inicio
 * @param start - Hora de inicio de la cita
 * @param gridStartHour - Hora de inicio del grid (default: 0)
 * @param slotHeight - Altura de cada slot de 60min en pixels (default: 60)
 */
function calculateTop(
  start: Temporal.ZonedDateTime,
  gridStartHour: number = 0,
  slotHeight: number = 60
): number {
  const startTime = start.toPlainTime();
  const startMinutes = startTime.hour * 60 + startTime.minute;
  const gridStartMinutes = gridStartHour * 60;
  
  const minutesFromGridStart = startMinutes - gridStartMinutes;
  // Calcular posición precisa: cada hora completa = 1 slot
  const pixelsPerMinute = slotHeight / 60;
  
  return minutesFromGridStart * pixelsPerMinute;
}

/**
 * Calcula la altura de una cita basado en su duración
 * @param duracionMinutos - Duración en minutos
 * @param slotHeight - Altura de cada slot de 60min en pixels (default: 60)
 */
function calculateHeight(
  duracionMinutos: number,
  slotHeight: number = 60
): number {
  // Calcular altura proporcional: cada minuto = slotHeight/60 pixels
  const pixelsPerMinute = slotHeight / 60;
  return duracionMinutos * pixelsPerMinute;
}

/**
 * Determina el día de la semana (0-6) de una fecha
 * @param date - Fecha a evaluar
 * @param weekStart - Inicio de la semana
 */
export function getDayOfWeek(
  date: Temporal.PlainDate,
  weekStart: Date
): number {
  const weekStartPlain = Temporal.PlainDate.from({
    year: weekStart.getFullYear(),
    month: weekStart.getMonth() + 1,
    day: weekStart.getDate(),
  });
  
  const daysDiff = date.since(weekStartPlain, { largestUnit: 'days' }).days;
  return daysDiff;
}

/**
 * Detecta superposiciones entre citas
 */
function detectOverlaps(
  appointments: Appointment[]
): Map<string, Appointment[]> {
  const overlaps = new Map<string, Appointment[]>();
  
  for (let i = 0; i < appointments.length; i++) {
    const apt1 = appointments[i];
    const overlapping: Appointment[] = [apt1];
    
    for (let j = i + 1; j < appointments.length; j++) {
      const apt2 = appointments[j];
      
      // Verificar si se superponen
      const apt1Start = apt1.start.epochMilliseconds;
      const apt1End = apt1.end.epochMilliseconds;
      const apt2Start = apt2.start.epochMilliseconds;
      const apt2End = apt2.end.epochMilliseconds;
      
      if (
        (apt2Start >= apt1Start && apt2Start < apt1End) ||
        (apt2End > apt1Start && apt2End <= apt1End) ||
        (apt2Start <= apt1Start && apt2End >= apt1End)
      ) {
        overlapping.push(apt2);
      }
    }
    
    if (overlapping.length > 1) {
      overlaps.set(apt1.id, overlapping);
    }
  }
  
  return overlaps;
}

/**
 * Calcula posiciones horizontales para citas superpuestas
 */
function calculateHorizontalPositions(
  overlappingAppointments: Appointment[]
): Map<string, { left: number; width: number }> {
  const positions = new Map<string, { left: number; width: number }>();
  const count = overlappingAppointments.length;
  
  overlappingAppointments.forEach((apt, index) => {
    const width = 100 / count;
    const left = (100 / count) * index;
    positions.set(apt.id, { left, width });
  });
  
  return positions;
}

/**
 * Posiciona todas las citas de un día específico
 */
export function positionAppointmentsForDay(
  appointments: Appointment[],
  dayIndex: number,
  gridStartHour: number = 0,
  slotHeight: number = 60
): PositionedAppointment[] {
  const overlaps = detectOverlaps(appointments);
  const positioned: PositionedAppointment[] = [];
  
  appointments.forEach((apt) => {
    const top = calculateTop(apt.start, gridStartHour, slotHeight);
    const height = calculateHeight(apt.duracionMinutos, slotHeight);
    
    let left = 0;
    let width = 100;
    let zIndex = 1;
    
    // Si hay superposiciones, ajustar posición horizontal
    if (overlaps.has(apt.id)) {
      const overlapping = overlaps.get(apt.id)!;
      const horizontalPositions = calculateHorizontalPositions(overlapping);
      const position = horizontalPositions.get(apt.id)!;
      
      left = position.left;
      width = position.width;
      zIndex = overlapping.indexOf(apt) + 1;
    }
    
    positioned.push({
      ...apt,
      top,
      height,
      left,
      width,
      zIndex,
    });
  });
  
  return positioned;
}
