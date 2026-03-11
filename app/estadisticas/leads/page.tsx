'use client';

import nextDynamic from 'next/dynamic';
import { useStats } from '@/hooks/dashboard/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards, layouts, progress } from '@/app/lib/design-system';
import { Users, TrendingUp, Target, Thermometer } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';
import { MetricCard } from '@/app/components/metrics/MetricCard';

export const dynamic = 'force-dynamic';

const FunnelChart = nextDynamic(() => import('../components/dashboard/DashboardFunnelChart').then(mod => mod.DashboardFunnelChart), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false
});

const SourcesChart = nextDynamic(() => import('../components/dashboard/DashboardSourcesChart').then(mod => mod.DashboardSourcesChart), {
  loading: () => <Skeleton className="h-[220px] w-full" />,
  ssr: false
});

export default function LeadsAnalysisPage() {
  const { kpi, funnelLeads, fuentesCaptacion, loading } = useStats();

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Crecimiento"
      title="Análisis de Leads"
      description="Desglose detallado de la adquisición y calidad de leads."
    >
      {/* KPIs */}
      <section className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-4 sm:gap-3 md:gap-4">
        <MetricCard
          variant="kpi"
          title="Total Leads"
          value={kpi.totalLeads}
          subtitle="Histórico acumulado"
          iconComponent={Users}
          loading={loading}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
        <MetricCard
          variant="kpi"
          title="Nuevos este mes"
          value={kpi.leadsNuevosMes}
          subtitle="Captados este mes"
          iconComponent={TrendingUp}
          iconColor="text-emerald-400"
          loading={loading}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
        <MetricCard
          variant="kpi"
          title="Conversión"
          value={`${kpi.tasaConversion}%`}
          subtitle="Leads → Pacientes"
          iconComponent={Target}
          iconColor="text-teal-400"
          loading={loading}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
        <MetricCard
          variant="kpi"
          title="Consultas"
          value={kpi.consultasConfirmadasMes}
          subtitle="Confirmadas este mes"
          iconComponent={Thermometer}
          iconColor="text-amber-400"
          loading={loading}
          className="min-w-[160px] max-w-[200px] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
        />
      </section>

      {/* Charts */}
      <div className={layouts.grid2}>
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Embudo de Conversión
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Distribución de leads por estado</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[300px] w-full" /> : <FunnelChart data={funnelLeads} height={300} barSize={24} />}
          </CardContent>
        </Card>

        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-500" />
              Fuentes de Captación
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Origen de los leads</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[220px] w-full" /> : <SourcesChart data={fuentesCaptacion} />}
          </CardContent>
        </Card>
      </div>

      {/* Conversion funnel progress */}
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            Tasas de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Tasa de Conversión</span>
              <span className="text-lg font-bold text-teal-400">{kpi.tasaConversion}%</span>
            </div>
            <div className={progress.track}>
              <div className={`${progress.bar} ${progress.barGradientTeal}`} style={{ width: `${kpi.tasaConversion}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Tasa de Asistencia</span>
              <span className="text-lg font-bold text-emerald-400">{kpi.tasaAsistencia}%</span>
            </div>
            <div className={progress.track}>
              <div className={`${progress.bar} ${progress.barGradientEmerald}`} style={{ width: `${kpi.tasaAsistencia}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
