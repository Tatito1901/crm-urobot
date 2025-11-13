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

  // Colores según estado
  const statusColors: Record<string, string> = {
    Programada: 'bg-blue-500/10 border-blue-500/60 hover:bg-blue-500/20',
    Confirmada: 'bg-emerald-500/10 border-emerald-500/60 hover:bg-emerald-500/20',
    Reagendada: 'bg-amber-500/10 border-amber-500/60 hover:bg-amber-500/20',
    Cancelada: 'bg-slate-500/10 border-slate-500/40 opacity-60',
    En_Curso: 'bg-purple-500/10 border-purple-500/60 animate-pulse',
    Completada: 'bg-slate-500/10 border-slate-500/40 opacity-70',
    No_Acudio: 'bg-red-500/10 border-red-500/40 opacity-50',
  };

  // Bordes según prioridad
  const priorityBorder: Record<string, string> = {
    urgente: 'border-2 border-red-500 shadow-lg shadow-red-500/20 animate-pulse',
    alta: 'border-l-4 border-l-yellow-500',
    normal: '',
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
        ${statusColors[appointment.estado] || statusColors.Programada}
        ${priorityBorder[appointment.prioridad]}
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
