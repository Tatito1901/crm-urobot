'use client';

import { useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import { Users, Activity, UserCheck, Calendar, Clock, Zap, Loader2 } from 'lucide-react';
import { formatDate, STATE_COLORS } from '@/app/lib/crm-data';
import { Badge } from '@/app/components/crm/ui';
import { RefreshButton } from '@/app/components/common/RefreshButton';
import { useStats } from '@/hooks/dashboard/useStats';
import type { KPIData, ChartData } from '@/hooks/dashboard/useStats';
import { useDashboardActivity } from '@/hooks/dashboard/useDashboardActivity';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { EmptyState } from '@/app/components/common/SkeletonLoader';
import { cards, listItems, chartColors } from '@/app/lib/design-system';

// Lazy load de gráficos pesados para mejorar rendimiento mobile y reducir TBT (Total Blocking Time)
const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-[220px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center"><div className="h-32 w-32 rounded-full bg-slate-200 dark:bg-slate-700" /></div>,
  ssr: false,
});

const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-end justify-around p-4 gap-2"><div className="h-1/3 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /><div className="h-2/3 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /><div className="h-1/2 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /></div>,
  ssr: false,
});

/**
 * Greeting basado en hora del día
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * ============================================================
 * DASHBOARD CLIENT - Centro de comando médico
 * ============================================================
 * Layout sin tabs: todo visible de un vistazo.
 * Hero KPIs + Actividad + Gráficos en scroll vertical.
 */
interface DashboardClientProps {
  initialStats?: {
    kpi: KPIData;
    consultasPorSede: ChartData[];
    funnelLeads: ChartData[];
  };
  initialActivity?: {
    recentLeads: Array<{
      id: string;
      nombre: string;
      telefono: string;
      estado: string;
      fuente: string;
      primerContacto: string | null;
    }>;
    upcomingConsultas: Array<{
      id: string;
      paciente: string;
      fechaHoraInicio: string;
      sede: string;
      estadoCita: string;
    }>;
  };
}

export default function DashboardClient({ initialStats, initialActivity }: DashboardClientProps) {
  const { kpi, consultasPorSede, funnelLeads, loading: loadingStats, refresh: refreshStats } = useStats(
    initialStats ? {
      kpi: initialStats.kpi,
      consultasPorSede: initialStats.consultasPorSede,
      estadoCitas: [],
      evolucionMensual: [],
      funnelLeads: initialStats.funnelLeads,
      fuentesCaptacion: [],
      metricasMensajeria: [],
      destinosPacientes: [],
    } : undefined
  );
  
  const { recentLeads, upcomingConsultas, loading: loadingActivity, refresh: refreshActivity } = useDashboardActivity(initialActivity);

  const handleRefresh = async () => {
    await Promise.all([refreshStats(), refreshActivity()]);
  };

  const isLoadingAny = loadingStats || loadingActivity;

  // ── Hero KPIs (2 principales) ──
  const heroMetrics = useMemo(() => [
    {
      title: 'Leads totales',
      value: kpi.totalLeads.toLocaleString('es-MX'),
      subtitle: `${kpi.leadsNuevosMes} nuevos este mes`,
      color: 'blue' as const,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Consultas del mes',
      value: kpi.consultasMes.toLocaleString('es-MX'),
      subtitle: `${kpi.consultasConfirmadasMes} confirmadas`,
      color: 'amber' as const,
      icon: <Calendar className="h-4 w-4" />,
    },
  ], [kpi]);

  // ── Secondary KPIs (3 compactos) ──
  const secondaryMetrics = useMemo(() => [
    {
      title: 'Tasa de conversión',
      value: `${kpi.tasaConversion}%`,
      subtitle: 'Leads → Pacientes',
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
      title: 'Tasa de asistencia',
      value: `${kpi.tasaAsistencia}%`,
      subtitle: 'Citas completadas',
      color: 'red' as const,
      icon: <Clock className="h-4 w-4" />,
    },
  ], [kpi]);

  // ── Chart data ──
  const sedesChartData = useMemo(() => consultasPorSede.map(sede => ({
    label: sede.name,
    value: sede.value,
    color: sede.fill || chartColors.blue
  })), [consultasPorSede]);

  const leadsChartData = useMemo(() => {
    if (funnelLeads.length === 0) {
      return [
        { label: 'Nuevo', value: 0, color: chartColors.blue },
        { label: 'Seguimiento', value: 0, color: chartColors.purple },
        { label: 'Convertido', value: 0, color: chartColors.emerald },
        { label: 'Descartado', value: 0, color: chartColors.slate },
      ];
    }
    return funnelLeads.map(f => ({
      label: f.name,
      value: f.value,
      color: f.fill || chartColors.leadState[f.name] || chartColors.blue,
    }));
  }, [funnelLeads]);

  const leadsStats = useMemo(() => {
    const total = kpi.totalLeads;
    const convertidos = leadsChartData.find(d => d.label === 'convertido')?.value ?? 0;
    const descartados = leadsChartData.filter(d => ['no_interesado', 'descartado'].includes(d.label)).reduce((s, d) => s + d.value, 0);
    const enProceso = total - convertidos - descartados;
    return { total, convertidos, enProceso, tasaConversion: kpi.tasaConversion };
  }, [kpi, leadsChartData]);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-background text-foreground">
        {/* ── Atmospheric background ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] opacity-25 overflow-hidden" aria-hidden style={{ contain: 'strict' }}>
          <div className="absolute left-1/4 top-[-10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-teal-500/20 blur-[180px] dark:bg-teal-500/25" />
          <div className="absolute right-[5%] top-[8%] h-[350px] w-[350px] rounded-full bg-cyan-500/12 blur-[140px] dark:bg-cyan-500/18" />
          <div className="absolute left-[60%] top-[20%] h-[200px] w-[200px] rounded-full bg-indigo-500/8 blur-[100px] dark:bg-indigo-500/12" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10">

          {/* ════════════════════════════════════════════
              HEADER - Greeting + Status + Actions
              ════════════════════════════════════════════ */}
          <header className="animate-fade-up">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-[3px] w-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400" />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
                    Portal Médico
                  </p>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-jakarta">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 dark:from-teal-300 dark:via-cyan-300 dark:to-teal-200">
                    {getGreeting()}
                  </span>
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Centro de comando — todo en un vistazo
                  </p>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500 dark:text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    En vivo
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshButton onClick={handleRefresh} loading={isLoadingAny} />
              </div>
            </div>
          </header>

          {/* ════════════════════════════════════════════
              KPIs - Hero pair + Secondary trio
              ════════════════════════════════════════════ */}
          <section className="animate-fade-up stagger-2">
            {/* Hero KPIs - 2 tarjetas principales más grandes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {heroMetrics.map((metric) => (
                <div key={metric.title} className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/[0.06] to-cyan-500/[0.03] dark:from-teal-500/[0.08] dark:to-cyan-500/[0.04] pointer-events-none" />
                  <MetricCard
                    title={metric.title}
                    value={metric.value}
                    subtitle={metric.subtitle}
                    color={metric.color}
                    icon={metric.icon}
                    loading={loadingStats}
                  />
                </div>
              ))}
            </div>
            {/* Secondary KPIs - 3 tarjetas compactas */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {secondaryMetrics.map((metric) => (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  subtitle={metric.subtitle}
                  color={metric.color}
                  icon={metric.icon}
                  loading={loadingStats}
                />
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════
              ACTIVIDAD - Leads + Consultas (siempre visible)
              ════════════════════════════════════════════ */}
          <section className="animate-fade-up stagger-3">
            <SectionHeader icon={<Zap className="h-3.5 w-3.5" />} label="Actividad reciente" />
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              {/* Leads recientes */}
              <div className={cards.glassWithHeader}>
                <div className={cards.glassHeader}>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate font-jakarta">
                      Leads Recientes
                      {loadingActivity && <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin text-teal-400 inline" />}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Últimos 5 contactos registrados</p>
                  </div>
                  <Badge label={`${recentLeads.length}`} variant="outline" className="border-white/10 text-muted-foreground shrink-0 text-[10px] sm:text-xs" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className={listItems.scrollable}>
                    {recentLeads.length === 0 ? (
                      <div className={listItems.empty}>No hay leads recientes</div>
                    ) : (
                      <div className={listItems.divider}>
                        {recentLeads.map((lead) => (
                          <div key={lead.id} className={listItems.row}>
                            <div className="min-w-0 flex-1">
                              <p className={listItems.rowTitle}>{lead.nombre || lead.telefono}</p>
                              <div className={listItems.rowMeta}>
                                <span className="truncate">{formatDate(lead.primerContacto || '')}</span>
                                <span className="shrink-0">•</span>
                                <span className="capitalize truncate">{lead.fuente}</span>
                              </div>
                            </div>
                            <Badge label={lead.estado} tone={STATE_COLORS[lead.estado as keyof typeof STATE_COLORS]} className="shrink-0 text-[10px] sm:text-xs" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultas próximas */}
              <div className={cards.glassWithHeader}>
                <div className={cards.glassHeader}>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate font-jakarta">
                      Consultas Próximas
                      {loadingActivity && <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin text-teal-400 inline" />}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Agenda para los próximos días</p>
                  </div>
                  <Badge label={`${upcomingConsultas.length}`} variant="outline" className="border-white/10 text-muted-foreground shrink-0 text-[10px] sm:text-xs" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className={listItems.scrollable}>
                    {upcomingConsultas.length === 0 ? (
                      <div className={listItems.empty}>No hay consultas próximas</div>
                    ) : (
                      <div className={listItems.divider}>
                        {upcomingConsultas.map((consulta) => (
                          <div key={consulta.id} className={listItems.row}>
                            <div className="min-w-0 flex-1">
                              <p className={listItems.rowTitle}>{consulta.paciente || 'Paciente'}</p>
                              <div className={listItems.rowMeta}>
                                <span className="truncate">{formatDate(consulta.fechaHoraInicio)}</span>
                                <span className="shrink-0">•</span>
                                <span className="font-medium text-foreground shrink-0">{consulta.sede}</span>
                              </div>
                            </div>
                            <Badge label={consulta.estadoCita} tone={STATE_COLORS[consulta.estadoCita as keyof typeof STATE_COLORS]} className="shrink-0 text-[10px] sm:text-xs" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              GRÁFICOS - Funnel + Sedes (siempre visible)
              ════════════════════════════════════════════ */}
          <section className="animate-fade-up stagger-4 pb-8 sm:pb-4">
            <SectionHeader icon={<Activity className="h-3.5 w-3.5" />} label="Análisis" />
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              {/* Gráfico de leads por estado */}
              <div className={`${cards.glassWithHeader} min-h-[380px] sm:min-h-[420px]`}>
                <div className={cards.glassHeader}>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Leads por Estado</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Distribución del funnel</p>
                  </div>
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
                      <div className="mt-auto grid grid-cols-3 gap-2 sm:gap-3 border-t border-border pt-4 sm:pt-5">
                        <StatPill label="Total" value={leadsStats.total} />
                        <StatPill label="Convertidos" value={leadsStats.convertidos} variant="emerald" />
                        <StatPill label="En Proceso" value={leadsStats.enProceso} variant="blue" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gráfico de consultas por sede */}
              <div className={`${cards.glassWithHeader} min-h-[380px] sm:min-h-[420px]`}>
                <div className="border-b border-white/[0.06] px-4 sm:px-6 py-3 sm:py-4">
                  <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Consultas por Sede</h3>
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
            </div>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// ── Sub-components ──────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="flex items-center justify-center h-5 w-5 rounded-md bg-teal-500/10 text-teal-500 dark:text-teal-400">
        {icon}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
    </div>
  );
}

function StatPill({ label, value, variant }: { label: string; value: number; variant?: 'emerald' | 'blue' }) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  };
  const valueColor = variant ? colors[variant].split(' ').slice(1).join(' ') : 'text-foreground';
  const bgColor = variant ? colors[variant].split(' ')[0] : 'bg-muted/50';
  
  return (
    <div className={`rounded-lg ${bgColor} p-2 sm:p-3 text-center`}>
      <div className={`text-[9px] sm:text-[10px] font-medium uppercase ${variant ? valueColor : 'text-muted-foreground'}`}>{label}</div>
      <div className={`text-lg sm:text-xl font-bold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}
