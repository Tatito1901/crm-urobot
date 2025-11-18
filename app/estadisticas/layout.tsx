'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Calendar,
  Target,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';

interface StatsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const STATS_SECTIONS: StatsSection[] = [
  {
    id: 'resumen',
    label: 'Resumen General',
    icon: BarChart3,
    description: 'Vista global de todas las métricas'
  },
  {
    id: 'funnel',
    label: 'Funnel de Conversión',
    icon: TrendingUp,
    description: 'Lead → Paciente → Consulta'
  },
  {
    id: 'mensajeria',
    label: 'Análisis de Mensajería',
    icon: MessageSquare,
    description: 'Engagement y conversaciones'
  },
  {
    id: 'canales',
    label: 'Canales de Marketing',
    icon: Target,
    description: 'ROI por canal de adquisición'
  },
  {
    id: 'consultas',
    label: 'Performance Consultas',
    icon: Calendar,
    description: 'Agendamiento y asistencia'
  },
  {
    id: 'leads',
    label: 'Análisis de Leads',
    icon: Users,
    description: 'Temperatura y calidad'
  },
  {
    id: 'operativo',
    label: 'Operativo Real-time',
    icon: Activity,
    description: 'Métricas en tiempo real'
  },
];

export default function EstadisticasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export { STATS_SECTIONS };
