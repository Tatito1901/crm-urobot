'use client';

import { useMemo, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { formatDate, STATE_COLORS } from '@/app/lib/crm-data';
import { Badge } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
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
import { MetricCard } from '@/app/components/metrics';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { EmptyState } from '@/app/components/common/SkeletonLoader';

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

  const [activeTab, setActiveTab] = useState<'actividad' | 'graficas'>('actividad');

  const handleRefresh = async () => {
    await Promise.all([refetchMetrics(), refetchLeads(), refetchConsultas()]);
  };

  // Métricas para MVP
  const metrics = dm ? [
    {
      title: 'Leads totales',
      value: dm.leadsTotal.toLocaleString('es-MX'),
      subtitle: `${dm.leadsConvertidos} convertidos`,
      color: 'blue' as const,
    },
    {
      title: 'Tasa de conversión',
      value: `${dm.tasaConversion}%`,
      subtitle: 'Meta: 35%',
      color: 'blue' as const,
    },
    {
      title: 'Pacientes activos',
      value: dm.pacientesActivos.toLocaleString('es-MX'),
      subtitle: `Total: ${dm.totalPacientes}`,
      color: 'blue' as const,
    },
    {
      title: 'Consultas futuras',
      value: dm.consultasFuturas.toLocaleString('es-MX'),
      subtitle: `Hoy: ${dm.consultasHoy}`,
      color: 'blue' as const,
    },
    {
      title: 'Pendientes confirmación',
      value: dm.pendientesConfirmacion.toLocaleString('es-MX'),
      subtitle: 'Requieren seguimiento',
      color: 'blue' as const,
    },
  ] : [];

  // Datos para gráfico de dona (consultas por sede)
  const sedesChartData = useMemo(() => dm ? [
    { label: 'Polanco', value: dm.polancoFuturas, color: '#3b82f6' },
    { label: 'Satélite', value: dm.sateliteFuturas, color: '#60a5fa' },
  ] : [], [dm]);

  // Datos para gráfico de barras (leads por estado) - Optimizado
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
      { label: 'Seguimiento', value: estados['En seguimiento'], color: '#8b5cf6' },
      { label: 'Convertido', value: estados.Convertido, color: '#10b981' },
      { label: 'Descartado', value: estados.Descartado, color: '#64748b' },
    ];
  }, [leads]);

  // Métricas de leads calculadas
  const leadsStats = useMemo(() => {
    const total = leads.length;
    const convertidos = leads.filter(l => l.estado === 'Convertido').length;
    const enProceso = leads.filter(l => ['Nuevo', 'En seguimiento'].includes(l.estado)).length;
    const tasaConversion = total > 0 ? Math.round((convertidos / total) * 100) : 0;
    
    return { total, convertidos, enProceso, tasaConversion };
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

  // ✅ OPTIMIZACIÓN: Sin loading state separado, usar Suspense
  // El loading.tsx de Next.js maneja el estado inicial

  return (
    <ErrorBoundary>
      <PageShell
        accent
        eyebrow="Dashboard"
        title="Resumen general"
        description="Visión consolidada de métricas y actividad reciente del consultorio."
        compact
        headerSlot={
          <button
            onClick={handleRefresh}
            disabled={loadingMetrics || loadingLeads || loadingConsultas}
            className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-500/20 px-4 py-3 sm:px-5 sm:py-2.5 text-sm font-medium text-blue-200 backdrop-blur-sm border border-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 hover:border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 sm:hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 min-h-[44px] sm:min-h-0"
          >
            <span className="transition-transform group-hover:rotate-180 duration-500">
              {(loadingMetrics || loadingLeads || loadingConsultas) ? '⟳' : '↻'}
            </span>
            <span>{(loadingMetrics || loadingLeads || loadingConsultas) ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        }
      >
        <div className="flex flex-col gap-2 sm:gap-2 lg:gap-2 min-h-0">
          {/* Métricas principales */}
          <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                subtitle={metric.subtitle}
                color={metric.color}
                loading={loadingMetrics && !dm}
              />
            ))}
          </section>

          {/* Tabs sección secundaria */}
          <div
            className="inline-flex w-full flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-xs sm:text-sm"
            role="tablist"
            aria-label="Secciones del dashboard"
          >
            <button
              type="button"
              onClick={() => setActiveTab('actividad')}
              role="tab"
              aria-selected={activeTab === 'actividad'}
              className={`flex-1 min-w-[120px] rounded-lg px-3 py-1.5 text-center font-medium transition-all duration-200 ${
                activeTab === 'actividad'
                  ? 'bg-white/15 text-white shadow-sm shadow-blue-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              Actividad reciente
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('graficas')}
              role="tab"
              aria-selected={activeTab === 'graficas'}
              className={`flex-1 min-w-[120px] rounded-lg px-3 py-1.5 text-center font-medium transition-all duration-200 ${
                activeTab === 'graficas'
                  ? 'bg-white/15 text-white shadow-sm shadow-blue-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              Gráficas
            </button>
          </div>

          {activeTab === 'actividad' ? (
            <section className="grid gap-5 lg:gap-6 lg:grid-cols-2 min-h-0">
              {/* Leads recientes */}
              <Card className="group flex flex-col min-h-0 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-white tracking-tight">
                        Leads Recientes {loadingLeads && <span className="text-sm text-blue-400">↻</span>}
                      </CardTitle>
                      <CardDescription className="text-slate-400">Últimos contactos ingresados</CardDescription>
                    </div>
                    <Badge label={`${leads.length} totales`} variant="outline" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 relative lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                  {recentLeads.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-8">No hay leads registrados</p>
                  ) : (
                    recentLeads.map((lead, idx) => (
                      <div
                        key={lead.id}
                        className="group/item flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-3.5 text-sm hover:border-white/20 hover:from-white/[0.05] transition-all duration-200 cursor-pointer"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-white tracking-tight group-hover/item:text-blue-300 transition-colors">{lead.nombre}</p>
                          <p className="text-xs text-slate-400 font-mono">
                            {formatDate(lead.primerContacto)} <span className="text-slate-500">·</span> {lead.fuente}
                          </p>
                        </div>
                        <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Consultas próximas */}
              <Card className="group flex flex-col min-h-0 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-white tracking-tight">
                        Consultas Próximas {loadingConsultas && <span className="text-sm text-blue-400">↻</span>}
                      </CardTitle>
                      <CardDescription className="text-slate-400">Agenda de ambas sedes</CardDescription>
                    </div>
                    <Badge label={`${upcomingConsultas.length} próximas`} variant="outline" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 relative lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                  {upcomingConsultas.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-8">No hay consultas programadas</p>
                  ) : (
                    upcomingConsultas.map((consulta, idx) => (
                      <div
                        key={consulta.id}
                        className="group/item flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-3.5 text-sm hover:border-white/20 hover:from-white/[0.05] transition-all duration-200 cursor-pointer"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-white tracking-tight group-hover/item:text-blue-300 transition-colors">{consulta.paciente}</p>
                          <p className="text-xs text-slate-400 font-mono">
                            {formatDate(consulta.fecha)} <span className="text-slate-500">·</span> {consulta.sede}
                          </p>
                        </div>
                        <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>
          ) : (
            <section className="grid gap-5 lg:gap-6 lg:grid-cols-2 min-h-0">
              {/* Gráfico de leads por estado */}
              <Card className="group bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-white tracking-tight">Leads por Estado</CardTitle>
                      <CardDescription className="text-slate-400">Distribución del funnel de conversión</CardDescription>
                    </div>
                    {/* Métricas rápidas */}
                    {leadsStats.total > 0 && (
                      <div className="text-right space-y-1">
                        <div className="text-xs text-slate-400">Tasa conversión</div>
                        <div className={`text-lg font-bold ${
                          leadsStats.tasaConversion >= 30
                            ? 'text-emerald-400'
                            : leadsStats.tasaConversion >= 15
                            ? 'text-yellow-400'
                            : 'text-slate-400'
                        }`}>
                          {leadsStats.tasaConversion}%
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leadsChartData.every((d) => d.value === 0) ? (
                    <EmptyState
                      title="Sin datos"
                      description="No hay leads registrados aún"
                    />
                  ) : (
                    <>
                      <BarChart data={leadsChartData} height={220} />
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        {leadsChartData.map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                              aria-hidden
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                        ))}
                      </div>
                      {/* Resumen de métricas */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                        <div className="text-center p-2 rounded-lg bg-white/5">
                          <div className="text-xs text-slate-400">Total</div>
                          <div className="text-lg font-bold text-white">{leadsStats.total}</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                          <div className="text-xs text-emerald-400">Convertidos</div>
                          <div className="text-lg font-bold text-emerald-300">{leadsStats.convertidos}</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-blue-500/10">
                          <div className="text-xs text-blue-400">En Proceso</div>
                          <div className="text-lg font-bold text-blue-300">{leadsStats.enProceso}</div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de consultas por sede */}
              <Card className="group bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative">
                  <CardTitle className="text-lg font-semibold text-white tracking-tight">Consultas por Sede</CardTitle>
                  <CardDescription className="text-slate-400">Próximas 4 semanas</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-4">
                  {sedesChartData.every((d) => d.value === 0) ? (
                    <EmptyState
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
          )}
        </div>
      </PageShell>
    </ErrorBoundary>
  );
}
