'use client';

import React from 'react';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import type { UrobotKPI } from '@/hooks/urobot/useUrobotStats';
import { 
  MessageSquare,
  TrendingUp,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  Activity,
  Zap,
} from 'lucide-react';

interface UrobotMetricsProps {
  kpi: UrobotKPI;
}

export const UrobotMetrics = React.memo(function UrobotMetrics({ kpi }: UrobotMetricsProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Fila 1: Métricas principales */}
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-4 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Total Mensajes"
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
          value={kpi.totalMensajes.toLocaleString()}
          subtitle={`${kpi.mensajesHoy} hoy`}
          iconComponent={MessageSquare}
          iconColor="text-blue-400"
        />
        <MetricCard
          variant="kpi"
          title="Tasa de Éxito"
          value={`${kpi.tasaExito}%`}
          iconComponent={TrendingUp}
          iconColor={kpi.tasaExito >= 90 ? 'text-emerald-400' : 'text-yellow-400'}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
        <MetricCard
          variant="kpi"
          title="Errores Totales"
          value={kpi.totalErrores}
          subtitle={`${kpi.erroresHoy} hoy`}
          iconComponent={XCircle}
          iconColor={kpi.totalErrores > 0 ? 'text-red-400' : 'text-emerald-400'}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
        <MetricCard
          variant="kpi"
          title="Tiempo Respuesta"
          value={`${(kpi.tiempoPromedioMs / 1000).toFixed(1)}s`}
          iconComponent={Clock}
          iconColor={kpi.tiempoPromedioMs < 3000 ? 'text-emerald-400' : 'text-yellow-400'}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
      </div>
      
      {/* Fila 2: Métricas secundarias */}
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-4 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Usuarios Únicos"
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
          value={kpi.usuariosUnicos}
          iconComponent={Users}
          iconColor="text-purple-400"
        />
        <MetricCard
          variant="kpi"
          title="Alertas Pendientes"
          value={kpi.alertasPendientes}
          iconComponent={AlertTriangle}
          iconColor={kpi.alertasPendientes > 0 ? 'text-orange-400' : 'text-emerald-400'}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
        <MetricCard
          variant="kpi"
          title="Mensajes Hoy"
          value={kpi.mensajesHoy}
          iconComponent={Activity}
          iconColor="text-cyan-400"
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
        <MetricCard
          variant="kpi"
          title="Errores Hoy"
          value={kpi.erroresHoy}
          iconComponent={Zap}
          iconColor={kpi.erroresHoy > 0 ? 'text-red-400' : 'text-emerald-400'}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
      </div>
    </div>
  );
});

UrobotMetrics.displayName = 'UrobotMetrics';
