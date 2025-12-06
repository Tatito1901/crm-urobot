'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { Users, Activity, UserCheck, Calendar, Clock } from 'lucide-react';
import { formatDate, STATE_COLORS } from '@/app/lib/crm-data';
import { Badge } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { ThemeToggle } from '@/app/components/common/ThemeToggle';
import { useStats } from '@/hooks/useStats';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { EmptyState } from '@/app/components/common/SkeletonLoader';

// Lazy load de gráficos pesados para mejorar rendimiento mobile y reducir TBT (Total Blocking Time)
const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-[220px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center"><div className="h-32 w-32 rounded-full bg-slate-200 dark:bg-slate-700" /></div>,
  ssr: false,
});

const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-end justify-around p-4 gap-2"><div className="h-1/3 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /><div className="h-2/3 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /><div className="h-1/2 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /></div>,
  ssr: false,
});

export default function DashboardPage() {
  // ✅ Datos reales centralizados desde useStats
  const { kpi, consultasPorSede, loading: loadingStats, refresh: refreshStats } = useStats();
  
  // Hooks específicos para listas detalladas
  const { leads, loading: loadingLeads, refetch: refetchLeads } = useLeads();
  const { consultas, loading: loadingConsultas, refetch: refetchConsultas } = useConsultas();

  const [activeTab, setActiveTab] = useState<'actividad' | 'graficas'>('actividad');

  // Evitar hydration mismatch: garantizar estado consistente entre SSR y cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refreshStats(), refetchLeads(), refetchConsultas()]);
  };

  // Métricas adaptadas desde useStats (KPI) - Memoizado para evitar recreación en re-renders
  const metrics = useMemo(() => [
    {
      title: 'Leads totales',
      value: kpi.totalLeads.toLocaleString('es-MX'),
      subtitle: `${kpi.leadsNuevosMes} nuevos este mes`,
      color: 'blue' as const,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Tasa de conversión',
      value: `${kpi.tasaConversion}%`,
      subtitle: 'Leads a Pacientes',
      color: 'emerald' as const,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: 'Pacientes activos',
      value: kpi.totalPacientes.toLocaleString('es-MX'),
      subtitle: `+${kpi.pacientesNuevosMes} mes actual`,
      color: 'purple' as const,
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      title: 'Consultas del mes',
      value: kpi.consultasMes.toLocaleString('es-MX'),
      subtitle: `${kpi.consultasConfirmadasMes} confirmadas`,
      color: 'amber' as const,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: 'Tasa de asistencia',
      value: `${kpi.tasaAsistencia}%`,
      subtitle: 'Citas completadas',
      color: 'red' as const,
      icon: <Clock className="h-4 w-4" />,
    },
  ], [kpi]);

  // Adaptador para gráfico de dona (consultas por sede)
  const sedesChartData = useMemo(() => consultasPorSede.map(sede => ({
    label: sede.name,
    value: sede.value,
    color: sede.fill || '#3b82f6'
  })), [consultasPorSede]);

  // Datos para gráfico de barras (leads por estado) - Optimizado
  const leadsChartData = useMemo(() => {
    const contadores = {
      Nuevo: 0,
      Seguimiento: 0,
      Convertido: 0,
      Descartado: 0,
    };

    const estadosSeguimiento = ['Contactado', 'Interesado', 'Calificado'];
    const estadosDescartado = ['No_Interesado', 'Perdido'];

    leads.forEach((lead) => {
      if (lead.estado === 'Nuevo') contadores.Nuevo++;
      else if (lead.estado === 'Convertido') contadores.Convertido++;
      else if (estadosSeguimiento.includes(lead.estado)) contadores.Seguimiento++;
      else if (estadosDescartado.includes(lead.estado)) contadores.Descartado++;
    });

    return [
      { label: 'Nuevo', value: contadores.Nuevo, color: '#3b82f6' },
      { label: 'Seguimiento', value: contadores.Seguimiento, color: '#8b5cf6' },
      { label: 'Convertido', value: contadores.Convertido, color: '#10b981' },
      { label: 'Descartado', value: contadores.Descartado, color: '#64748b' },
    ];
  }, [leads]);

  // Métricas de leads calculadas
  const leadsStats = useMemo(() => {
    const total = leads.length;
    if (total === 0) return { total: 0, convertidos: 0, enProceso: 0, tasaConversion: 0 };

    let convertidos = 0;
    let enProceso = 0;

    // Estados que consideramos "En proceso"
    const estadosEnProceso = ['Nuevo', 'Contactado', 'Interesado', 'Calificado'];

    // Single pass loop
    for (const l of leads) {
      if (l.estado === 'Convertido') convertidos++;
      else if (estadosEnProceso.includes(l.estado)) enProceso++;
    }

    const tasaConversion = Math.round((convertidos / total) * 100);
    return { total, convertidos, enProceso, tasaConversion };
  }, [leads]);

  // Datos para MVP - optimizado con useMemo y slice temprano
  const recentLeads = useMemo(() => {
    // Evitar sort de todo el array si es muy grande, idealmente esto debería venir ordenado del backend
    // Como viene de useLeads (SWR), asumimos que puede no estar ordenado por fecha reciente
    return [...leads]
      .sort((a, b) => new Date(b.primerContacto || 0).getTime() - new Date(a.primerContacto || 0).getTime())
      .slice(0, 5);
  }, [leads]);

  const upcomingConsultas = useMemo(() => {
    const now = new Date();
    return consultas
      .filter((c) => new Date(c.fechaHoraInicio) >= now)
      .sort((a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime())
      .slice(0, 5);
  }, [consultas]);

  // Mostrar loading hasta que esté montado en cliente para evitar hydration mismatch
  const isLoadingAny = !mounted || loadingStats || loadingLeads || loadingConsultas;

  return (
    <ErrorBoundary>
      <PageShell
        accent
        eyebrow="Portal Médico"
        title={
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">Dr. Mario</span>
            </span>
          </div>
        }
        description="Panel de control inteligente para la gestión de pacientes."
        compact
        headerSlot={
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleRefresh}
              disabled={isLoadingAny}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-blue-600 dark:text-blue-200 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px]"
            >
              <span className={isLoadingAny ? 'animate-spin' : ''}>↻</span>
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Métricas principales */}
          <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-5 lg:gap-3">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                subtitle={metric.subtitle}
                color={metric.color}
                loading={loadingStats}
              />
            ))}
          </section>

          {/* Tabs sección secundaria - Responsivo */}
          <div className="mb-4 sm:mb-6 flex items-center gap-4 sm:gap-8 border-b border-border overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveTab('actividad')}
              className={`relative pb-2.5 sm:pb-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === 'actividad'
                  ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Actividad reciente
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('graficas')}
              className={`relative pb-2.5 sm:pb-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === 'graficas'
                  ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Gráficas
            </button>
          </div>

          {activeTab === 'actividad' ? (
            <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Leads recientes */}
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate">
                      Leads Recientes {mounted && loadingLeads && <span className="ml-1.5 animate-spin text-blue-500 text-xs">↻</span>}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Últimos 5 contactos registrados</p>
                  </div>
                  <Badge label={mounted ? `${leads.length}` : '—'} variant="outline" className="border-border text-muted-foreground shrink-0 text-[10px] sm:text-xs" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="max-h-[320px] sm:max-h-[400px] overflow-y-auto overscroll-contain">
                    {!mounted ? (
                      <div className="flex h-28 sm:h-32 items-center justify-center">
                        <div className="h-4 w-32 skeleton-pulse rounded bg-muted" />
                      </div>
                    ) : recentLeads.length === 0 ? (
                      <div className="flex h-28 sm:h-32 items-center justify-center text-xs sm:text-sm text-muted-foreground">
                        No hay leads recientes
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {recentLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="group flex cursor-pointer items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors hover:bg-muted/50 active:bg-muted/70"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs sm:text-sm font-medium text-foreground group-hover:text-primary">
                                {lead.nombre || lead.telefono}
                              </p>
                              <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                                <span className="truncate">{formatDate(lead.primerContacto || '')}</span>
                                <span className="shrink-0">•</span>
                                <span className="capitalize truncate">{lead.fuente}</span>
                              </div>
                            </div>
                            <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} className="shrink-0 text-[10px] sm:text-xs" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultas próximas */}
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate">
                      Consultas Próximas {mounted && loadingConsultas && <span className="ml-1.5 animate-spin text-blue-500 text-xs">↻</span>}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Agenda para los próximos días</p>
                  </div>
                  <Badge label={mounted ? `${upcomingConsultas.length}` : '—'} variant="outline" className="border-border text-muted-foreground shrink-0 text-[10px] sm:text-xs" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="max-h-[320px] sm:max-h-[400px] overflow-y-auto overscroll-contain">
                    {!mounted ? (
                      <div className="flex h-28 sm:h-32 items-center justify-center">
                        <div className="h-4 w-32 skeleton-pulse rounded bg-muted" />
                      </div>
                    ) : upcomingConsultas.length === 0 ? (
                      <div className="flex h-28 sm:h-32 items-center justify-center text-xs sm:text-sm text-muted-foreground">
                        No hay consultas próximas
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {upcomingConsultas.map((consulta) => (
                          <div
                            key={consulta.id}
                            className="group flex cursor-pointer items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors hover:bg-muted/50 active:bg-muted/70"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs sm:text-sm font-medium text-foreground group-hover:text-primary">
                                {consulta.paciente || 'Paciente'}
                              </p>
                              <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                                <span className="truncate">{formatDate(consulta.fechaHoraInicio)}</span>
                                <span className="shrink-0">•</span>
                                <span className="font-medium text-foreground shrink-0">{consulta.sede}</span>
                              </div>
                            </div>
                            <Badge label={consulta.estadoCita} tone={STATE_COLORS[consulta.estadoCita]} className="shrink-0 text-[10px] sm:text-xs" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Gráfico de leads por estado */}
              <div className="flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm min-h-[380px] sm:min-h-[420px]">
                <div className="flex items-start justify-between gap-3 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Leads por Estado</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Distribución del funnel</p>
                  </div>
                  {/* Métricas rápidas */}
                  {leadsStats.total > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Conversión</div>
                      <div className={`text-base sm:text-lg font-bold tabular-nums ${
                        leadsStats.tasaConversion >= 30
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : leadsStats.tasaConversion >= 15
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-muted-foreground'
                      }`}>
                        {leadsStats.tasaConversion}%
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  {leadsChartData.every((d) => d.value === 0) ? (
                    <EmptyState
                      title="Sin datos"
                      description="No hay leads registrados aún"
                    />
                  ) : (
                    <>
                      <div className="mb-4 sm:mb-6 flex-1 min-h-[160px] sm:min-h-[200px]">
                        <BarChart data={leadsChartData} height={180} />
                      </div>
                      
                      {/* Resumen de métricas - responsivo */}
                      <div className="mt-auto grid grid-cols-3 gap-2 sm:gap-4 border-t border-border pt-4 sm:pt-6">
                        <div className="rounded-lg bg-muted/50 p-2 sm:p-3 text-center">
                          <div className="text-[9px] sm:text-[10px] font-medium uppercase text-muted-foreground">Total</div>
                          <div className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{leadsStats.total}</div>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-2 sm:p-3 text-center">
                          <div className="text-[9px] sm:text-[10px] font-medium uppercase text-emerald-600 dark:text-emerald-400">Convertidos</div>
                          <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{leadsStats.convertidos}</div>
                        </div>
                        <div className="rounded-lg bg-blue-500/10 p-2 sm:p-3 text-center">
                          <div className="text-[9px] sm:text-[10px] font-medium uppercase text-muted-foreground">En Proceso</div>
                          <div className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{leadsStats.enProceso}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gráfico de consultas por sede */}
              <div className="flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm min-h-[380px] sm:min-h-[420px]">
                <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                  <h3 className="font-semibold text-sm sm:text-base text-card-foreground">Consultas por Sede</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Próximas 4 semanas</p>
                </div>
                <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
                  {sedesChartData.every((d) => d.value === 0) ? (
                    <EmptyState
                      title="Sin consultas"
                      description="No hay consultas programadas"
                    />
                  ) : (
                    <DonutChart
                      data={sedesChartData}
                      size={180}
                      thickness={35}
                      centerText={kpi.consultasMes.toLocaleString()}
                      centerSubtext="Total"
                    />
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </PageShell>
    </ErrorBoundary>
  );
}
