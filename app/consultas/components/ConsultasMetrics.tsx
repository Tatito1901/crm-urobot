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
    white: 'bg-white border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/20 dark:text-white',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300',
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 shadow-sm dark:shadow-none transition-colors ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-slate-500 dark:text-white/60 font-medium">{label}</span>
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
