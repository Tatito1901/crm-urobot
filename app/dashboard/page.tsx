'use client';

import { useMemo, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { Users, Activity, UserCheck, Calendar, Clock } from 'lucide-react';
import { formatDate, STATE_COLORS } from '@/app/lib/crm-data';
import { Badge } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { useStats } from '@/hooks/useStats';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { EmptyState } from '@/app/components/common/SkeletonLoader';

// Lazy load de gráficos pesados para mejorar rendimiento mobile y reducir TBT (Total Blocking Time)
const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-[200px] animate-pulse bg-slate-800/50 rounded-xl" />,
  ssr: false,
});

const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[250px] animate-pulse bg-slate-800/50 rounded-xl" />,
  ssr: false,
});

export default function DashboardPage() {
  // ✅ Datos reales centralizados desde useStats
  const { kpi, consultasPorSede, loading: loadingStats, refresh: refreshStats } = useStats();
  
  // Hooks específicos para listas detalladas
  const { leads, loading: loadingLeads, refetch: refetchLeads } = useLeads();
  const { consultas, loading: loadingConsultas, refetch: refetchConsultas } = useConsultas();

  const [activeTab, setActiveTab] = useState<'actividad' | 'graficas'>('actividad');

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

  const isLoadingAny = loadingStats || loadingLeads || loadingConsultas;

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
            disabled={isLoadingAny}
            className="group flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-blue-500/20 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-blue-200 backdrop-blur-sm border border-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 hover:border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 sm:hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 min-h-[36px] sm:min-h-0"
          >
            <span className="transition-transform group-hover:rotate-180 duration-500">
              {isLoadingAny ? '⟳' : '↻'}
            </span>
            <span>{isLoadingAny ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
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

          {/* Tabs sección secundaria */}
          <div className="mb-6 flex items-center gap-8 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('actividad')}
              className={`relative pb-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'actividad'
                  ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Actividad reciente
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('graficas')}
              className={`relative pb-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'graficas'
                  ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gráficas
            </button>
          </div>

          {activeTab === 'actividad' ? (
            <section className="grid gap-6 lg:grid-cols-2">
              {/* Leads recientes */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0f1115] shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">
                      Leads Recientes {loadingLeads && <span className="ml-2 animate-spin text-blue-500">↻</span>}
                    </h3>
                    <p className="text-xs text-slate-400">Últimos 5 contactos registrados</p>
                  </div>
                  <Badge label={`${leads.length} totales`} variant="outline" className="border-slate-700 text-slate-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    {recentLeads.length === 0 ? (
                      <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                        No hay leads recientes
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/50">
                        {recentLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="group flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-slate-800/50"
                          >
                            <div className="min-w-0 flex-1 pr-4">
                              <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                                {lead.nombre}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <span>{formatDate(lead.primerContacto)}</span>
                                <span>•</span>
                                <span className="capitalize">{lead.fuente}</span>
                              </div>
                            </div>
                            <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultas próximas */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0f1115] shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">
                      Consultas Próximas {loadingConsultas && <span className="ml-2 animate-spin text-blue-500">↻</span>}
                    </h3>
                    <p className="text-xs text-slate-400">Agenda para los próximos días</p>
                  </div>
                  <Badge label={`${upcomingConsultas.length} próximas`} variant="outline" className="border-slate-700 text-slate-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    {upcomingConsultas.length === 0 ? (
                      <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                        No hay consultas próximas
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/50">
                        {upcomingConsultas.map((consulta) => (
                          <div
                            key={consulta.id}
                            className="group flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-slate-800/50"
                          >
                            <div className="min-w-0 flex-1 pr-4">
                              <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                                {consulta.paciente}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <span>{formatDate(consulta.fecha)}</span>
                                <span>•</span>
                                <span className="font-medium text-slate-400">{consulta.sede}</span>
                              </div>
                            </div>
                            <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="grid gap-6 lg:grid-cols-2">
              {/* Gráfico de leads por estado */}
              <div className="flex flex-col rounded-xl border border-slate-800 bg-[#0f1115] shadow-sm">
                <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">Leads por Estado</h3>
                    <p className="text-xs text-slate-400">Distribución del funnel</p>
                  </div>
                  {/* Métricas rápidas */}
                  {leadsStats.total > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Conversión</div>
                      <div className={`text-lg font-bold tabular-nums ${
                        leadsStats.tasaConversion >= 30
                          ? 'text-emerald-400'
                          : leadsStats.tasaConversion >= 15
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}>
                        {leadsStats.tasaConversion}%
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {leadsChartData.every((d) => d.value === 0) ? (
                    <EmptyState
                      title="Sin datos"
                      description="No hay leads registrados aún"
                    />
                  ) : (
                    <>
                      <div className="mb-6">
                        <BarChart data={leadsChartData} height={200} />
                      </div>
                      
                      {/* Resumen de métricas */}
                      <div className="mt-auto grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
                        <div className="rounded-lg bg-slate-800/50 p-3 text-center">
                          <div className="text-[10px] font-medium uppercase text-slate-400">Total</div>
                          <div className="text-xl font-bold text-white">{leadsStats.total}</div>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                          <div className="text-[10px] font-medium uppercase text-emerald-400">Convertidos</div>
                          <div className="text-xl font-bold text-emerald-300">{leadsStats.convertidos}</div>
                        </div>
                        <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                          <div className="text-[10px] font-medium uppercase text-blue-400">En Proceso</div>
                          <div className="text-xl font-bold text-blue-300">{leadsStats.enProceso}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gráfico de consultas por sede */}
              <div className="flex flex-col rounded-xl border border-slate-800 bg-[#0f1115] shadow-sm">
                <div className="border-b border-slate-800 px-6 py-4">
                  <h3 className="font-semibold text-white">Consultas por Sede</h3>
                  <p className="text-xs text-slate-400">Próximas 4 semanas</p>
                </div>
                <div className="flex flex-1 items-center justify-center p-6">
                  {sedesChartData.every((d) => d.value === 0) ? (
                    <EmptyState
                      title="Sin consultas"
                      description="No hay consultas programadas"
                    />
                  ) : (
                    <DonutChart
                      data={sedesChartData}
                      size={220}
                      thickness={40}
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
