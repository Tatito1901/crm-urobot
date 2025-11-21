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
import { useAgendaState } from '../../hooks/useAgendaState';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const { sedeColors } = useAgendaState();

  // Obtener color dinámico de la sede o usar fallback
  const bgColorClass = sedeColors[appointment.sede] || 
    (appointment.sede === 'POLANCO' ? 'bg-blue-600' : 'bg-emerald-600');

  // Formatear hora
  const startTime = appointment.start.toPlainTime().toString().slice(0, 5);
  const endTime = appointment.end.toPlainTime().toString().slice(0, 5);
  
  // Determinar nivel de detalle según duración
  const isShortAppointment = appointment.duracionMinutos <= 30;

  // Determinar badge de estado
  const getEstadoBadge = () => {
    switch (appointment.estado) {
      case 'Confirmada':
        return { icon: '✓' };
      case 'Cancelada':
        return { icon: '✕' };
      case 'Reagendada':
        return { icon: '↻' };
      default:
        return null;
    }
  };

  const estadoBadge = getEstadoBadge();

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.right, y: rect.top });
    setShowTooltip(true);
  };

  return (
    <div
      className={`
        relative group h-full w-full
        rounded-md
        px-2 py-1
        cursor-pointer
        transition-all duration-150
        hover:brightness-110 hover:shadow-md hover:scale-[1.02] hover:z-10
        flex flex-col
        ${isShortAppointment ? 'justify-center' : 'justify-start'}
        overflow-hidden
        shadow-sm
        ${bgColorClass} text-white
        border border-white/10
      `}
      onClick={() => onClick?.(appointment)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Diseño compacto para citas cortas (<=30 min) */}
      {isShortAppointment ? (
        <div className="flex items-center gap-1.5 w-full overflow-hidden">
          <span className="text-[10px] font-medium opacity-90 whitespace-nowrap">
            {startTime}
          </span>
          <span className="text-[11px] font-semibold truncate flex-1 leading-none">
            {appointment.paciente}
          </span>
        </div>
      ) : (
        /* Diseño normal */
        <div className="flex flex-col h-full w-full min-h-0 gap-0.5">
          {/* Título: Paciente (Prominente) */}
          <div className="font-semibold text-xs leading-tight truncate shrink-0">
            {appointment.paciente}
          </div>
          
          {/* Fila inferior: Hora */}
          <div className="flex items-center gap-2 shrink-0 min-h-0">
            <span className="text-[10px] font-medium opacity-80 leading-none whitespace-nowrap">
              {startTime} - {endTime}
            </span>
            
            {/* Iconos sutiles */}
            {estadoBadge && (
              <span className="text-[9px] opacity-70 ml-auto">
                {estadoBadge.icon}
              </span>
            )}
          </div>
          
          {/* Información extra solo para citas muy largas (>60 min) */}
          {appointment.duracionMinutos > 60 && appointment.tipo && (
             <div className="mt-auto pt-1 opacity-60 truncate text-[10px] font-medium">
               {appointment.tipo.replace(/_/g, ' ')}
             </div>
          )}
        </div>
      )}

      {/* Tooltip elegante en hover */}
      {tooltipPos && (
        <AppointmentTooltip
          appointment={appointment}
          isVisible={showTooltip}
          x={tooltipPos.x}
          y={tooltipPos.y}
        />
      )}
    </div>
  );
};
