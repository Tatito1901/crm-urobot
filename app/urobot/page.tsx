'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUrobotStats, marcarAlertaRevisada } from '@/hooks/useUrobotStats';
import { Bot, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

// Componentes optimizados
import { UrobotMetrics } from './components/UrobotMetrics';
import { ErrorsTable } from './components/ErrorsTable';
import { AlertasPanel } from './components/AlertasPanel';

// Lazy loading de gráficos (heavy components)
const ActivityChart = dynamic(
  () => import('./components/charts/ActivityChart').then(mod => ({ default: mod.ActivityChart })),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const InteractionsPieChart = dynamic(
  () => import('./components/charts/InteractionsPieChart').then(mod => ({ default: mod.InteractionsPieChart })),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const HorizontalBarChart = dynamic(
  () => import('./components/charts/HorizontalBarChart').then(mod => ({ default: mod.HorizontalBarChart })),
  { 
    loading: () => <ChartSkeleton height={180} />,
    ssr: false,
  }
);

// Skeleton para carga de gráficos
function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="animate-pulse bg-muted/50 rounded" style={{ height }} />
      </CardContent>
    </Card>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function UrobotPage() {
  const [dias, setDias] = useState(7);
  const [mounted, setMounted] = useState(false);
  const { stats, kpi, isLoading, refetch } = useUrobotStats(dias);

  // Prevenir mismatch de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRevisarAlerta = async (alertaId: string) => {
    try {
      await marcarAlertaRevisada(alertaId);
      refetch();
    } catch (error) {
      console.error('Error al marcar alerta:', error);
    }
  };

  // Calcular estado general
  const estadoGeneral = useMemo(() => {
    if (kpi.tasaExito >= 95) return { status: 'Óptimo', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
    if (kpi.tasaExito >= 85) return { status: 'Estable', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500' };
    return { status: 'Atención', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
  }, [kpi.tasaExito]);

  // Estado de carga seguro para hidratación
  const showLoading = mounted && isLoading;

  return (
    <PageShell
      eyebrow="Monitoreo"
      title={
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-600 dark:text-cyan-400" />
          <span className="text-lg sm:text-xl">Estado de UroBot</span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${estadoGeneral.bg}/20 ${estadoGeneral.color}`}>
            <span className={`w-2 h-2 rounded-full ${estadoGeneral.bg} animate-pulse`} />
            {estadoGeneral.status}
          </div>
        </div>
      }
      description="Monitoreo en tiempo real del asistente virtual"
      headerSlot={
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-muted border border-border text-sm"
          >
            <option value={1}>24h</option>
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={showLoading}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${showLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      }
    >
      {/* KPIs principales - Grid responsivo optimizado */}
      <section className="mb-8">
        <UrobotMetrics kpi={kpi} />
      </section>

      {/* Gráficos principales - 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ActivityChart data={stats.evolucionHoras} />
        <InteractionsPieChart data={stats.interaccionesPorTipo} />
      </div>

      {/* Segunda fila de gráficos - 3 columnas en desktop, stack en mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <HorizontalBarChart 
          data={stats.erroresPorTipo} 
          title="Errores por Tipo"
          emptyMessage="Sin errores en el período"
        />
        <HorizontalBarChart 
          data={stats.herramientasUsadas} 
          title="Herramientas Usadas"
          emptyMessage="Sin datos de herramientas"
        />
        <InteractionsPieChart 
          data={stats.sentimentDistribucion} 
          title="Sentiment de Usuarios"
          innerRadius={40}
        />
      </div>

      {/* Tablas de errores y alertas - Stack en mobile, 2 cols en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos errores */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              Últimos Errores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorsTable errors={stats.ultimosErrores} />
          </CardContent>
        </Card>

        {/* Alertas pendientes */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              Alertas Pendientes ({stats.alertasPendientes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertasPanel alertas={stats.alertasPendientes} onRevisar={handleRevisarAlerta} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
