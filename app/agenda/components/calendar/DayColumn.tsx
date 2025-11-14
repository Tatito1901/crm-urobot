/**
 * ============================================================
 * DAY COLUMN - Columna de un día en el calendario
 * ============================================================
 * Muestra los slots y citas de un día específico
 */

'use client';

import React, { useMemo } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import type { Appointment, TimeSlot } from '@/types/agenda';
import { Slot } from './Slot';
import { AppointmentBlock } from './AppointmentBlock';

interface DayColumnProps {
  date: Temporal.PlainDate;
  appointments: Appointment[];
  availableSlots: TimeSlot[];
  startHour?: number;
  endHour?: number;
  slotHeight?: number; // Altura de cada slot de 30 min en px
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  appointments,
  availableSlots,
  startHour = 9,
  endHour = 18,
  slotHeight = 48,
}) => {
  // Generar todos los slots del día
  const allSlots = useMemo(() => {
    const slots: { time: string; slot: TimeSlot | null }[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      for (const minute of [0, 30]) {
        if (hour === endHour && minute > 0) break;

        const hourStr = String(hour).padStart(2, '0');
        const minStr = String(minute).padStart(2, '0');
        const timeStr = `${hourStr}:${minStr}`;

        // Buscar si hay un slot disponible para este tiempo
        const matchingSlot = availableSlots.find((slot) => {
          const slotTime = slot.start.toPlainTime().toString().slice(0, 5);
          return slotTime === timeStr;
        });

        slots.push({ time: timeStr, slot: matchingSlot || null });
      }
    }

    return slots;
  }, [availableSlots, startHour, endHour]);

  // Calcular posiciones de las citas
  const appointmentPositions = useMemo(() => {
    return appointments.map((apt) => {
      const startTime = apt.start.toPlainTime();
      const startHourNum = startTime.hour;
      const startMinNum = startTime.minute;

      // Calcular offset desde la hora de inicio
      const slotsFromStart = (startHourNum - startHour) * 2 + (startMinNum === 30 ? 1 : 0);
      const topOffset = slotsFromStart * slotHeight;

      return {
        appointment: apt,
        topOffset,
      };
    });
  }, [appointments, startHour, slotHeight]);

  // Verificar si es hoy
  const isToday = useMemo(() => {
    const today = Temporal.Now.plainDateISO('America/Mexico_City');
    return date.equals(today);
  }, [date]);

  return (
    <div
      className={`
        flex-1 min-w-[120px] border-r border-slate-800/60 relative
        ${isToday ? 'bg-blue-500/5' : 'bg-slate-900/20'}
      `}
    >
      {/* Slots vacíos */}
      <div className="absolute inset-0">
        {allSlots.map(({ time, slot }) => (
          <div key={time}>
            {slot ? (
              <Slot slot={slot} height={slotHeight} />
            ) : (
              <div
                className="border-b border-slate-800/50 bg-slate-800/20"
                style={{ height: `${slotHeight}px` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Citas (posicionadas absolutamente) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative h-full pointer-events-auto">
          {appointmentPositions.map(({ appointment, topOffset }) => (
            <div
              key={appointment.id}
              className="absolute w-full"
              style={{ top: `${topOffset}px` }}
            >
              <AppointmentBlock appointment={appointment} slotHeight={slotHeight} />
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de "ahora" si es hoy */}
      {isToday && <CurrentTimeIndicator startHour={startHour} slotHeight={slotHeight} />}
    </div>
  );
};

/**
 * Línea indicadora de la hora actual
 */
const CurrentTimeIndicator: React.FC<{ startHour: number; slotHeight: number }> = ({
  startHour,
  slotHeight,
}) => {
  const [currentPosition, setCurrentPosition] = React.useState<number | null>(null);

  React.useEffect(() => {
    const updatePosition = () => {
      const now = Temporal.Now.plainTimeISO('America/Mexico_City');
      const nowHour = now.hour;
      const nowMinute = now.minute;

      // Calcular offset
      const minutesFromStart = (nowHour - startHour) * 60 + nowMinute;
      const position = (minutesFromStart / 30) * slotHeight;

      setCurrentPosition(position);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [startHour, slotHeight]);

  if (currentPosition === null || currentPosition < 0) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${currentPosition}px` }}
    >
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <div className="flex-1 h-[2px] bg-red-500" />
      </div>
    </div>
  );
};
