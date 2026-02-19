'use client';

import { useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import {
  Users, Activity, UserCheck, Calendar, Clock, Zap, Loader2,
  MessageSquare, AlertTriangle, Bot, TrendingUp, Flame, Snowflake,
  ThermometerSun, CheckCircle2, XCircle, ArrowRight,
  Stethoscope, Bell, DollarSign, BarChart3, Target,
  ShieldCheck, ArrowUpRight, ArrowDownRight,
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
import { SectionHeader, StatPill, TemperatureDot } from './components/DashboardSubComponents';

// Lazy load de gráficos pesados
const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-[220px] w-full bg-muted/30 rounded-xl flex items-center justify-center"><div className="h-32 w-32 rounded-full bg-muted/50" /></div>,
  ssr: false,
});

const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[200px] w-full bg-muted/30 rounded-xl" />,
  ssr: false,
});

const SparklineChart = dynamicImport(() => import('@/app/components/analytics/SparklineChart').then(mod => ({ default: mod.SparklineChart })), {
  loading: () => <div className="h-[60px] w-full bg-muted/20 rounded" />,
  ssr: false,
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatMoney(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString('es-MX')}`;
}

// ── Trend Badge ──
function TrendBadge({ value, suffix = 'vs mes ant.' }: { value: number; suffix?: string }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full ${
      isPositive ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15'
    }`}>
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value)}% <span className="hidden sm:inline font-normal text-muted-foreground ml-0.5">{suffix}</span>
    </span>
  );
}

// ── Funnel label map ──
const FUNNEL_LABELS: Record<string, string> = {
  awareness: 'Descubrimiento',
  interest: 'Interés',
  consideration: 'Consideración',
  intent: 'Intención',
  evaluation: 'Evaluación',
  purchase: 'Conversión',
};

const FUNNEL_COLORS: Record<string, string> = {
  awareness: 'var(--chart-blue)',
  interest: 'var(--chart-purple)',
  consideration: 'var(--chart-indigo)',
  intent: 'var(--chart-amber)',
  evaluation: 'var(--chart-teal)',
  purchase: 'var(--chart-emerald)',
};

/**
 * ============================================================
 * DASHBOARD CLIENT V3 - Centro de comando médico (Cardiobot-style)
 * ============================================================
 */
interface DashboardClientProps {
  initialData?: DashboardV2Data;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const {
    kpis, acciones, totalAcciones, pipeline, temperaturas, fuentes, bot,
    leadsRecientes, consultasProximas, escalamientosRecientes,
    leadsTendencia, consultasTendencia, funnel, consultasPorEstado,
    tasaConversion, tasaAsistencia, leadsCrecimientoMes, ingresosCrecimientoMes,
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

  const consultasEstadoChartData = useMemo(() =>
    consultasPorEstado.map(ce => ({
      label: ce.estado,
      value: ce.count,
      color: chartColors.consultaState[ce.estado] || chartColors.blue,
    })),
  [consultasPorEstado]);

  // ── Funnel max for percentage bars ──
  const funnelMax = useMemo(() => Math.max(...funnel.map(f => f.count), 1), [funnel]);

  // ── Acciones pendientes items ──
  const actionItems = useMemo(() => {
    const items: Array<{ label: string; count: number; icon: React.ReactNode; color: string; href: string }> = [];
    if (acciones.escalamientosPendientes > 0) items.push({
      label: 'Escalamientos pendientes', count: acciones.escalamientosPendientes,
      icon: <AlertTriangle className="h-4 w-4" />, color: 'text-rose-500', href: '/leads',
    });
    if (acciones.leadsCalientesSinCita > 0) items.push({
      label: 'Leads calientes sin cita', count: acciones.leadsCalientesSinCita,
      icon: <Flame className="h-4 w-4" />, color: 'text-orange-500', href: '/leads',
    });
    if (acciones.consultasSinConfirmar > 0) items.push({
      label: 'Consultas sin confirmar (48h)', count: acciones.consultasSinConfirmar,
      icon: <Bell className="h-4 w-4" />, color: 'text-amber-500', href: '/consultas',
    });
    if (acciones.mensajesNoLeidos > 0) items.push({
      label: 'Mensajes no leídos', count: acciones.mensajesNoLeidos,
      icon: <MessageSquare className="h-4 w-4" />, color: 'text-sky-500', href: '/conversaciones',
    });
    if (acciones.leadsSinRespuesta24h > 0) items.push({
      label: 'Leads sin respuesta +24h', count: acciones.leadsSinRespuesta24h,
      icon: <Clock className="h-4 w-4" />, color: 'text-purple-500', href: '/leads',
    });
    return items;
  }, [acciones]);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10">

          {/* ════════════════════════════════════════════
              HEADER
              ════════════════════════════════════════════ */}
          <header>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                  Portal Médico · CRM Urología
                </p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-jakarta text-foreground">
                  {getGreeting()}
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  Centro de comando — métricas en tiempo real
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshButton onClick={refresh} loading={loading} />
              </div>
            </div>
          </header>

          {/* ════════════════════════════════════════════
              ACTION CENTER
              ════════════════════════════════════════════ */}
          {totalAcciones > 0 && (
            <section className="rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Requieren atención ({totalAcciones})
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {actionItems.map((item) => (
                  <a key={item.label} href={item.href}
                    className="flex items-center gap-3 rounded-lg bg-card/90 border border-border px-3 py-2.5 hover:bg-card hover:border-border transition-all group">
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
              HERO KPIs — 3 columns with sparklines
              ════════════════════════════════════════════ */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Leads este mes */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/15">
                      <Users className="h-4 w-4 text-sky-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Leads este mes</span>
                  </div>
                  <TrendBadge value={leadsCrecimientoMes} />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground font-jakarta tracking-tight mt-1">
                  {loading ? '—' : kpis.leadsMes}
                </div>
                <div className="text-xs text-muted-foreground mt-1 mb-2">
                  +{kpis.leadsHoy} hoy · {kpis.leadsTotal} totales
                </div>
                <SparklineChart data={leadsTendencia} color="var(--chart-blue)" gradientId="leadsGrad" height={50} />
              </div>

              {/* Consultas */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/15">
                      <Calendar className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consultas</span>
                  </div>
                  {tasaAsistencia > 0 && (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                      {tasaAsistencia}% asistencia
                    </span>
                  )}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground font-jakarta tracking-tight mt-1">
                  {loading ? '—' : kpis.consultasProgramadas}
                </div>
                <div className="text-xs text-muted-foreground mt-1 mb-2">
                  {kpis.consultasHoy} hoy · {kpis.consultasCompletadasMes} completadas este mes
                </div>
                <SparklineChart data={consultasTendencia} color="var(--chart-amber)" gradientId="consultasGrad" height={50} />
              </div>

              {/* Ingresos */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingresos mes</span>
                  </div>
                  <TrendBadge value={ingresosCrecimientoMes} />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground font-jakarta tracking-tight mt-1">
                  {loading ? '—' : formatMoney(kpis.ingresosMes)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 mb-2">
                  Ticket promedio: {formatMoney(kpis.ticketPromedio)}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((kpis.ingresosMes / Math.max(kpis.ingresosMesAnterior, 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{formatMoney(kpis.ingresosMesAnterior)} prev</span>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              SECONDARY KPIs — 4 compact
              ════════════════════════════════════════════ */}
          <section>
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
                title="Conv. Activas"
                value={kpis.conversacionesActivas}
                subtitle={`${bot.conversacionesHoy} hoy`}
                color="cyan"
                icon={<MessageSquare className="h-4 w-4" />}
                loading={loading}
              />
              <MetricCard
                title="Escalamientos"
                value={kpis.escalamientosPendientes}
                subtitle={`${bot.escalamientosHoy} hoy · ${bot.escalamientosTotal} total`}
                color="red"
                icon={<AlertTriangle className="h-4 w-4" />}
                loading={loading}
              />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              BOT EFFECTIVENESS — Cardiobot style
              ════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={<Bot className="h-3.5 w-3.5" />} label="Rendimiento del Bot" />
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resolución</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground font-jakarta">{bot.tasaResolucion}%</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{bot.conversacionesResueltas} resueltas</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Citas Bot</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground font-jakarta">{bot.citasAgendadasBot}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{bot.tasaCitaBot}% de escalamientos</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resp. Promedio</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground font-jakarta">
                  {bot.promedioTiempoRespuestaSeg > 0 ? `${Math.round(bot.promedioTiempoRespuestaSeg / 60)}m` : '—'}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">primera respuesta</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mensajes</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground font-jakarta">{bot.totalMensajesBot}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">~{bot.promedioMensajesPorConv} por conv.</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Escalamiento</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground font-jakarta">{bot.tasaEscalamiento}%</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{bot.escalamientosTotal} total</span>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════
              ACTIVIDAD - Leads + Consultas + Escalamientos
              ════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={<Activity className="h-3.5 w-3.5" />} label="Actividad reciente" />
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              {/* Leads recientes */}
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
                                {lead.temperatura && <TemperatureDot temp={lead.temperatura} />}
                                {lead.scoreTotal !== null && lead.scoreTotal > 0 && (
                                  <span className="text-[10px] font-bold tabular-nums text-muted-foreground bg-muted px-1 rounded">{lead.scoreTotal}</span>
                                )}
                              </div>
                              <div className={listItems.rowMeta}>
                                <span className="truncate">{formatDate(lead.createdAt)}</span>
                                {lead.fuente && (<><span className="shrink-0">•</span><span className="capitalize truncate">{lead.fuente}</span></>)}
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
                                  {c.confirmadoPaciente ? <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> : <XCircle className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
                                </div>
                                <div className={listItems.rowMeta}>
                                  <span className="truncate">{formatDate(c.fechaHoraInicio)}</span>
                                  {c.tipoCita && (<><span className="shrink-0">•</span><span className="truncate">{c.tipoCita}</span></>)}
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

                {escalamientosRecientes.length > 0 && (
                  <div className={cards.glassWithHeader}>
                    <div className={cards.glassHeader}>
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-card-foreground truncate font-jakarta">Escalamientos</h3>
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
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/25">Urgente</span>
                                  )}
                                  {e.citaAgendada && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                                </div>
                                <div className={listItems.rowMeta}>
                                  {e.sintomasPrincipales && <span className="truncate">{e.sintomasPrincipales}</span>}
                                  {e.interes && (<>{e.sintomasPrincipales && <span className="shrink-0">•</span>}<span className="truncate">{e.interes}</span></>)}
                                </div>
                              </div>
                              <Badge label={e.resultado} tone={STATE_COLORS[e.resultado as keyof typeof STATE_COLORS]} className="shrink-0 text-[10px] sm:text-xs" />
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
              ANÁLISIS — Pipeline + Funnel + Temperatura + Fuentes + Consultas
              ════════════════════════════════════════════ */}
          <section className="pb-8 sm:pb-4">
            <SectionHeader icon={<TrendingUp className="h-3.5 w-3.5" />} label="Análisis" />
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">

              {/* Pipeline de leads por estado */}
              <div className={`${cards.glassWithHeader} min-h-[380px]`}>
                <div className={cards.glassHeader}>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Pipeline de Leads</h3>
                    <p className="text-xs text-muted-foreground">Distribución por estado</p>
                  </div>
                  {kpis.leadsTotal > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conversión</div>
                      <div className={`text-base sm:text-lg font-bold tabular-nums ${
                        tasaConversion >= 30 ? 'text-emerald-400' : tasaConversion >= 15 ? 'text-amber-400' : 'text-muted-foreground'
                      }`}>{tasaConversion}%</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  {pipelineChartData.length === 0 || pipelineChartData.every(d => d.value === 0) ? (
                    <EmptyState title="Sin datos" description="No hay leads registrados aún" />
                  ) : (
                    <>
                      <div className="mb-4 sm:mb-6 flex-1 min-h-[160px]">
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

              {/* Funnel + Consultas por estado (stacked) */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Funnel de conversión */}
                {funnel.length > 0 && (
                  <div className={`${cards.glassWithHeader}`}>
                    <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Funnel de Conversión</h3>
                      <p className="text-xs text-muted-foreground">Etapas del embudo de ventas</p>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col gap-2.5">
                      {funnel.map((f) => {
                        const pct = funnelMax > 0 ? Math.round((f.count / funnelMax) * 100) : 0;
                        return (
                          <div key={f.etapa} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-foreground w-28 sm:w-32 shrink-0 truncate capitalize">
                              {FUNNEL_LABELS[f.etapa] || f.etapa}
                            </span>
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: FUNNEL_COLORS[f.etapa] || chartColors.blue }} />
                            </div>
                            <span className="text-xs font-bold tabular-nums text-foreground w-8 text-right">{f.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Consultas por estado */}
                {consultasEstadoChartData.length > 0 && (
                  <div className={`${cards.glassWithHeader}`}>
                    <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
                      <h3 className="font-semibold text-sm sm:text-base text-card-foreground font-jakarta">Consultas por Estado</h3>
                      <p className="text-xs text-muted-foreground">{kpis.consultasTotalMes} este mes</p>
                    </div>
                    <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
                      <DonutChart
                        data={consultasEstadoChartData}
                        size={160}
                        thickness={30}
                        centerText={String(kpis.consultasProgramadas)}
                        centerSubtext="Programadas"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Temperatura de leads */}
              <div className={`${cards.glassWithHeader}`}>
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
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: t.color }} />
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
              <div className={`${cards.glassWithHeader} min-h-[180px]`}>
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
          </section>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// ── Sub-components (extracted to dashboard/components/) ─────
export { SectionHeader, StatPill, TemperatureDot } from './components/DashboardSubComponents';
