'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, AlertTriangle } from 'lucide-react';
import { spacing, layouts } from '@/app/lib/design-system';
import { ChartSkeleton } from '../ChartSkeleton';
import { UrobotMetrics } from '../UrobotMetrics';
import { ErrorsTable } from '../ErrorsTable';
import { AlertasPanel } from '../AlertasPanel';
import type { UrobotKPI, TimeSeriesData, ChartData, ErrorLog, Alerta } from '@/hooks/urobot/useUrobotStats';

const ActivityChart = dynamic(
  () => import('../charts/ActivityChart').then(mod => ({ default: mod.ActivityChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const InteractionsPieChart = dynamic(
  () => import('../charts/InteractionsPieChart').then(mod => ({ default: mod.InteractionsPieChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const HorizontalBarChart = dynamic(
  () => import('../charts/HorizontalBarChart').then(mod => ({ default: mod.HorizontalBarChart })),
  { loading: () => <ChartSkeleton height={180} />, ssr: false }
);

interface MonitoreoTabProps {
  kpi: UrobotKPI;
  evolucionHoras: TimeSeriesData[];
  interaccionesPorTipo: ChartData[];
  erroresPorTipo: ChartData[];
  herramientasUsadas: ChartData[];
  sentimentDistribucion: ChartData[];
  ultimosErrores: ErrorLog[];
  alertasPendientes: Alerta[];
  onRevisarAlerta: (id: string) => void;
}

export function MonitoreoTab({
  kpi,
  evolucionHoras,
  interaccionesPorTipo,
  erroresPorTipo,
  herramientasUsadas,
  sentimentDistribucion,
  ultimosErrores,
  alertasPendientes,
  onRevisarAlerta,
}: MonitoreoTabProps) {
  return (
    <>
      {/* KPIs técnicos */}
      <section className={spacing.sectionGap}>
        <UrobotMetrics kpi={kpi} />
      </section>

      {/* Gráficos principales */}
      <div className={`${layouts.grid2} ${spacing.sectionGap}`}>
        <ActivityChart data={evolucionHoras} />
        <InteractionsPieChart data={interaccionesPorTipo} />
      </div>

      {/* Segunda fila de gráficos */}
      <div className={`${layouts.grid3} ${spacing.sectionGap}`}>
        <HorizontalBarChart
          data={erroresPorTipo}
          title="Errores por Tipo"
          emptyMessage="Sin errores en el período"
        />
        <HorizontalBarChart
          data={herramientasUsadas}
          title="Herramientas Usadas"
          emptyMessage="Sin datos de herramientas"
        />
        <InteractionsPieChart
          data={sentimentDistribucion}
          title="Sentiment de Usuarios"
          innerRadius={40}
        />
      </div>

      {/* Tablas de errores y alertas */}
      <div className={layouts.grid2}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              Últimos Errores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorsTable errors={ultimosErrores} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Alertas Pendientes ({alertasPendientes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertasPanel alertas={alertasPendientes} onRevisar={onRevisarAlerta} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
