/**
 * ============================================================
 * APPOINTMENT CARD - Tarjeta de cita en el calendario
 * ============================================================
 * Card profesional con Quick Actions, tooltips y diseño médico
 */

'use client';

import React, { useState } from 'react';
import { CheckCircle2, Edit2, Phone, MessageCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { SedeBadge } from './SedeBadge';
import type { Appointment } from '@/types/agenda';

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm?: (id: string) => void;
  onEdit?: (appointment: Appointment) => void;
  onClick?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onConfirm,
  onEdit,
  onCancel,
  onClick,
}) => {
  const [showActions, setShowActions] = useState(false);

  // Formatear hora
  const startTime = appointment.start.toPlainTime().toString().slice(0, 5);
  const endTime = appointment.end.toPlainTime().toString().slice(0, 5);

  // Determinar color del borde según estado
  const getBorderColor = () => {
    switch (appointment.estado) {
      case 'Confirmada':
        return 'border-l-emerald-500';
      case 'Programada':
        return 'border-l-blue-500';
      case 'Cancelada':
        return 'border-l-red-500';
      case 'Reagendada':
        return 'border-l-amber-500';
      default:
        return 'border-l-slate-500';
    }
  };

  // Determinar si puede confirmar
  const canConfirm = appointment.estado === 'Programada' && !appointment.confirmadoPaciente;

  return (
    <div
      className={`
        relative group
        bg-gradient-to-br from-slate-800/90 to-slate-900/90
        backdrop-blur-sm
        border border-white/10 ${getBorderColor()} border-l-4
        rounded-lg p-2
        cursor-pointer
        transition-all duration-200
        hover:shadow-xl hover:shadow-blue-900/20
        hover:scale-[1.02]
        hover:border-white/20
      `}
      onClick={() => onClick?.(appointment)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header con badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge estado={appointment.estado} size="sm" />
          <SedeBadge sede={appointment.sede} size="sm" />
        </div>
        
        {/* Quick Actions - Visible al hover */}
        {showActions && (
          <div className="flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {canConfirm && onConfirm && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm(appointment.id);
                }}
                className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                title="Confirmar cita"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(appointment);
                }}
                className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                title="Editar cita"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            <a
              href={`tel:${appointment.telefono || ''}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
              title="Llamar al paciente"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>

            <a
              href={`https://wa.me/${appointment.telefono?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Paciente */}
      <div className="mb-1">
        <p className="text-sm font-semibold text-white truncate">
          {appointment.paciente}
        </p>
      </div>

      {/* Horario */}
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">
          {startTime} - {endTime}
        </span>
        <span className="text-slate-500">({appointment.duracionMinutos} min)</span>
      </div>

      {/* Tipo de consulta */}
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="truncate">
          {appointment.tipo.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Indicador de confirmación pendiente */}
      {canConfirm && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1 text-[10px] text-amber-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Pendiente confirmación</span>
          </div>
        </div>
      )}
    </div>
  );
};
