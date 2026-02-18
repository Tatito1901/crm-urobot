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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Total Mensajes"
          value={kpi.totalMensajes.toLocaleString()}
          subtitle={`${kpi.mensajesHoy} hoy`}
          iconComponent={MessageSquare}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          variant="kpi"
          title="Tasa de Éxito"
          value={`${kpi.tasaExito}%`}
          iconComponent={TrendingUp}
          iconColor={kpi.tasaExito >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}
        />
        <MetricCard
          variant="kpi"
          title="Errores Totales"
          value={kpi.totalErrores}
          subtitle={`${kpi.erroresHoy} hoy`}
          iconComponent={XCircle}
          iconColor={kpi.totalErrores > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
        />
        <MetricCard
          variant="kpi"
          title="Tiempo Respuesta"
          value={`${(kpi.tiempoPromedioMs / 1000).toFixed(1)}s`}
          iconComponent={Clock}
          iconColor={kpi.tiempoPromedioMs < 3000 ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}
        />
      </div>
      
      {/* Fila 2: Métricas secundarias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Usuarios Únicos"
          value={kpi.usuariosUnicos}
          iconComponent={Users}
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <MetricCard
          variant="kpi"
          title="Alertas Pendientes"
          value={kpi.alertasPendientes}
          iconComponent={AlertTriangle}
          iconColor={kpi.alertasPendientes > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}
        />
        <MetricCard
          variant="kpi"
          title="Mensajes Hoy"
          value={kpi.mensajesHoy}
          iconComponent={Activity}
          iconColor="text-cyan-600 dark:text-cyan-400"
        />
        <MetricCard
          variant="kpi"
          title="Errores Hoy"
          value={kpi.erroresHoy}
          iconComponent={Zap}
          iconColor={kpi.erroresHoy > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
        />
      </div>
    </div>
  );
});

UrobotMetrics.displayName = 'UrobotMetrics';
