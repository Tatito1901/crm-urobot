'use client';

import React, { memo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CalendarDays
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  color: 'white' | 'blue' | 'emerald' | 'purple' | 'amber';
  icon: React.ReactNode;
  className?: string;
}

const StatCard = memo(({ label, value, color, icon, className = '' }: StatCardProps) => {
  const colorClasses = {
    white: 'bg-card border-border text-foreground',
    blue: 'bg-blue-500/5 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
    emerald: 'bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    purple: 'bg-purple-500/5 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400',
    amber: 'bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 shadow-sm transition-colors ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-medium opacity-80">{label}</span>
        <span className="opacity-80">{icon}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold">{value}</div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

interface ConsultasStats {
  total: number;
  programadas: number;
  confirmadas: number;
  hoy: number;
  semana: number;
}

interface ConsultasMetricsProps {
  stats: ConsultasStats;
}

export const ConsultasMetrics = memo(function ConsultasMetrics({ stats }: ConsultasMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      <StatCard
        label="Total"
        value={stats.total}
        color="white"
        icon={<BarChart3 className="h-5 w-5" />}
      />
      <StatCard
        label="Programadas"
        value={stats.programadas}
        color="blue"
        icon={<Calendar className="h-5 w-5" />}
      />
      <StatCard
        label="Confirmadas"
        value={stats.confirmadas}
        color="emerald"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <StatCard
        label="Hoy"
        value={stats.hoy}
        color="purple"
        icon={<Clock className="h-5 w-5" />}
      />
      <StatCard
        label="Esta semana"
        value={stats.semana}
        color="amber"
        icon={<CalendarDays className="h-5 w-5" />}
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
});
