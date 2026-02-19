'use client';

import { useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import {
  MessageSquare, UserCheck, Calendar, RefreshCw,
} from 'lucide-react';
import { useDashboardV2 } from '@/hooks/dashboard/useDashboardV2';
import type { DashboardV2Data } from '@/hooks/dashboard/useDashboardV2';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { chartColors } from '@/app/lib/design-system';

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

/**
 * ============================================================
 * DASHBOARD CLIENT V5 — Clinical Command Center
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
    kpis, bot, leadsTendencia, consultasTendencia,
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

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

          {/* ═══════════════════════════════════════════
              HEADER — Greeting + date + live indicator
              ═══════════════════════════════════════════ */}
          <header className="animate-fade-up stagger-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-400 live-dot" />
                  <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-teal-400/80">
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
              KPI CARDS — 3 glass cards with sparklines
              ═══════════════════════════════════════════ */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className={`kpi-card ${m.glowClass} grain-overlay relative overflow-hidden rounded-2xl border ${m.accentBorder} bg-card p-5 sm:p-6 flex flex-col animate-fade-up stagger-${i + 2} cursor-default`}
                >
                  {/* Top row: icon + label */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${m.accentBg}`}>
                        <Icon className={`h-4 w-4 ${m.accentColor}`} />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
              ACTIVITY CHART — Bar + dual sparklines
              ═══════════════════════════════════════════ */}
          <section className="animate-fade-up stagger-5 grain-overlay relative overflow-hidden rounded-2xl border border-border bg-card">
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
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
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

        </div>
      </div>
    </ErrorBoundary>
  );
}

// ── Sub-components (extracted to dashboard/components/) ─────
export { SectionHeader, StatPill, TemperatureDot } from './components/DashboardSubComponents';
