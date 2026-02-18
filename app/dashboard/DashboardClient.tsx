'use client';

import { useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import {
  Users, Activity, UserCheck, Calendar, Clock, Zap, Loader2,
  MessageSquare, AlertTriangle, Bot, TrendingUp, Flame, Snowflake,
  ThermometerSun, CheckCircle2, XCircle, ArrowRight,
  Stethoscope, Bell,
} from 'lucide-react';
import { formatDate, STATE_COLORS } from '@/app/lib/crm-data';
import { Badge } from '@/app/components/crm/ui';
import { RefreshButton } from '@/app/components/common/RefreshButton';
import { useDashboardV2 } from '@/hooks/dashboard/useDashboardV2';
import type { DashboardV2Data } from '@/hooks/dashboard/useDashboardV2';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { EmptyState } from '@/app/components/common/SkeletonLoader';
import { cards, listItems, chartColors } from '@/app/lib/design-system';

// Lazy load de gráficos pesados
const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-[220px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center"><div className="h-32 w-32 rounded-full bg-slate-200 dark:bg-slate-700" /></div>,
  ssr: false,
});

const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-end justify-around p-4 gap-2"><div className="h-1/3 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /><div className="h-2/3 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /><div className="h-1/2 w-full bg-slate-200 dark:bg-slate-700 rounded-t" /></div>,
  ssr: false,
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * ============================================================
 * DASHBOARD CLIENT V2 - Centro de comando médico
 * ============================================================
 * Action Center + KPIs + Pipeline + Bot Metrics + Activity + Analytics
 */
interface DashboardClientProps {
  initialData?: DashboardV2Data;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const {
    kpis, acciones, totalAcciones, pipeline, temperaturas, fuentes, bot,
    leadsRecientes, consultasProximas, escalamientosRecientes,
    tasaConversion,
    loading, refresh,
  } = useDashboardV2(initialData);

  // ── Chart data ──
  const pipelineChartData = useMemo(() =>
    pipeline.map(p => ({
      label: p.estado,
      value: p.count,
      color: chartColors.leadState[p.estado] || chartColors.blue,
    })),
  [pipeline]);

  const temperatureChartData = useMemo(() =>
    temperaturas.map(t => ({
      label: t.temperatura,
      value: t.count,
      color: t.temperatura === 'caliente' ? chartColors.rose
        : t.temperatura === 'tibio' ? chartColors.amber
        : t.temperatura === 'frio' ? chartColors.cyan
        : chartColors.slate,
    })),
  [temperaturas]);

  const fuentesChartData = useMemo(() =>
    fuentes.map((f, i) => ({
      label: f.fuente,
      value: f.count,
      color: chartColors.sequence[i % chartColors.sequence.length],
    })),
  [fuentes]);

  // ── Acciones pendientes items ──
  const actionItems = useMemo(() => {
    const items: Array<{ label: string; count: number; icon: React.ReactNode; color: string; href: string }> = [];
    if (acciones.escalamientosPendientes > 0) items.push({
      label: 'Escalamientos pendientes',
      count: acciones.escalamientosPendientes,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-rose-500',
      href: '/leads',
    });
    if (acciones.leadsCalientesSinCita > 0) items.push({
      label: 'Leads calientes sin cita',
      count: acciones.leadsCalientesSinCita,
      icon: <Flame className="h-4 w-4" />,
      color: 'text-orange-500',
      href: '/leads',
    });
    if (acciones.consultasSinConfirmar > 0) items.push({
      label: 'Consultas sin confirmar (48h)',
      count: acciones.consultasSinConfirmar,
      icon: <Bell className="h-4 w-4" />,
      color: 'text-amber-500',
      href: '/consultas',
    });
    if (acciones.mensajesNoLeidos > 0) items.push({
      label: 'Mensajes no leídos',
      count: acciones.mensajesNoLeidos,
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'text-sky-500',
      href: '/conversaciones',
    });
    if (acciones.leadsSinRespuesta24h > 0) items.push({
      label: 'Leads sin respuesta +24h',
      count: acciones.leadsSinRespuesta24h,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-purple-500',
      href: '/leads',
    });
    return items;
  }, [acciones]);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10">

          {/* ════════════════════════════════════════════
              HEADER
              ════════════════════════════════════════════ */}
          <header>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                  Portal Médico
                </p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-jakarta text-foreground">
                  {getGreeting()}
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  Centro de comando — todo en un vistazo
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshButton onClick={refresh} loading={loading} />
              </div>
            </div>
          </header>

          {/* ════════════════════════════════════════════
              ACTION CENTER - Acciones pendientes
              ════════════════════════════════════════════ */}
          {totalAcciones > 0 && (
            <section className="rounded-xl border border-amber-500/20 dark:border-amber-400/15 bg-amber-500/5 dark:bg-amber-500/[0.03] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15">
                  <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Requieren atención ({totalAcciones})
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {actionItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg bg-card/80 border border-border/50 px-3 py-2.5 hover:bg-card hover:border-border transition-all group"
                  >
                    <span className={item.color}>{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-foreground">{item.count}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ════════════════════════════════════════════
              KPIs - 2 hero + 4 secondary
              ════════════════════════════════════════════ */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <MetricCard
                title="Leads totales"
                value={kpis.leadsTotal}
                subtitle={`+${kpis.leadsHoy} hoy · +${kpis.leadsMes} este mes`}
                color="blue"
                icon={<Users className="h-4 w-4" />}
                loading={loading}
              />
              <MetricCard
                title="Consultas programadas"
                value={kpis.consultasProgramadas}
                subtitle={`${kpis.consultasHoy} hoy · ${kpis.consultasSemana} esta semana`}
                color="amber"
                icon={<Calendar className="h-4 w-4" />}
                loading={loading}
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <MetricCard
                title="Conversión"
                value={`${tasaConversion}%`}
                subtitle="Leads → Pacientes"
                color="emerald"
                icon={<TrendingUp className="h-4 w-4" />}
                loading={loading}
              />
              <MetricCard
                title="Pacientes"
                value={kpis.pacientesTotal}
                subtitle={`+${kpis.pacientesNuevosMes} este mes`}
                color="purple"
                icon={<UserCheck className="h-4 w-4" />}
                loading={loading}
              />
              <MetricCard
                title="Mensajes Bot"
                value={bot.totalMensajesBot}
                subtitle={`${bot.totalMensajesUsuario} del paciente`}
                color="teal"
                icon={<Bot className="h-4 w-4" />}
                loading={loading}
              />
              <MetricCard
                title="Citas por Bot"
                value={bot.citasAgendadasBot}
                subtitle="Agendadas automáticamente"
                color="amber"
                icon={<Stethoscope className="h-4 w-4" />}
                loading={loading}
              />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              BOT PERFORMANCE
              ════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={<Bot className="h-3.5 w-3.5" />} label="Rendimiento del Bot" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <MiniStat
                icon={<MessageSquare className="h-3.5 w-3.5 text-sky-500" />}
                label="Conversaciones"
                value={bot.conversacionesActivas}
                suffix={`/ ${bot.conversacionesTotal} total`}
                loading={loading}
              />
              <MiniStat
                icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
                label="Tiempo de respuesta"
                value={bot.promedioTiempoRespuestaSeg > 0 ? `${Math.round(bot.promedioTiempoRespuestaSeg / 60)}m` : '—'}
                suffix="promedio"
                loading={loading}
              />
              <MiniStat
                icon={<Stethoscope className="h-3.5 w-3.5 text-emerald-500" />}
                label="Citas por bot"
                value={bot.citasAgendadasBot}
                suffix="agendadas"
                loading={loading}
              />
              <MiniStat
                icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                label="Escalamientos"
                value={kpis.escalamientosPendientes}
                suffix={`${bot.escalamientosHoy} hoy`}
                loading={loading}
              />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              ACTIVIDAD - Leads + Consultas + Escalamientos
              ════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={<Activity className="h-3.5 w-3.5" />} label="Actividad reciente" />
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              {/* Leads recientes (enriquecidos) */}
              <div className={cards.glassWithHeader}>
                <div className={cards.glassHeader}>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate font-jakarta">
                      Leads Recientes
                      {loading && <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin text-teal-400 inline" />}
                    </h3>
                    <p className="text-xs text-muted-foreground">Últimos contactos con temperatura y score</p>
                  </div>
                  <Badge label={`${leadsRecientes.length}`} variant="outline" className="border-border text-muted-foreground shrink-0 text-xs" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className={listItems.scrollable}>
                    {leadsRecientes.length === 0 ? (
                      <div className={listItems.empty}>No hay leads recientes</div>
                    ) : (
                      <div className={listItems.divider}>
                        {leadsRecientes.map((lead) => (
                          <div key={lead.id} className={listItems.row}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className={listItems.rowTitle}>{lead.nombre}</p>
                                {lead.temperatura && (
                                  <TemperatureDot temp={lead.temperatura} />
                                )}
                                {lead.scoreTotal !== null && lead.scoreTotal > 0 && (
                                  <span className="text-[10px] font-bold tabular-nums text-muted-foreground bg-muted px-1 rounded">
                                    {lead.scoreTotal}
                                  </span>
                                )}
                              </div>
                              <div className={listItems.rowMeta}>
                                <span className="truncate">{formatDate(lead.createdAt)}</span>
                                {lead.fuente && (
                                  <>
                                    <span className="shrink-0">•</span>
                                    <span className="capitalize truncate">{lead.fuente}</span>
                                  </>
                                )}
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

              {/* Consultas próximas + Escalamientos */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Consultas próximas */}
                <div className={cards.glassWithHeader}>
                  <div className={cards.glassHeader}>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate font-jakarta">
                        Consultas Próximas
                        {loading && <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin text-teal-400 inline" />}
                      </h3>
                      <p className="text-xs text-muted-foreground">Agenda próxima con estado de confirmación</p>
                    </div>
                    <Badge label={`${consultasProximas.length}`} variant="outline" className="border-border text-muted-foreground shrink-0 text-xs" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className={listItems.scrollable}>
                      {consultasProximas.length === 0 ? (
                        <div className={listItems.empty}>No hay consultas próximas</div>
                      ) : (
                        <div className={listItems.divider}>
                          {consultasProximas.map((c) => (
                            <div key={c.id} className={listItems.row}>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className={listItems.rowTitle}>{c.paciente}</p>
                                  {c.confirmadoPaciente ? (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                  )}
                                </div>
                                <div className={listItems.rowMeta}>
                                  <span className="truncate">{formatDate(c.fechaHoraInicio)}</span>
                                  {c.tipoCita && (
                                    <>
                                      <span className="shrink-0">•</span>
                                      <span className="truncate">{c.tipoCita}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge label={c.estadoCita} tone={STATE_COLORS[c.estadoCita as keyof typeof STATE_COLORS]} className="shrink-0 text-[10px] sm:text-xs" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Escalamientos recientes */}
                {escalamientosRecientes.length > 0 && (
                  <div className={cards.glassWithHeader}>
                    <div className={cards.glassHeader}>
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate font-jakarta">
                          Escalamientos
                        </h3>
                        <p className="text-xs text-muted-foreground">Leads que requieren atención humana</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className={listItems.scrollable}>
                        <div className={listItems.divider}>
                          {escalamientosRecientes.map((e) => (
                            <div key={e.id} className={listItems.row}>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className={listItems.rowTitle}>{e.nombre}</p>
                                  {e.esUrgente && (
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      Urgente
                                    </span>
                                  )}
                                  {e.citaAgendada && (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                  )}
                                </div>
                                <div className={listItems.rowMeta}>
                                  {e.sintomasPrincipales && (
                                    <span className="truncate">{e.sintomasPrincipales}</span>
                                  )}
                                  {e.interes && (
                                    <>
                                      {e.sintomasPrincipales && <span className="shrink-0">•</span>}
                                      <span className="truncate">{e.interes}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge
                                label={e.resultado}
                                tone={STATE_COLORS[e.resultado as keyof typeof STATE_COLORS]}
                                className="shrink-0 text-[10px] sm:text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              ANÁLISIS - Pipeline + Temperatura + Fuentes
              ════════════════════════════════════════════ */}
          <section className="pb-8 sm:pb-4">
            <SectionHeader icon={<TrendingUp className="h-3.5 w-3.5" />} label="Análisis" />
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              {/* Pipeline de leads por estado */}
              <div className={`${cards.glassWithHeader} min-h-[380px] sm:min-h-[420px]`}>
                <div className={cards.glassHeader}>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Pipeline de Leads</h3>
                    <p className="text-xs text-muted-foreground">Distribución por estado</p>
                  </div>
                  {kpis.leadsTotal > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conversión</div>
                      <div className={`text-base sm:text-lg font-bold tabular-nums ${
                        tasaConversion >= 30 ? 'text-emerald-600 dark:text-emerald-400'
                        : tasaConversion >= 15 ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground'
                      }`}>
                        {tasaConversion}%
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  {pipelineChartData.length === 0 || pipelineChartData.every(d => d.value === 0) ? (
                    <EmptyState title="Sin datos" description="No hay leads registrados aún" />
                  ) : (
                    <>
                      <div className="mb-4 sm:mb-6 flex-1 min-h-[160px] sm:min-h-[200px]">
                        <BarChart data={pipelineChartData} height={180} />
                      </div>
                      <div className="mt-auto grid grid-cols-3 gap-2 sm:gap-3 border-t border-border pt-4 sm:pt-5">
                        <StatPill label="Total" value={kpis.leadsTotal} />
                        <StatPill label="Convertidos" value={pipeline.find(p => p.estado === 'convertido')?.count ?? 0} variant="emerald" />
                        <StatPill label="Activos" value={pipeline.filter(p => !['convertido', 'descartado', 'no_interesado'].includes(p.estado)).reduce((s, p) => s + p.count, 0)} variant="blue" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Temperatura + Fuentes (stacked) */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Temperatura de leads */}
                <div className={`${cards.glassWithHeader} min-h-[180px]`}>
                  <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Temperatura de Leads</h3>
                    <p className="text-xs text-muted-foreground">Clasificación por urgencia</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    {temperatureChartData.length === 0 ? (
                      <EmptyState title="Sin datos" description="No hay leads clasificados" />
                    ) : (
                      <div className="flex flex-col gap-3">
                        {temperatureChartData.map((t) => {
                          const total = temperaturas.reduce((s, item) => s + item.count, 0);
                          const pct = total > 0 ? Math.round((t.value / total) * 100) : 0;
                          return (
                            <div key={t.label} className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 w-28 shrink-0">
                                {t.label === 'caliente' && <Flame className="h-3.5 w-3.5 text-rose-500" />}
                                {t.label === 'tibio' && <ThermometerSun className="h-3.5 w-3.5 text-amber-500" />}
                                {t.label === 'frio' && <Snowflake className="h-3.5 w-3.5 text-cyan-500" />}
                                {!['caliente', 'tibio', 'frio'].includes(t.label) && <span className="h-2 w-2 rounded-full bg-slate-400" />}
                                <span className="text-xs font-medium capitalize text-foreground">{t.label}</span>
                              </div>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${pct}%`, backgroundColor: t.color }}
                                />
                              </div>
                              <span className="text-xs font-bold tabular-nums text-foreground w-8 text-right">{t.value}</span>
                              <span className="text-[10px] text-muted-foreground w-10 text-right">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fuentes de captación */}
                <div className={`${cards.glassWithHeader} flex-1 min-h-[180px]`}>
                  <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Fuentes de Captación</h3>
                    <p className="text-xs text-muted-foreground">De dónde llegan los leads</p>
                  </div>
                  <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
                    {fuentesChartData.length === 0 || fuentesChartData.every(d => d.value === 0) ? (
                      <EmptyState title="Sin datos" description="No hay fuentes registradas" />
                    ) : (
                      <DonutChart
                        data={fuentesChartData}
                        size={160}
                        thickness={30}
                        centerText={kpis.leadsTotal.toLocaleString()}
                        centerSubtext="Total"
                      />
                    )}
                  </div>
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

function SectionHeader({ label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="mb-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
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
      <div className={`text-xs font-medium uppercase ${variant ? valueColor : 'text-muted-foreground'}`}>{label}</div>
      <div className={`text-lg sm:text-xl font-bold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}

function MiniStat({ icon, label, value, suffix, loading }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{label}</p>
        {loading ? (
          <div className="h-5 w-10 mt-0.5 bg-muted rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold tabular-nums text-foreground">{value}</span>
            {suffix && <span className="text-[10px] text-muted-foreground truncate">{suffix}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function TemperatureDot({ temp }: { temp: string }) {
  const colors: Record<string, string> = {
    caliente: 'bg-rose-500',
    tibio: 'bg-amber-500',
    frio: 'bg-cyan-500',
  };
  const titles: Record<string, string> = {
    caliente: 'Lead caliente',
    tibio: 'Lead tibio',
    frio: 'Lead frío',
  };
  return (
    <span
      className={`h-2 w-2 rounded-full shrink-0 ${colors[temp] || 'bg-slate-400'}`}
      title={titles[temp] || temp}
    />
  );
}
