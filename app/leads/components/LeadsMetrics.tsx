'use client';

import React from 'react';
import { Users, UserCheck, UserPlus, Clock, Calendar } from 'lucide-react';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import { MetricCardSkeleton } from '@/app/components/common/SkeletonLoader';

interface LeadsStats {
  total: number;
  nuevos: number;
  interactuando: number;
  contactados: number;
  citaPropuesta: number;
  enSeguimiento: number;
  citaAgendada: number;
  convertidos: number;
  perdidos: number;
  activos: number;
}

interface LeadsMetricsProps {
  stats: LeadsStats;
  loading?: boolean;
}

export const LeadsMetrics = React.memo(function LeadsMetrics({ stats, loading }: LeadsMetricsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>
    );
  }

  const enProceso = stats.interactuando + stats.contactados + stats.citaPropuesta;
  const conversionRate = stats.activos > 0
    ? Math.round((stats.convertidos / (stats.activos + stats.convertidos)) * 100)
    : 0;

  return (
    <div className="space-y-3">
      {/* Hero pair */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard
          title="Pipeline Activo"
          value={stats.activos}
          icon={<Users className="w-5 h-5" />}
          color="teal"
          subtitle="Leads en gestión"
        />
        <MetricCard
          title="Nuevos"
          value={stats.nuevos}
          icon={<UserPlus className="w-5 h-5" />}
          color="blue"
          subtitle="< 24h sin contactar"
          description={stats.nuevos > 0 ? 'Requieren atención' : undefined}
        />
      </div>

      {/* Secondary trio */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          title="En proceso"
          value={enProceso}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Bot + Contactados"
        />
        <MetricCard
          title="Citas"
          value={stats.citaAgendada}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
          subtitle="Agendadas"
        />
        <MetricCard
          title="Convertidos"
          value={stats.convertidos}
          icon={<UserCheck className="w-5 h-5" />}
          color="emerald"
          subtitle={`${conversionRate}% tasa`}
        />
      </div>
    </div>
  );
});
