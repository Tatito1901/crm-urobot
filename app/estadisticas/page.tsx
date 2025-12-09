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
  Share2,
  BarChart3,
  Flame,
  Clock
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

const DestinosChart = dynamic(() => import('./components/dashboard/DashboardDestinosChart').then(mod => mod.DashboardDestinosChart), {
  loading: () => <Skeleton className="h-[220px] w-full" />,
  ssr: false
});

// Nuevos componentes de análisis
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

// Componente para tarjeta KPI pequeña - Con manejo de overflow
function KpiCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend,
  tooltip
}: { 
  title: string; 
  value: string | number; 
  subtext: string; 
  icon: ElementType; 
  trend?: string;
  tooltip?: string;
}) {
  // Formatear números grandes
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString('es-MX');
    }
    return val;
  };

  return (
    <div 
      className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-primary/50 transition-all min-h-[140px]"
      title={tooltip}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 sm:p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-emerald-500/20 shrink-0">
            <ArrowUpRight className="w-3 h-3" />
            <span className="hidden sm:inline">{trend}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-muted-foreground text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest mb-1 truncate">{title}</h3>
        <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 tracking-tight truncate">{formatValue(value)}</div>
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{subtext}</p>
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
    destinosPacientes,
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
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <KpiCard
          title="Pacientes"
          value={kpi.totalPacientes}
          subtext={`+${kpi.pacientesNuevosMes} este mes`}
          icon={Users}
          trend={kpi.pacientesNuevosMes > 0 ? "Creciendo" : undefined}
          tooltip="Total de pacientes registrados en el sistema"
        />
        <KpiCard
          title="Consultas"
          value={kpi.consultasMes}
          subtext={`${kpi.consultasConfirmadasMes} confirmadas`}
          icon={Calendar}
          tooltip="Consultas programadas este mes"
        />
        <KpiCard
          title="Conversión"
          value={`${kpi.tasaConversion}%`}
          subtext="Leads → Pacientes"
          icon={Target}
          trend={kpi.tasaConversion > 5 ? `${kpi.tasaConversion}%` : undefined}
          tooltip="Porcentaje de leads que se convierten en pacientes"
        />
        <KpiCard
          title="Leads"
          value={kpi.totalLeads}
          subtext={`${kpi.leadsNuevosMes} nuevos`}
          icon={MessageSquare}
          tooltip="Total de leads en el sistema"
        />
      </section>

      {/* Gráficos Principales - Fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-6">
        
        {/* Evolución Mensual */}
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Crecimiento Operativo
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Consultas vs Pacientes Nuevos (6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <EvolutionChart data={evolucionMensual} />
          </CardContent>
        </Card>

        {/* Funnel de Leads Mejorado */}
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Embudo de Conversión
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Flujo de leads desde captura hasta cierre</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnelLeads} />
          </CardContent>
        </Card>

      </div>

      {/* Análisis de Ocupación y Predicciones */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4 sm:mb-6">
        {/* Heatmap de Ocupación */}
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

        {/* Análisis Predictivo */}
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

      {/* Gráficos Secundarios - Fila 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Marketing: Fuentes */}
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Share2 className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="truncate">Canales</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground truncate">Origen de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <SourcesChart data={fuentesCaptacion} />
          </CardContent>
        </Card>

        {/* Operativo: Estado Citas */}
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">Citas</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground truncate">Estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={estadoCitas} />
          </CardContent>
        </Card>

        {/* Sedes */}
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="truncate">Sedes</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground truncate">Distribución</CardDescription>
          </CardHeader>
          <CardContent>
            <SedesChart data={consultasPorSede} />
          </CardContent>
        </Card>

        {/* Destinos */}
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">Destinos</span>
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground truncate">Resolución</CardDescription>
          </CardHeader>
          <CardContent>
            <DestinosChart data={destinosPacientes} />
          </CardContent>
        </Card>

      </div>

      {/* Patrones y Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 sm:mt-6">
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

        {/* Métricas de Asistencia */}
        <Card className={`${cards.base} min-w-0`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Métricas de Asistencia
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Tasas de confirmación y asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Tasa de Asistencia */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Tasa de Asistencia</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{kpi.tasaAsistencia}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                    style={{ width: `${kpi.tasaAsistencia}%` }}
                  />
                </div>
              </div>

              {/* Tasa de Conversión */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Tasa de Conversión</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{kpi.tasaConversion}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all"
                    style={{ width: `${kpi.tasaConversion}%` }}
                  />
                </div>
              </div>

              {/* Consultas Confirmadas */}
              <div className="pt-3 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{kpi.consultasConfirmadasMes}</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Confirmadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{kpi.leadsNuevosMes}</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Leads Nuevos</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

