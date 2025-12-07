'use client';

import React from 'react';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CalendarDays
} from 'lucide-react';

interface ConsultasStats {
  total: number;
  programadas: number;
  confirmadas: number;
  hoy: number;
  semana: number;
}

interface ConsultasMetricsProps {
  stats: ConsultasStats;
  loading?: boolean;
}

export const ConsultasMetrics = React.memo(function ConsultasMetrics({ stats, loading }: ConsultasMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Estilos consistentes
  const labelClass = "text-[11px] font-medium uppercase tracking-wider";
  const metricClass = "text-xl font-bold tabular-nums";
  const hintClass = "text-[10px] text-muted-foreground mt-1";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {/* Total */}
      <div className="bg-card border border-border rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <BarChart3 className="w-10 h-10" />
        </div>
        <div>
          <div className={`${labelClass} text-muted-foreground`}>Total</div>
          <div className={`${metricClass} text-foreground`}>{stats.total.toLocaleString()}</div>
        </div>
        <div className={hintClass}>Histórico</div>
      </div>

      {/* Programadas */}
      <div className="bg-card border border-blue-500/20 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Calendar className="w-10 h-10 text-blue-400" />
        </div>
        <div>
          <div className={`${labelClass} text-blue-600 dark:text-blue-400`}>Programadas</div>
          <div className={`${metricClass} text-foreground`}>{stats.programadas}</div>
        </div>
        <div className={hintClass}>Por confirmar</div>
      </div>

      {/* Confirmadas */}
      <div className="bg-card border border-emerald-500/20 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <div className={`${labelClass} text-emerald-600 dark:text-emerald-400`}>Confirmadas</div>
          <div className={`${metricClass} text-emerald-600 dark:text-emerald-400`}>{stats.confirmadas}</div>
        </div>
        <div className={hintClass}>Listas para atender</div>
      </div>

      {/* Hoy */}
      <div className="bg-card border border-purple-500/20 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="w-10 h-10 text-purple-400" />
        </div>
        <div>
          <div className={`${labelClass} text-purple-600 dark:text-purple-400 flex items-center gap-1`}>
            <span className="animate-pulse">●</span> Hoy
          </div>
          <div className={`${metricClass} text-foreground`}>{stats.hoy}</div>
        </div>
        <div className={hintClass}>Agenda del día</div>
      </div>

      {/* Esta semana */}
      <div className="bg-card border border-amber-500/20 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <CalendarDays className="w-10 h-10 text-amber-400" />
        </div>
        <div>
          <div className={`${labelClass} text-amber-600 dark:text-amber-400`}>Semana</div>
          <div className={`${metricClass} text-foreground`}>{stats.semana}</div>
        </div>
        <div className={hintClass}>Próximos 7 días</div>
      </div>
    </div>
  );
});
