'use client';

import React from 'react';
import { Users, Calendar, TrendingUp, Repeat, CheckCircle, XCircle, UserCheck, Activity } from 'lucide-react';
import type { KPIClinico } from '@/hooks/useClinicalStats';

interface Props {
  data: KPIClinico;
}

export function DashboardKPIsClinico({ data }: Props) {
  const kpis = [
    {
      label: 'Pacientes Únicos',
      value: data.pacientesUnicos.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Consultas',
      value: data.totalConsultas.toLocaleString(),
      icon: Calendar,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Tasa Asistencia',
      value: `${data.tasaAsistenciaGlobal}%`,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Consultas/Paciente',
      value: data.consultasPorPaciente.toFixed(1),
      icon: Activity,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Primera Vez',
      value: data.primeraVez.toLocaleString(),
      icon: UserCheck,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Seguimientos',
      value: data.seguimiento.toLocaleString(),
      icon: Repeat,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Ratio Seg/1era',
      value: data.ratioSeguimientoPrimera.toFixed(2),
      icon: TrendingUp,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      tooltip: 'Proporción de seguimientos por cada primera vez'
    },
    {
      label: 'Canceladas',
      value: data.canceladas.toLocaleString(),
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div 
            key={index}
            className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all group"
            title={kpi.tooltip}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                {kpi.label}
              </span>
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums">
              {kpi.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
