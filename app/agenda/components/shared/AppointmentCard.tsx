/**
 * ============================================================
 * APPOINTMENT CARD - Tarjeta de cita en el calendario
 * ============================================================
 * Card profesional con Quick Actions, tooltips y diseño médico
 */

'use client';

import React, { useState } from 'react';
import type { Appointment } from '@/types/agenda';
import { AppointmentTooltip } from './AppointmentTooltip';
import { ResponsiveText } from './ResponsiveText';
import { useAppointmentColor } from '../../hooks/useColorPreferences';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Obtener color personalizado para esta cita
  const customColor = useAppointmentColor(appointment.sede);

  // Formatear hora
  const startTime = appointment.start.toPlainTime().toString().slice(0, 5);
  
  // Determinar nivel de detalle según duración
  const isShortAppointment = appointment.duracionMinutos <= 30;
  const isLongAppointment = appointment.duracionMinutos > 60;

  // Determinar badge de estado
  const getEstadoBadge = () => {
    switch (appointment.estado) {
      case 'Confirmada':
        return { icon: '✓', color: 'text-emerald-400' };
      case 'Cancelada':
        return { icon: '✕', color: 'text-red-400' };
      case 'Reagendada':
        return { icon: '↻', color: 'text-amber-400' };
      default:
        return null;
    }
  };

  // Determinar si puede confirmar
  const canConfirm = appointment.estado === 'Programada' && !appointment.confirmadoPaciente;

  const estadoBadge = getEstadoBadge();

  return (
    <div
      className={`
        relative group h-full
        border-l-[3px] rounded-md
        ${isShortAppointment ? 'px-2 py-1' : 'px-2.5 py-1.5'}
        cursor-pointer
        transition-all duration-150
        hover:shadow-md hover:shadow-black/40
        hover:brightness-110
        flex flex-col
        ${isShortAppointment ? 'justify-center' : 'justify-start'}
        overflow-hidden
        min-h-[28px]
      `}
      style={{
        borderLeftColor: customColor,
        backgroundColor: `${customColor}25`, // 25% opacity - más visible
      }}
      onClick={() => onClick?.(appointment)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Diseño compacto para citas cortas (<=30 min) */}
      {isShortAppointment ? (
        <div className="flex items-center justify-between gap-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {startTime} {appointment.paciente}
            </p>
          </div>
          {estadoBadge && (
            <div className={`text-[10px] ${estadoBadge.color} font-bold flex-shrink-0`}>
              {estadoBadge.icon}
            </div>
          )}
        </div>
      ) : (
        /* Diseño normal para citas medianas/largas (>30 min) */
        <>
          {/* Header: Hora + Badge estado */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="text-xs font-semibold text-slate-300">
              {startTime}
            </div>
            <div className="flex items-center gap-1">
              {estadoBadge && (
                <div className={`text-xs ${estadoBadge.color} font-bold`}>
                  {estadoBadge.icon}
                </div>
              )}
              {canConfirm && (
                <div className="w-2 h-2 rounded-full bg-amber-400" title="Pendiente confirmación" />
              )}
            </div>
          </div>

          {/* Paciente - prominente con texto escalable */}
          <div className="flex-1 min-h-0 mb-1">
            <ResponsiveText
              text={appointment.paciente}
              maxLines={isLongAppointment ? 2 : 1}
              minSize={10}
              maxSize={14}
              className="font-bold text-white leading-tight group-hover:text-blue-200 transition-colors"
            />
          </div>

          {/* Footer: Sede + Duración (solo para citas largas) */}
          {isLongAppointment && (
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/40">
              <span className="truncate font-medium">{appointment.sede}</span>
              <span className="flex-shrink-0">{appointment.duracionMinutos}min</span>
            </div>
          )}
        </>
      )}

      {/* Tooltip elegante en hover */}
      <AppointmentTooltip
        appointment={appointment}
        isVisible={showTooltip}
        position="right"
      />
    </div>
  );
};
