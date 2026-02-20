'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import {
  MessageSquare, UserCheck, Calendar, RefreshCw,
  AlertTriangle, TrendingUp, DollarSign, Percent,
  Clock, Phone, Flame, Stethoscope, ArrowUpRight,
  ChevronRight, Zap, ShieldAlert,
} from 'lucide-react';
import { useDashboardV2 } from '@/hooks/dashboard/useDashboardV2';
import type { DashboardV2Data } from '@/hooks/dashboard/useDashboardV2';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { chartColors } from '@/app/lib/design-system';
import { TemperatureDot } from './components/DashboardSubComponents';

const SparklineChart = dynamicImport(() => import('@/app/components/analytics/SparklineChart').then(mod => ({ default: mod.SparklineChart })), {
  loading: () => <div className="h-[56px] w-full bg-muted/10 rounded" />,
  ssr: false,
});

const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[240px] w-full bg-muted/10 rounded-xl" />,
  ssr: false,
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD}d`;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `$${amount.toLocaleString('es-MX')}`;
}

const ESTADO_CITA_COLORS: Record<string, string> = {
  Programada: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  Confirmada: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Reagendada: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Cancelada: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  Completada: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
};

const LEAD_ESTADO_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  interesado: 'Interesado',
  calificado: 'Calificado',
  escalado: 'Escalado',
  cita_agendada: 'Cita agendada',
  convertido: 'Convertido',
  no_interesado: 'No interesado',
  descartado: 'Descartado',
};

/**
 * ============================================================
 * DASHBOARD CLIENT V6 — Clinical Command Center
 * ============================================================
 * Design: Executive Dashboard + Medical Minimalism
 * Style: Glass cards, teal accents, stagger animations, ambient glow
 * Skills: frontend-design + ui-ux-pro-max
 */
interface DashboardClientProps {
  initialData?: DashboardV2Data;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const {
    kpis, bot, acciones, totalAcciones,
    leadsRecientes, consultasProximas, escalamientosRecientes,
    leadsTendencia, consultasTendencia,
    tasaConversion, tasaAsistencia, leadsCrecimientoMes, ingresosCrecimientoMes,
    loading, refresh,
  } = useDashboardV2(initialData);

  // ── Chart: resumen diario (leads + consultas tendencia combinados) ──
  const activityChartData = useMemo(() => {
    const map = new Map<string, { leads: number; consultas: number }>();

    leadsTendencia.forEach(t => {
      const existing = map.get(t.fecha) || { leads: 0, consultas: 0 };
      existing.leads = t.count;
      map.set(t.fecha, existing);
    });

    consultasTendencia.forEach(t => {
      const existing = map.get(t.fecha) || { leads: 0, consultas: 0 };
      existing.consultas = t.count;
      map.set(t.fecha, existing);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, vals]) => ({
        label: new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
        value: vals.leads + vals.consultas,
        color: chartColors.teal,
      }));
  }, [leadsTendencia, consultasTendencia]);

  // ── Acciones urgentes items ──
  const accionItems = useMemo(() => {
    const items: { label: string; count: number; icon: typeof AlertTriangle; color: string }[] = [];
    if (acciones.escalamientosPendientes > 0) items.push({ label: 'Escalamientos', count: acciones.escalamientosPendientes, icon: ShieldAlert, color: 'text-rose-400' });
    if (acciones.leadsCalientesSinCita > 0) items.push({ label: 'Leads calientes sin cita', count: acciones.leadsCalientesSinCita, icon: Flame, color: 'text-orange-400' });
    if (acciones.consultasSinConfirmar > 0) items.push({ label: 'Sin confirmar', count: acciones.consultasSinConfirmar, icon: Calendar, color: 'text-amber-400' });
    if (acciones.mensajesNoLeidos > 0) items.push({ label: 'Mensajes no leídos', count: acciones.mensajesNoLeidos, icon: MessageSquare, color: 'text-sky-400' });
    if (acciones.leadsSinRespuesta24h > 0) items.push({ label: 'Sin respuesta 24h', count: acciones.leadsSinRespuesta24h, icon: Clock, color: 'text-violet-400' });
    return items;
  }, [acciones]);

  // ── KPI definitions ──
  const metrics = [
    {
      title: 'Mensajes hoy',
      value: bot.conversacionesHoy,
      subtitle: `${bot.totalMensajesUsuario} totales`,
      icon: MessageSquare,
      accentColor: 'text-sky-400',
      accentBg: 'bg-sky-500/10',
      accentBorder: 'border-sky-500/20',
      glowClass: 'kpi-card--sky',
      sparkData: leadsTendencia,
      sparkColor: 'var(--chart-blue)',
      sparkId: 'msgGrad',
    },
    {
      title: 'Leads atendidos',
      value: kpis.leadsMes,
      subtitle: `+${kpis.leadsHoy} hoy · ${kpis.leadsTotal} total`,
      icon: UserCheck,
      accentColor: 'text-emerald-400',
      accentBg: 'bg-emerald-500/10',
      accentBorder: 'border-emerald-500/20',
      glowClass: 'kpi-card--emerald',
      sparkData: leadsTendencia,
      sparkColor: 'var(--chart-emerald)',
      sparkId: 'leadsGrad',
    },
    {
      title: 'Agendas hoy',
      value: kpis.consultasHoy,
      subtitle: `${kpis.consultasProgramadas} programadas`,
      icon: Calendar,
      accentColor: 'text-amber-400',
      accentBg: 'bg-amber-500/10',
      accentBorder: 'border-amber-500/20',
      glowClass: 'kpi-card--amber',
      sparkData: consultasTendencia,
      sparkColor: 'var(--chart-amber)',
      sparkId: 'agendaGrad',
    },
  ];

  // ── Secondary KPIs ──
  const secondaryMetrics = [
    {
      label: 'Conversión',
      value: `${tasaConversion}%`,
      icon: Percent,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      label: 'Asistencia',
      value: `${tasaAsistencia}%`,
      icon: Stethoscope,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Ingresos mes',
      value: formatCurrency(kpis.ingresosMes),
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      trend: ingresosCrecimientoMes,
    },
    {
      label: 'Crecimiento',
      value: `${leadsCrecimientoMes > 0 ? '+' : ''}${leadsCrecimientoMes}%`,
      icon: TrendingUp,
      color: leadsCrecimientoMes >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: leadsCrecimientoMes >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    },
  ];

  return (
    <ErrorBoundary>
      <div className="relative min-h-full bg-background text-foreground">
        {/* Ambient background gradient */}
        <div
          className="pointer-events-none fixed inset-0 opacity-40"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(20, 184, 166, 0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

          {/* ═══════════════════════════════════════════
              HEADER — Greeting + date + live indicator
              ═══════════════════════════════════════════ */}
          <header className="animate-fade-up stagger-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-400 live-dot" />
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-teal-400/80">
                    Centro de Comando
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-jakarta text-foreground">
                  {getGreeting()}
                </h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {getFormattedDate()}
                </p>
              </div>

              <button
                onClick={refresh}
                disabled={loading}
                className="group flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground hover:border-teal-500/30 hover:bg-teal-500/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 transition-transform group-hover:text-teal-400 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </header>

          {/* ═══════════════════════════════════════════
              ACCIONES URGENTES — Alert banner
              ═══════════════════════════════════════════ */}
          {!loading && totalAcciones > 0 && (
            <section className="animate-fade-up stagger-2">
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.04]">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.06] to-transparent pointer-events-none" aria-hidden />
                <div className="relative px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/15">
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-bold text-foreground font-jakarta">
                        {totalAcciones} {totalAcciones === 1 ? 'acción pendiente' : 'acciones pendientes'}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {accionItems.map(item => {
                      const Icon = item.icon;
                      // Mapeo de rutas para cada tipo de acción urgente
                      const href = item.label === 'Escalamientos' ? '/leads?filtro=escalado' 
                                 : item.label === 'Leads calientes sin cita' ? '/leads'
                                 : item.label === 'Sin confirmar' ? '/consultas'
                                 : item.label === 'Mensajes no leídos' ? '/conversaciones'
                                 : '/leads';
                                 
                      return (
                        <Link
                          href={href}
                          key={item.label}
                          className="flex items-center gap-1.5 rounded-lg bg-card/60 border border-border/50 px-2.5 py-1.5 text-xs hover:bg-card hover:border-amber-500/30 transition-colors"
                        >
                          <Icon className={`h-3 w-3 ${item.color}`} />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                          <span className="font-bold text-foreground tabular-nums">{item.count}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              KPI CARDS — 3 glass cards with sparklines
              ═══════════════════════════════════════════ */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className={`kpi-card ${m.glowClass} grain-overlay relative overflow-hidden rounded-2xl border ${m.accentBorder} bg-card p-5 sm:p-6 flex flex-col animate-fade-up stagger-${i + 3} cursor-default`}
                >
                  {/* Top row: icon + label */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${m.accentBg}`}>
                        <Icon className={`h-4 w-4 ${m.accentColor}`} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {m.title}
                      </span>
                    </div>
                  </div>

                  {/* Big number */}
                  <div className="flex-1 flex items-end">
                    <div className={`text-5xl sm:text-[3.5rem] font-extrabold tabular-nums font-jakarta tracking-tighter leading-none ${loading ? 'opacity-30' : 'animate-count-in'}`}>
                      {loading ? '—' : m.value}
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs text-muted-foreground mt-3 mb-3">{m.subtitle}</p>

                  {/* Integrated sparkline */}
                  <div className="mt-auto -mx-1">
                    <SparklineChart
                      data={m.sparkData}
                      color={m.sparkColor}
                      gradientId={m.sparkId}
                      height={48}
                    />
                  </div>
                </div>
              );
            })}
          </section>

          {/* ═══════════════════════════════════════════
              SECONDARY METRICS — Compact strip
              ═══════════════════════════════════════════ */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up stagger-6">
            {secondaryMetrics.map(sm => {
              const Icon = sm.icon;
              return (
                <div
                  key={sm.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 sm:px-4 sm:py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className={`p-1.5 rounded-lg ${sm.bg} shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${sm.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{sm.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold tabular-nums text-foreground font-jakarta tracking-tight">
                        {loading ? '—' : sm.value}
                      </span>
                      {'trend' in sm && sm.trend !== undefined && !loading && (
                        <span className={`text-[11px] sm:text-xs font-bold ${sm.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sm.trend > 0 ? '↑' : sm.trend < 0 ? '↓' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ═══════════════════════════════════════════
              ACTIVITY CHART — Bar + dual sparklines
              ═══════════════════════════════════════════ */}
          <section className="animate-fade-up stagger-7 grain-overlay relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Chart header */}
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-card-foreground font-jakarta tracking-tight">
                  Actividad diaria
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Leads + consultas — últimos días
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: chartColors.teal }} />
                Actividad total
              </div>
            </div>

            {/* Bar chart */}
            <div className="px-3 sm:px-4 pb-2">
              {activityChartData.length > 0 ? (
                <BarChart data={activityChartData} height={240} />
              ) : (
                <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                  Sin datos de actividad
                </div>
              )}
            </div>

            {/* Dual sparklines footer */}
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <div className="px-5 sm:px-6 py-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Leads
                  </span>
                  <span className="ml-auto text-xs font-bold tabular-nums text-emerald-400">
                    {loading ? '—' : kpis.leadsMes}
                  </span>
                </div>
                <SparklineChart data={leadsTendencia} color="var(--chart-emerald)" gradientId="leadsFooter" height={44} />
              </div>
              <div className="px-5 sm:px-6 py-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Consultas
                  </span>
                  <span className="ml-auto text-xs font-bold tabular-nums text-amber-400">
                    {loading ? '—' : kpis.consultasProgramadas}
                  </span>
                </div>
                <SparklineChart data={consultasTendencia} color="var(--chart-amber)" gradientId="consultasFooter" height={44} />
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              TWO-COLUMN: Consultas Próximas + Leads Recientes
              ═══════════════════════════════════════════ */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── Consultas Próximas ── */}
            <div className="animate-fade-up stagger-8 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-500/10">
                    <Stethoscope className="h-4 w-4 text-teal-400" />
                  </div>
                  <h2 className="text-sm font-bold text-foreground font-jakarta">Consultas próximas</h2>
                </div>
                <span className="text-xs font-bold tabular-nums text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                  {consultasProximas.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-border">
                {consultasProximas.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                    Sin consultas próximas
                  </div>
                ) : (
                  consultasProximas.slice(0, 6).map(c => {
                    const statusClasses = ESTADO_CITA_COLORS[c.estadoCita] || 'bg-muted text-muted-foreground border-border';
                    return (
                      <div key={c.id} className="group flex items-center gap-3 px-5 sm:px-6 py-3 transition-colors hover:bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.paciente}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground">{formatTime(c.fechaHoraInicio)}</span>
                            {c.tipoCita && (
                              <>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-xs text-muted-foreground truncate">{c.tipoCita}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusClasses}`}>
                            {c.estadoCita}
                          </span>
                          {c.confirmadoPaciente && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Confirmado" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Leads Recientes ── */}
            <div className="animate-fade-up stagger-9 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h2 className="text-sm font-bold text-foreground font-jakarta">Leads recientes</h2>
                </div>
                <span className="text-xs font-bold tabular-nums text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {leadsRecientes.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-border">
                {leadsRecientes.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                    Sin leads recientes
                  </div>
                ) : (
                  leadsRecientes.slice(0, 6).map(l => (
                    <div key={l.id} className="group flex items-center gap-3 px-5 sm:px-6 py-3 transition-colors hover:bg-muted/30">
                      <div className="shrink-0">
                        {l.temperatura ? (
                          <TemperatureDot temp={l.temperatura} />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-500 inline-block" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{l.nombre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {LEAD_ESTADO_LABELS[l.estado] || l.estado}
                          </span>
                          {l.fuente && (
                            <>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="text-xs text-muted-foreground truncate">{l.fuente}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {l.scoreTotal !== null && l.scoreTotal > 0 && (
                          <span className="text-[11px] sm:text-xs font-bold tabular-nums text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {l.scoreTotal}
                          </span>
                        )}
                        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {timeAgo(l.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              ESCALAMIENTOS RECIENTES
              ═══════════════════════════════════════════ */}
          {escalamientosRecientes.length > 0 && (
            <section className="animate-fade-up stagger-10 rounded-2xl border border-rose-500/15 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-rose-500/10">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                  </div>
                  <h2 className="text-sm font-bold text-foreground font-jakarta">Escalamientos recientes</h2>
                </div>
                <span className="text-xs font-bold tabular-nums text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  {escalamientosRecientes.length}
                </span>
              </div>

              <div className="divide-y divide-border">
                {escalamientosRecientes.slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-5 sm:px-6 py-3 transition-colors hover:bg-muted/30">
                    <div className="shrink-0">
                      {e.esUrgente ? (
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Phone className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{e.nombre}</p>
                        {e.esUrgente && (
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/25">
                            Urgente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {e.interes && <span className="text-xs text-muted-foreground truncate">{e.interes}</span>}
                        {e.sintomasPrincipales && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-xs text-muted-foreground truncate">{e.sintomasPrincipales}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {e.citaAgendada && (
                        <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
                          <Calendar className="h-2.5 w-2.5" />
                          Agendada
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {timeAgo(e.createdAt)}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════════
              BOT PERFORMANCE — Compact summary
              ═══════════════════════════════════════════ */}
          <section className="animate-fade-up stagger-11 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/10">
                  <Zap className="h-4 w-4 text-sky-400" />
                </div>
                <h2 className="text-sm font-bold text-foreground font-jakarta">Rendimiento del Bot</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {[
                { label: 'Resolución', value: `${bot.tasaResolucion}%`, color: 'text-emerald-400' },
                { label: 'Escalamiento', value: `${bot.tasaEscalamiento}%`, color: 'text-amber-400' },
                { label: 'Citas por bot', value: String(bot.citasAgendadasBot), color: 'text-teal-400' },
                { label: 'Resp. promedio', value: `${bot.promedioTiempoRespuestaSeg}s`, color: 'text-sky-400' },
              ].map(stat => (
                <div key={stat.label} className="px-5 sm:px-6 py-3.5 sm:py-4 text-center sm:text-left">
                  <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{stat.label}</p>
                  <p className={`text-xl sm:text-2xl font-extrabold tabular-nums font-jakarta tracking-tight ${loading ? 'opacity-30' : stat.color}`}>
                    {loading ? '—' : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </ErrorBoundary>
  );
}

// ── Sub-components (extracted to dashboard/components/) ─────
export { SectionHeader, StatPill, TemperatureDot } from './components/DashboardSubComponents';
