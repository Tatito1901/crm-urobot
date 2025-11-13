'use client';

import { useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import { formatDate, STATE_COLORS } from '@/app/lib/crm-data';
import { Badge } from '@/app/components/crm/ui';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { MetricCard } from '@/app/components/analytics/MetricCard';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { FullPageLoader, EmptyState } from '@/app/components/common/LoadingStates';
import { MetricCardSkeleton, ChartSkeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

// Lazy load de gráficos pesados para mejorar rendimiento mobile
const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-[200px] animate-pulse bg-white/5 rounded-xl" />,
  ssr: false,
});

const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[250px] animate-pulse bg-white/5 rounded-xl" />,
  ssr: false,
});

export default function DashboardPage() {
  // ✅ Datos reales de Supabase
  const { metrics: dm, loading: loadingMetrics, refetch: refetchMetrics } = useDashboardMetrics();
  const { leads, loading: loadingLeads, refetch: refetchLeads } = useLeads();
  const { consultas, loading: loadingConsultas, refetch: refetchConsultas } = useConsultas();

  const handleRefresh = async () => {
    await Promise.all([refetchMetrics(), refetchLeads(), refetchConsultas()]);
  };

  // Métricas balanceadas para MVP - Esquema de colores unificado
  const metrics = dm ? [
    {
      title: 'Leads totales',
      value: dm.leadsTotal.toLocaleString('es-MX'),
      subtitle: `${dm.leadsConvertidos} convertidos`,
      icon: '👥',
      color: 'blue' as const,
      trend: dm.leadsMes > 0 ? { value: 12, isPositive: true } : undefined,
    },
    {
      title: 'Tasa de conversión',
      value: `${dm.tasaConversion}%`,
      subtitle: 'Meta: 35%',
      icon: '📈',
      color: 'blue' as const,
    },
    {
      title: 'Pacientes activos',
      value: dm.pacientesActivos.toLocaleString('es-MX'),
      subtitle: `Total: ${dm.totalPacientes}`,
      icon: '🏥',
      color: 'blue' as const,
    },
    {
      title: 'Consultas futuras',
      value: dm.consultasFuturas.toLocaleString('es-MX'),
      subtitle: `Hoy: ${dm.consultasHoy}`,
      icon: '📅',
      color: 'blue' as const,
      trend: dm.consultasHoy > 0 ? { value: 8, isPositive: true } : undefined,
    },
    {
      title: 'Pendientes confirmación',
      value: dm.pendientesConfirmacion.toLocaleString('es-MX'),
      subtitle: 'Requieren seguimiento',
      icon: '⏰',
      color: 'blue' as const,
    },
  ] : [];

  // Datos para gráfico de dona (consultas por sede)
  const sedesChartData = useMemo(() => dm ? [
    { label: 'Polanco', value: dm.polancoFuturas, color: '#3b82f6' },
    { label: 'Satélite', value: dm.sateliteFuturas, color: '#60a5fa' },
  ] : [], [dm]);

  // Datos para gráfico de barras (leads por estado)
  const leadsChartData = useMemo(() => {
    const estados = {
      Nuevo: 0,
      'En seguimiento': 0,
      Convertido: 0,
      Descartado: 0,
    };

    leads.forEach((lead) => {
      if (lead.estado in estados) {
        estados[lead.estado as keyof typeof estados]++;
      }
    });

    return [
      { label: 'Nuevo', value: estados.Nuevo, color: '#3b82f6' },
      { label: 'Seguimiento', value: estados['En seguimiento'], color: '#60a5fa' },
      { label: 'Convertido', value: estados.Convertido, color: '#93c5fd' },
      { label: 'Descartado', value: estados.Descartado, color: '#cbd5e1' },
    ];
  }, [leads]);

  // Datos para MVP - optimizado con useMemo
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.primerContacto).getTime() - new Date(a.primerContacto).getTime())
      .slice(0, 5);
  }, [leads]);

  const upcomingConsultas = useMemo(() => {
    const now = new Date();
    return consultas
      .filter((c) => new Date(c.fecha) >= now)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 5);
  }, [consultas]);

  // Loading state
  if (loadingMetrics && !dm) {
    return <FullPageLoader message="Cargando dashboard..." />;
  }

  return (
    <ErrorBoundary>
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#123456,_#050b1a_60%,_#03060f)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/40 blur-[180px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-24 pt-6 sm:gap-8 sm:px-6 sm:pb-28 sm:pt-8 md:gap-10 md:pt-10 lg:pb-20">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">Panel operativo</p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">Resumen general</h1>
              <p className="text-sm text-white/60">
                Visión consolidada de métricas y actividad reciente
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loadingMetrics || loadingLeads || loadingConsultas}
              className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(loadingMetrics || loadingLeads || loadingConsultas) ? 'Actualizando...' : '↻ Actualizar'}
            </button>
          </div>
        </header>

        {/* Métricas principales */}
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loadingMetrics && !dm ? (
            // ✅ QUICK WIN #5: Skeleton loaders mientras carga
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            metrics.map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                subtitle={metric.subtitle}
                icon={metric.icon}
                color={metric.color}
                trend={metric.trend}
              />
            ))
          )}
        </section>

        {/* Actividad reciente */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Leads recientes */}
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">
                    Leads recientes {loadingLeads && '(cargando...)'}
                  </CardTitle>
                  <CardDescription>Últimos contactos ingresados</CardDescription>
                </div>
                <Badge label={`${leads.length} totales`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentLeads.length === 0 ? (
                <p className="text-center text-sm text-white/40 py-8">No hay leads registrados</p>
              ) : (
                recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{lead.nombre}</p>
                      <p className="text-xs text-white/50">
                        {formatDate(lead.primerContacto)} · {lead.fuente}
                      </p>
                    </div>
                    <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Consultas próximas */}
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">
                    Consultas próximas {loadingConsultas && '(cargando...)'}
                  </CardTitle>
                  <CardDescription>Agenda de ambas sedes</CardDescription>
                </div>
                <Badge label={`${upcomingConsultas.length} próximas`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingConsultas.length === 0 ? (
                <p className="text-center text-sm text-white/40 py-8">No hay consultas programadas</p>
              ) : (
                upcomingConsultas.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{consulta.paciente}</p>
                      <p className="text-xs text-white/50">
                        {formatDate(consulta.fecha)} · {consulta.sede}
                      </p>
                    </div>
                    <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {/* Resumen operativo con gráficos mejorados */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico de leads por estado */}
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-white">Leads por estado</CardTitle>
              <CardDescription>Distribución actual del funnel</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsChartData.every(d => d.value === 0) ? (
                <EmptyState
                  icon="📊"
                  title="Sin datos"
                  description="No hay leads registrados aún"
                />
              ) : (
                <BarChart data={leadsChartData} height={250} />
              )}
            </CardContent>
          </Card>

          {/* Gráfico de consultas por sede */}
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-white">Consultas por sede</CardTitle>
              <CardDescription>Próximas 4 semanas</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              {sedesChartData.every(d => d.value === 0) ? (
                <EmptyState
                  icon="📅"
                  title="Sin consultas"
                  description="No hay consultas programadas"
                />
              ) : (
                <DonutChart
                  data={sedesChartData}
                  size={200}
                  thickness={35}
                  centerText={dm ? (dm.polancoFuturas + dm.sateliteFuturas).toString() : '0'}
                  centerSubtext="Total"
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
    </ErrorBoundary>
  );
}
