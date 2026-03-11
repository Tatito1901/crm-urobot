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
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-3 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 sm:h-24 bg-muted/50 rounded-lg animate-pulse min-w-[130px] max-w-[170px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink" />
        ))}
      </div>
    );
  }

  // Estilos consistentes
  const labelClass = "text-[11px] font-medium uppercase tracking-wider";
  const metricClass = "text-xl font-bold tabular-nums";
  const hintClass = "text-[10px] text-muted-foreground mt-1";

  const cards: { label: string; value: number; hint: string; icon: typeof BarChart3; color: string; iconBg: string }[] = [
    { label: 'Total', value: stats.total, hint: 'Histórico', icon: BarChart3, color: 'text-muted-foreground', iconBg: 'bg-white/[0.04]' },
    { label: 'Programadas', value: stats.programadas, hint: 'Por confirmar', icon: Calendar, color: 'text-sky-400', iconBg: 'bg-sky-500/10' },
    { label: 'Confirmadas', value: stats.confirmadas, hint: 'Listas', icon: CheckCircle2, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    { label: 'Hoy', value: stats.hoy, hint: 'Agenda del día', icon: Clock, color: 'text-purple-400', iconBg: 'bg-purple-500/10' },
    { label: 'Semana', value: stats.semana, hint: 'Próximos 7 días', icon: CalendarDays, color: 'text-amber-400', iconBg: 'bg-amber-500/10' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-3 mb-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-card border border-border rounded-xl p-3 sm:p-3.5 flex flex-col gap-2 transition-colors hover:bg-white/[0.02] min-w-[130px] max-w-[170px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${card.iconBg}`}>
                <Icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <span className={`${labelClass} ${card.color}`}>{card.label}</span>
            </div>
            <div className={`${metricClass} text-foreground`}>{card.value.toLocaleString()}</div>
            <div className={hintClass}>{card.hint}</div>
          </div>
        );
      })}
    </div>
  );
});
