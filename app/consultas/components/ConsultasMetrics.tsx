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
    white: 'bg-white/5 border-white/20 text-white',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-white/60 font-medium">{label}</span>
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
