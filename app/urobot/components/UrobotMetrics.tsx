'use client';

import React from 'react';
import { KPICard } from './KPICard';
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
        <KPICard
          title="Total Mensajes"
          value={kpi.totalMensajes.toLocaleString()}
          subtitle={`${kpi.mensajesHoy} hoy`}
          icon={MessageSquare}
          color="text-blue-600 dark:text-blue-400"
        />
        <KPICard
          title="Tasa de Éxito"
          value={`${kpi.tasaExito}%`}
          icon={TrendingUp}
          color={kpi.tasaExito >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}
        />
        <KPICard
          title="Errores Totales"
          value={kpi.totalErrores}
          subtitle={`${kpi.erroresHoy} hoy`}
          icon={XCircle}
          color={kpi.totalErrores > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
        />
        <KPICard
          title="Tiempo Respuesta"
          value={`${(kpi.tiempoPromedioMs / 1000).toFixed(1)}s`}
          icon={Clock}
          color={kpi.tiempoPromedioMs < 3000 ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}
        />
      </div>
      
      {/* Fila 2: Métricas secundarias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <KPICard
          title="Usuarios Únicos"
          value={kpi.usuariosUnicos}
          icon={Users}
          color="text-purple-600 dark:text-purple-400"
        />
        <KPICard
          title="Alertas Pendientes"
          value={kpi.alertasPendientes}
          icon={AlertTriangle}
          color={kpi.alertasPendientes > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}
        />
        <KPICard
          title="Mensajes Hoy"
          value={kpi.mensajesHoy}
          icon={Activity}
          color="text-cyan-600 dark:text-cyan-400"
        />
        <KPICard
          title="Errores Hoy"
          value={kpi.erroresHoy}
          icon={Zap}
          color={kpi.erroresHoy > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
        />
      </div>
    </div>
  );
});

UrobotMetrics.displayName = 'UrobotMetrics';
