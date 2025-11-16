/**
 * ============================================================
 * APPOINTMENT CARD - Tarjeta de cita en el calendario
 * ============================================================
 * Card profesional con Quick Actions, tooltips y diseño médico
 */

'use client';

import React, { useState } from 'react';
import type { Appointment } from '@/types/agenda';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
}) => {
  const [, setShowActions] = useState(false);

  // Formatear hora
  const startTime = appointment.start.toPlainTime().toString().slice(0, 5);
  const endTime = appointment.end.toPlainTime().toString().slice(0, 5);
  
  // Determinar nivel de detalle según duración
  const isShortAppointment = appointment.duracionMinutos <= 30;
  const isLongAppointment = appointment.duracionMinutos > 60;

  // Determinar color del borde según sede (estilo Google Calendar)
  const getSedeColor = () => {
    switch (appointment.sede) {
      case 'POLANCO':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'SATELITE':
        return 'border-l-emerald-500 bg-emerald-500/5';
      default:
        return 'border-l-slate-500 bg-slate-500/5';
    }
  };

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
        bg-slate-900/90
        backdrop-blur-sm
        border border-slate-700/60 border-l-[4px]
        ${getSedeColor()}
        rounded-md
        ${isShortAppointment ? 'px-1.5 py-1' : 'px-2.5 py-2'}
        cursor-pointer
        transition-all duration-150
        hover:bg-slate-800/95
        hover:border-slate-600/80
        hover:shadow-lg hover:shadow-black/60
        hover:scale-[1.01]
        flex flex-col
        ${isShortAppointment ? 'justify-center' : 'justify-start'}
        overflow-hidden
        min-h-[30px]
      `}
      onClick={() => onClick?.(appointment)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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

          {/* Paciente - prominente */}
          <div className="flex-1 min-h-0 mb-1">
            <p className={`${
              isLongAppointment ? 'text-sm' : 'text-sm'
            } font-bold text-white leading-tight group-hover:text-blue-200 transition-colors line-clamp-2`}>
              {appointment.paciente}
            </p>
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

      {/* Tooltip hover con más info */}
      <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block pointer-events-none">
        <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 min-w-[220px] text-xs">
          <div className="font-bold text-white mb-2 text-sm">{appointment.paciente}</div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Hora:</span>
              <span className="font-medium">{startTime} - {endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sede:</span>
              <span>{appointment.sede}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Tipo:</span>
              <span>{appointment.tipo.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Duración:</span>
              <span>{appointment.duracionMinutos} min</span>
            </div>
            {appointment.motivoConsulta && (
              <div className="text-slate-400 text-[10px] mt-2 pt-2 border-t border-slate-700 italic">
                {appointment.motivoConsulta.slice(0, 80)}{appointment.motivoConsulta.length > 80 ? '...' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
