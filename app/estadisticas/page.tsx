'use client';

import React, { type ElementType } from 'react';
import dynamic from 'next/dynamic';
import { useStats } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  ArrowUpRight, 
  Activity, 
  PieChart as PieChartIcon,
  MessageSquare,
  Share2
} from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamicConfig = 'force-dynamic';

// Lazy Loading de Gráficos para reducir bundle size inicial
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

// Componente para tarjeta KPI pequeña
function KpiCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtext: string; 
  icon: ElementType; 
  trend?: string 
}) {
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{value}</div>
        <p className="text-xs font-medium text-slate-500">{subtext}</p>
      </div>
    </div>
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
    loading 
  } = useStats();

  if (loading) {
    return (
      <PageShell 
        title="Analítica y Reportes" 
        eyebrow="Cargando..."
        description="Cargando tablero de control..."
        fullWidth
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Business Intelligence"
      title="Analítica y Reportes"
      description="Visión estratégica del rendimiento operativo, comercial y de marketing."
    >
      {/* KPIs Principales */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Pacientes Activos"
          value={kpi.totalPacientes}
          subtext={`+${kpi.pacientesNuevosMes} nuevos este mes`}
          icon={Users}
          trend={kpi.pacientesNuevosMes > 0 ? "Creciendo" : undefined}
        />
        <KpiCard
          title="Consultas (Mes)"
          value={kpi.consultasMes}
          subtext={`${kpi.consultasConfirmadasMes} confirmadas`}
          icon={Calendar}
        />
        <KpiCard
          title="Tasa Conversión"
          value={`${kpi.tasaConversion}%`}
          subtext="Leads a Pacientes"
          icon={Target}
          trend="+2.4%"
        />
        <KpiCard
          title="Mensajería Total"
          value={metricasMensajeria.reduce((acc, curr) => acc + curr.value, 0)}
          subtext="Interacciones Lead/Bot"
          icon={MessageSquare}
        />
      </section>

      {/* Gráficos Principales - Fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Evolución Mensual */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Crecimiento Operativo
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Consultas vs Pacientes Nuevos (6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <EvolutionChart data={evolucionMensual} />
          </CardContent>
        </Card>

        {/* Funnel de Leads Mejorado */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Embudo de Conversión
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Flujo de leads desde captura hasta cierre</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnelLeads} />
          </CardContent>
        </Card>

      </div>

      {/* Gráficos Secundarios - Fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Marketing: Fuentes */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-pink-500 dark:text-pink-400" />
              Canales de Captación
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Origen de los leads</CardDescription>
          </CardHeader>
          <CardContent>
            <SourcesChart data={fuentesCaptacion} />
          </CardContent>
        </Card>

        {/* Operativo: Estado Citas */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Estado de Citas
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Desglose operativo actual</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={estadoCitas} />
          </CardContent>
        </Card>

        {/* Sedes */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Por Sede
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Distribución geográfica</CardDescription>
          </CardHeader>
          <CardContent>
            <SedesChart data={consultasPorSede} />
          </CardContent>
        </Card>

      </div>
    </PageShell>
  );
}

