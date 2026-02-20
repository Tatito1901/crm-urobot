'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useStats } from '@/hooks/dashboard/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards, layouts, progress } from '@/app/lib/design-system';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  Activity, 
  PieChart as PieChartIcon,
  MessageSquare,
  Share2,
  BarChart3,
  Flame,
  Clock,
  Megaphone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';
import { MetricCard } from '@/app/components/metrics/MetricCard';

const EvolutionChart = dynamic(() => import('./components/dashboard/DashboardEvolutionChart').then(mod => mod.DashboardEvolutionChart), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false
});

const FunnelChart = dynamic(() => import('./components/dashboard/DashboardFunnelChart').then(mod => mod.DashboardFunnelChart), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false
});

const SourcesChart = dynamic(() => import('./components/dashboard/DashboardSourcesChart').then(mod => mod.DashboardSourcesChart), {
  loading: () => <Skeleton className="h-[220px] w-full" />,
  ssr: false
});

const StatusChart = dynamic(() => import('./components/dashboard/DashboardStatusChart').then(mod => mod.DashboardStatusChart), {
  loading: () => <Skeleton className="h-[220px] w-full" />,
  ssr: false
});

const SedesChart = dynamic(() => import('./components/dashboard/DashboardSedesChart').then(mod => mod.DashboardSedesChart), {
  loading: () => <Skeleton className="h-[220px] w-full" />,
  ssr: false
});

const DestinosChart = dynamic(() => import('./components/dashboard/DashboardDestinosChart').then(mod => mod.DashboardDestinosChart), {
  loading: () => <Skeleton className="h-[220px] w-full" />,
  ssr: false
});

const DashboardHeatmap = dynamic(() => import('./components/dashboard/DashboardHeatmap').then(mod => mod.DashboardHeatmap), {
  loading: () => <Skeleton className="h-[200px] w-full" />,
  ssr: false
});

const DashboardPredictive = dynamic(() => import('./components/dashboard/DashboardPredictive').then(mod => mod.DashboardPredictive), {
  loading: () => <Skeleton className="h-[200px] w-full" />,
  ssr: false
});

const DashboardHourlyPatterns = dynamic(() => import('./components/dashboard/DashboardHourlyPatterns').then(mod => mod.DashboardHourlyPatterns), {
  loading: () => <Skeleton className="h-[280px] w-full" />,
  ssr: false
});

const CampaignLeadsChart = dynamic(() => import('./components/CampaignLeadsChart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false
});

function SectionHeader({ icon: Icon, title, iconColor = 'text-muted-foreground' }: { icon: React.ElementType; title: string; iconColor?: string }) {
  return (
    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3 sm:mb-4">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      {title}
    </h2>
  );
}

export default function EstadisticasPage() {
  const { 
    kpi, 
    consultasPorSede, 
    estadoCitas, 
    evolucionMensual, 
    funnelLeads, 
    fuentesCaptacion,
    metricasMensajeria,
    destinosPacientes,
    loading,
    error,
    refresh
  } = useStats();

  const showChartSkeletons = loading;

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Business Intelligence"
      title="Analítica y Reportes"
      description="Visión estratégica del rendimiento operativo, comercial y de marketing."
      headerSlot={
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      }
    >
      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">Error al cargar datos. <button onClick={() => refresh()} className="underline font-medium">Reintentar</button></p>
        </div>
      )}

      {/* ═══ KPIs Principales ═══ */}
      <section className={layouts.kpiGrid}>
        <MetricCard
          variant="kpi"
          title="Pacientes"
          value={kpi.totalPacientes}
          subtitle={`+${kpi.pacientesNuevosMes} este mes`}
          iconComponent={Users}
          trend={kpi.pacientesNuevosMes > 0 ? "Creciendo" : undefined}
          tooltip="Total de pacientes registrados en el sistema"
          loading={loading}
        />
        <MetricCard
          variant="kpi"
          title="Consultas"
          value={kpi.consultasMes}
          subtitle={`${kpi.consultasConfirmadasMes} confirmadas`}
          iconComponent={Calendar}
          tooltip="Consultas este mes"
          loading={loading}
        />
        <MetricCard
          variant="kpi"
          title="Conversión"
          value={`${kpi.tasaConversion}%`}
          subtitle="Leads → Pacientes"
          iconComponent={Target}
          trend={kpi.tasaConversion > 5 ? `${kpi.tasaConversion}%` : undefined}
          tooltip="Porcentaje de leads que se convierten en pacientes"
          loading={loading}
        />
        <MetricCard
          variant="kpi"
          title="Leads"
          value={kpi.totalLeads}
          subtitle={`${kpi.leadsNuevosMes} nuevos este mes`}
          iconComponent={MessageSquare}
          tooltip="Total de leads en el sistema"
          loading={loading}
        />
      </section>

      {/* ═══ Crecimiento y Conversión ═══ */}
      <section>
        <SectionHeader icon={TrendingUp} title="Crecimiento y Conversión" iconColor="text-teal-500" />
        <div className={layouts.grid2}>
          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                Crecimiento Operativo
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Consultas vs Pacientes vs Leads (6 meses)</CardDescription>
            </CardHeader>
            <CardContent>
              {showChartSkeletons ? <Skeleton className="h-[300px] w-full" /> : <EvolutionChart data={evolucionMensual} />}
            </CardContent>
          </Card>

          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                Embudo de Conversión
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Flujo de leads desde captura hasta cierre</CardDescription>
            </CardHeader>
            <CardContent>
              {showChartSkeletons ? <Skeleton className="h-[300px] w-full" /> : <FunnelChart data={funnelLeads} />}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ Ocupación y Predicciones ═══ */}
      <section>
        <SectionHeader icon={Flame} title="Ocupación y Predicciones" iconColor="text-orange-500" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
          <Card className={`${cards.base} xl:col-span-2 min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Mapa de Ocupación
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Histórico de consultas estilo GitHub</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardHeatmap monthsToShow={6} />
            </CardContent>
          </Card>

          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Análisis Predictivo
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Tendencias y proyecciones</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardPredictive />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ Distribución Operativa ═══ */}
      <section>
        <SectionHeader icon={PieChartIcon} title="Distribución Operativa" iconColor="text-purple-500" />
        <div className={layouts.grid4}>
          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="truncate">Canales</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground truncate">Origen de leads</CardDescription>
            </CardHeader>
            <CardContent>
              {showChartSkeletons ? <Skeleton className="h-[220px] w-full" /> : <SourcesChart data={fuentesCaptacion} />}
            </CardContent>
          </Card>

          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Citas</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground truncate">Estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              {showChartSkeletons ? <Skeleton className="h-[220px] w-full" /> : <StatusChart data={estadoCitas} />}
            </CardContent>
          </Card>

          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="truncate">Sedes</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground truncate">Distribución</CardDescription>
            </CardHeader>
            <CardContent>
              {showChartSkeletons ? <Skeleton className="h-[220px] w-full" /> : <SedesChart data={consultasPorSede} />}
            </CardContent>
          </Card>

          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Destinos</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground truncate">Resolución</CardDescription>
            </CardHeader>
            <CardContent>
              {showChartSkeletons ? <Skeleton className="h-[220px] w-full" /> : <DestinosChart data={destinosPacientes} />}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ Marketing ═══ */}
      <section>
        <SectionHeader icon={Megaphone} title="Marketing" iconColor="text-blue-500" />
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-500" />
              Leads por Campaña
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Distribución de leads por campaña Meta Ads (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignLeadsChart />
          </CardContent>
        </Card>
      </section>

      {/* ═══ Patrones y Rendimiento ═══ */}
      <section>
        <SectionHeader icon={Clock} title="Patrones y Rendimiento" iconColor="text-cyan-500" />
        <div className={layouts.grid2}>
          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                Patrones de Demanda
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Horas pico por día de la semana</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardHourlyPatterns />
            </CardContent>
          </Card>

          <Card className={`${cards.base} min-w-0`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Métricas de Asistencia
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Tasas de confirmación y asistencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Tasa de Asistencia</span>
                    <span className="text-xl font-bold text-emerald-400">{kpi.tasaAsistencia}%</span>
                  </div>
                  <div className={progress.track}>
                    <div 
                      className={`${progress.bar} ${progress.barGradientEmerald}`}
                      style={{ width: `${kpi.tasaAsistencia}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Tasa de Conversión</span>
                    <span className="text-xl font-bold text-teal-400">{kpi.tasaConversion}%</span>
                  </div>
                  <div className={progress.track}>
                    <div 
                      className={`${progress.bar} ${progress.barGradientTeal}`}
                      style={{ width: `${kpi.tasaConversion}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground tabular-nums">{kpi.consultasConfirmadasMes}</div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Confirmadas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground tabular-nums">{kpi.leadsNuevosMes}</div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Leads Nuevos</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}

