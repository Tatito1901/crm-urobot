/**
 * ============================================================
 * CONSTANTES CENTRALIZADAS - Agenda
 * ============================================================
 * Configuraciones centralizadas para evitar duplicación
 */

import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Building2, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ========== ESTADOS ==========
export type EstadoConsulta = 
  | 'Programada' 
  | 'Confirmada' 
  | 'Completada' 
  | 'Cancelada' 
  | 'Reagendada'
  | 'En_Curso'
  | 'No_Acudio';

export interface EstadoConfig {
  value: EstadoConsulta;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: LucideIcon;
}

export const ESTADOS: EstadoConfig[] = [
  {
    value: 'Programada',
    label: 'Programada',
    color: 'blue-500',
    bgClass: 'bg-blue-500/15',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    icon: Calendar,
  },
  {
    value: 'Confirmada',
    label: 'Confirmada',
    color: 'emerald-500',
    bgClass: 'bg-emerald-500/15',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  {
    value: 'Completada',
    label: 'Completada',
    color: 'slate-500',
    bgClass: 'bg-slate-500/15',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-500/30',
    icon: CheckCircle2,
  },
  {
    value: 'Cancelada',
    label: 'Cancelada',
    color: 'red-500',
    bgClass: 'bg-red-500/15',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/30',
    icon: XCircle,
  },
  {
    value: 'Reagendada',
    label: 'Reagendada',
    color: 'amber-500',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    icon: AlertCircle,
  },
  {
    value: 'En_Curso',
    label: 'En Curso',
    color: 'purple-500',
    bgClass: 'bg-purple-500/15',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    icon: Clock,
  },
  {
    value: 'No_Acudio',
    label: 'No Acudió',
    color: 'orange-500',
    bgClass: 'bg-orange-500/15',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    icon: XCircle,
  },
];

export const getEstadoConfig = (estado: string): EstadoConfig => {
  return ESTADOS.find(e => e.value === estado) || ESTADOS[0];
};

// ========== SEDES ==========
export type Sede = 'POLANCO' | 'SATELITE' | 'ALL';

export interface SedeConfig {
  value: Sede;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  borderLeftClass: string;
  icon: LucideIcon;
}

export const SEDES: SedeConfig[] = [
  {
    value: 'POLANCO',
    label: 'Polanco',
    color: 'purple-500',
    bgClass: 'bg-purple-500/15',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    borderLeftClass: 'border-l-purple-500',
    icon: Building2,
  },
  {
    value: 'SATELITE',
    label: 'Satélite',
    color: 'cyan-500',
    bgClass: 'bg-cyan-500/15',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30',
    borderLeftClass: 'border-l-cyan-500',
    icon: MapPin,
  },
  {
    value: 'ALL',
    label: 'Todas',
    color: 'slate-500',
    bgClass: 'bg-slate-500/15',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-500/30',
    borderLeftClass: 'border-l-slate-500',
    icon: Building2,
  },
];

export const getSedeConfig = (sede: string): SedeConfig => {
  return SEDES.find(s => s.value === sede) || SEDES[0];
};

// ========== TIPOS DE CONSULTA ==========
export type TipoConsulta = 
  | 'primera_vez'
  | 'subsecuente'
  | 'control_post_op'
  | 'urgencia'
  | 'procedimiento_menor'
  | 'valoracion_prequirurgica'
  | 'teleconsulta';

export interface TipoConsultaConfig {
  value: TipoConsulta;
  label: string;
}

export const TIPOS_CONSULTA: TipoConsultaConfig[] = [
  { value: 'primera_vez', label: 'Primera vez' },
  { value: 'subsecuente', label: 'Subsecuente' },
  { value: 'control_post_op', label: 'Control post-op' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'procedimiento_menor', label: 'Procedimiento menor' },
  { value: 'valoracion_prequirurgica', label: 'Valoración pre-quirúrgica' },
  { value: 'teleconsulta', label: 'Teleconsulta' },
];

// ========== PRIORIDADES ==========
export type Prioridad = 'normal' | 'alta' | 'urgente';

export interface PrioridadConfig {
  value: Prioridad;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export const PRIORIDADES: PrioridadConfig[] = [
  {
    value: 'normal',
    label: 'Normal',
    color: 'slate-500',
    bgClass: 'bg-slate-500/15',
    textClass: 'text-slate-400',
  },
  {
    value: 'alta',
    label: 'Alta',
    color: 'amber-500',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-400',
  },
  {
    value: 'urgente',
    label: 'Urgente',
    color: 'red-500',
    bgClass: 'bg-red-500/15',
    textClass: 'text-red-400',
  },
];

export const getPrioridadConfig = (prioridad: string): PrioridadConfig => {
  return PRIORIDADES.find(p => p.value === prioridad) || PRIORIDADES[0];
};
