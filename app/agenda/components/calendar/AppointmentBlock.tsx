/**
 * ============================================================
 * APPOINTMENT BLOCK - Bloque de cita en el calendario
 * ============================================================
 * Muestra una cita dentro del grid del calendario
 * con indicadores de estado, prioridad y modalidad
 */

'use client';

import React from 'react';
import { useAgendaState } from '../../hooks/useAgendaState';
import { formatShortTime, getShortName } from '../../lib/agenda-utils';
import type { Appointment } from '@/types/agenda';

interface AppointmentBlockProps {
  appointment: Appointment;
  slotHeight?: number; // Altura de cada slot de 30 min en px
}

export const AppointmentBlock: React.FC<AppointmentBlockProps> = ({
  appointment,
  slotHeight = 48,
}) => {
  const { openDetailsModal } = useAgendaState();

  const handleClick = () => {
    openDetailsModal(appointment);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Calcular altura según duración (cada 30 min = slotHeight px)
  const heightPx = (appointment.duracionMinutos / 30) * slotHeight;

  // Función para obtener colores según tipo y prioridad
  const getAppointmentColors = () => {
    // Si es urgente, siempre rojo con efecto
    if (appointment.prioridad === 'urgente') {
      return 'bg-red-600/15 border-red-600 border-2 hover:bg-red-600/25 shadow-lg shadow-red-600/20';
    }

    // Si es prioridad alta, borde ámbar más grueso
    if (appointment.prioridad === 'alta') {
      return 'border-l-4 border-l-amber-500 bg-amber-500/10 hover:bg-amber-500/20';
    }

    // Colores según estado si no es urgente/alta
    if (appointment.estado === 'Cancelada') {
      return 'bg-slate-500/10 border-slate-500/40 opacity-60';
    }

    if (appointment.estado === 'Completada') {
      return 'bg-slate-500/10 border-slate-500/40 opacity-70';
    }

    if (appointment.estado === 'Confirmada') {
      return 'bg-emerald-600/10 border-emerald-600/60 hover:bg-emerald-600/20';
    }

    // Colores según tipo de consulta para estados normales - tonos profesionales
    const tipoColors: Record<string, string> = {
      primera_vez: 'bg-blue-600/10 border-blue-600/60 hover:bg-blue-600/20',
      subsecuente: 'bg-blue-500/10 border-blue-500/60 hover:bg-blue-500/20',
      control_post_op: 'bg-emerald-600/10 border-emerald-600/60 hover:bg-emerald-600/20',
      urgencia: 'bg-red-600/15 border-red-600/70 hover:bg-red-600/25',
      procedimiento_menor: 'bg-blue-700/10 border-blue-700/60 hover:bg-blue-700/20',
      valoracion_prequirurgica: 'bg-blue-600/10 border-blue-600/60 hover:bg-blue-600/20',
      teleconsulta: 'bg-cyan-600/10 border-cyan-600/60 hover:bg-cyan-600/20',
    };

    return tipoColors[appointment.tipo] || 'bg-slate-500/10 border-slate-500/60 hover:bg-slate-500/20';
  };

  // Iconos según modalidad
  const modalityIcon: Record<string, string> = {
    presencial: '👤',
    teleconsulta: '💻',
    hibrida: '🔄',
  };

  return (
    <div
      className={`
        absolute left-1 right-1 rounded-lg border px-2 py-1.5
        cursor-pointer transition-all duration-200
        ${getAppointmentColors()}
        ${appointment.prioridad === 'urgente' ? 'animate-pulse' : ''}
      `}
      style={{
        height: `${heightPx}px`,
        minHeight: '48px',
        zIndex: 10,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Cita con ${appointment.paciente} a las ${formatShortTime(appointment.start)}`}
    >
      {/* Indicador de urgencia */}
      {appointment.prioridad === 'urgente' && (
        <div className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
          🔴
        </div>
      )}

      {/* Contenido */}
      <div className="flex flex-col h-full justify-between overflow-hidden">
        {/* Nombre del paciente */}
        <p className="text-xs font-semibold text-slate-100 truncate">
          {getShortName(appointment.paciente)}
        </p>

        {/* Hora */}
        <p className="text-[10px] text-slate-400 font-mono">{formatShortTime(appointment.start)}</p>

        {/* Detalles adicionales (solo si hay espacio suficiente) */}
        {heightPx > 60 && (
          <>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {appointment.motivoConsulta || appointment.tipo}
            </p>

            {/* Badges */}
            <div className="flex gap-1 mt-1 flex-wrap">
              {/* Modalidad */}
              <span className="text-[10px]" title={appointment.modalidad}>
                {modalityIcon[appointment.modalidad]}
              </span>

              {/* Sede */}
              <span
                className={`
                  text-[9px] px-1 rounded font-medium
                  ${
                    appointment.sede === 'POLANCO'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }
                `}
              >
                {appointment.sede[0]}
              </span>

              {/* Sin confirmar */}
              {!appointment.confirmadoPaciente && appointment.estado === 'Programada' && (
                <span className="text-[10px]" title="Pendiente de confirmación">
                  ⚠️
                </span>
              )}
            </div>
          </>
        )}

        {/* Para citas muy largas, mostrar duración */}
        {heightPx > 100 && (
          <p className="text-[9px] text-slate-600 mt-1">{appointment.duracionMinutos} min</p>
        )}
      </div>
    </div>
  );
};
