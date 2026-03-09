/**
 * ============================================================
 * STATUS BADGE - Badge profesional de estados
 * ============================================================
 * Badges con colores médicos profesionales y iconos
 */

import React from 'react';
import { CheckCircle2, Clock, XCircle, Calendar, AlertCircle, MinusCircle } from 'lucide-react';
import type { ConsultaEstado } from '@/types/consultas';

interface StatusBadgeProps {
  estado: ConsultaEstado;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const estadoConfig: Record<ConsultaEstado, { color: string; icon: React.ElementType; label: string }> = {
  Programada: {
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: Calendar,
    label: 'Programada',
  },
  Pendiente: {
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: AlertCircle,
    label: 'Pendiente',
  },
  En_Curso: {
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: Clock,
    label: 'En Curso',
  },
  Completada: {
    color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    icon: CheckCircle2,
    label: 'Completada',
  },
  Cancelada: {
    color: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: XCircle,
    label: 'Cancelada',
  },
  No_Asistio: {
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    icon: MinusCircle,
    label: 'No Asistió',
  },
};

const sizeConfig = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  estado, 
  size = 'md',
  showIcon = true 
}) => {
  const config = estadoConfig[estado] || estadoConfig.Programada;
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.color}
        ${sizeConfig[size]}
        transition-colors
      `}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </span>
  );
};
