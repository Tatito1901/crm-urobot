/**
 * ============================================================
 * COMPONENTE: AgendaAppointmentCard
 * ============================================================
 * Tarjeta de cita individual con indicadores visuales por estado
 */

'use client';

import { useMemo } from 'react';
import { cn } from '@/app/lib/utils';
import type { Consulta } from '@/types/consultas';
import {
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Circle,
  Phone,
} from 'lucide-react';

interface AgendaAppointmentCardProps {
  appointment: Consulta;
  onClick?: () => void;
  compact?: boolean;
}

// Configuración de indicadores visuales por estado
const STATUS_CONFIG = {
  Programada: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Circle,
    label: 'Programada',
    dotColor: 'bg-blue-400',
  },
  Confirmada: {
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    icon: CheckCircle2,
    label: 'Confirmada',
    dotColor: 'bg-green-400',
  },
  Reagendada: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: AlertCircle,
    label: 'Reagendada',
    dotColor: 'bg-yellow-400',
  },
  Cancelada: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle,
    label: 'Cancelada',
    dotColor: 'bg-red-400',
  },
  Completada: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: CheckCircle2,
    label: 'Completada',
    dotColor: 'bg-purple-400',
  },
  En_Curso: {
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    icon: Clock,
    label: 'En Curso',
    dotColor: 'bg-cyan-400',
  },
  No_Acudio: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    icon: XCircle,
    label: 'No Acudió',
    dotColor: 'bg-gray-400',
  },
} as const;

export function AgendaAppointmentCard({
  appointment,
  onClick,
  compact = false,
}: AgendaAppointmentCardProps) {
  const statusConfig = useMemo(() => {
    return (
      STATUS_CONFIG[appointment.estado as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.Programada
    );
  }, [appointment.estado]);

  const StatusIcon = statusConfig.icon;

  // Formatear hora
  const formattedTime = useMemo(() => {
    if (!appointment.horaConsulta) return '00:00';
    const parts = appointment.horaConsulta.split(':');
    return `${parts[0]}:${parts[1]}`;
  }, [appointment.horaConsulta]);

  // Determinar si es urgente o prioritaria
  const isUrgent = appointment.tipo === 'urgencia';

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left rounded-lg border px-3 py-2 transition-all',
          statusConfig.borderColor,
          statusConfig.bgColor,
          'hover:bg-white/5 hover:border-white/20',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'active:scale-[0.98]'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotColor)} />
              <p className="text-sm font-medium text-white truncate">
                {appointment.paciente}
              </p>
            </div>
            <p className="text-xs text-white/60 mt-0.5">{formattedTime}</p>
          </div>
          {isUrgent && (
            <span className="flex-shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-300">
              URGENTE
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border p-3 transition-all',
        statusConfig.borderColor,
        statusConfig.bgColor,
        'hover:bg-white/5 hover:border-white/30',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'active:scale-[0.98]'
      )}
    >
      {/* Header con estado e icono */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
          <span className={cn('text-xs font-medium', statusConfig.color)}>
            {statusConfig.label}
          </span>
        </div>
        {isUrgent && (
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-300">
            URGENTE
          </span>
        )}
      </div>

      {/* Información del paciente */}
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <User className="h-3.5 w-3.5 text-white/40 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold text-white leading-tight">
            {appointment.paciente}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
          <p className="text-xs text-white/70">
            {formattedTime} · {appointment.duracionMinutos} min
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
          <p className="text-xs text-white/70">{appointment.sede}</p>
        </div>

        {appointment.motivoConsulta && (
          <div className="mt-2 rounded-lg bg-white/5 px-2 py-1">
            <p className="text-xs text-white/60 line-clamp-2">
              {appointment.motivoConsulta}
            </p>
          </div>
        )}

        {/* Indicador de confirmación */}
        {appointment.confirmadoPaciente && (
          <div className="flex items-center gap-1.5 mt-2">
            <Phone className="h-3 w-3 text-green-400" />
            <span className="text-[10px] text-green-400">
              Confirmado por paciente
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
