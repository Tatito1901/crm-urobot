'use client';

import React, { memo } from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'red' | 'amber';
}

const StatCard = memo(({ label, value, description, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-slate-900/40 border-blue-500/20',
    emerald: 'bg-slate-900/40 border-emerald-500/20',
    red: 'bg-slate-900/40 border-red-500/20',
    amber: 'bg-slate-900/40 border-amber-500/20',
  };

  const textColors = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  };

  const titleColors = {
    blue: 'text-blue-300',
    emerald: 'text-emerald-300',
    red: 'text-red-300',
    amber: 'text-amber-300',
  };

  return (
    <div className={`rounded-lg border p-4 flex flex-col justify-between relative overflow-hidden ${colorClasses[color]}`}>
      <div className="absolute top-0 right-0 p-3 opacity-5">
        <div className={`w-12 h-12 ${textColors[color]}`}>{icon}</div>
      </div>
      <div>
        <div className={`text-xs mb-1 font-medium ${titleColors[color]}`}>{label}</div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
      </div>
      <div className="text-[10px] text-slate-500 mt-2">{description}</div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

interface Stats {
  pendientes: number;
  enviados: number;
  errores: number;
}

interface ConfirmacionesMetricsProps {
  stats: Stats;
}

export const ConfirmacionesMetrics = memo(function ConfirmacionesMetrics({ stats }: ConfirmacionesMetricsProps) {
  return (
    <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 mb-6">
      <StatCard
        label="Pendientes"
        value={stats.pendientes}
        description="Aguardando confirmación"
        icon={<Clock className="w-full h-full" />}
        color="amber"
      />
      <StatCard
        label="Enviados"
        value={stats.enviados}
        description="Recordatorios completados"
        icon={<CheckCircle2 className="w-full h-full" />}
        color="emerald"
      />
      <StatCard
        label="Errores"
        value={stats.errores}
        description="Requieren revisión"
        icon={<AlertTriangle className="w-full h-full" />}
        color="red"
      />
    </section>
  );
});
