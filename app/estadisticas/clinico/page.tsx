'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useClinicalStats } from '@/hooks/useClinicalStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { 
  Stethoscope, 
  Syringe, 
  Building2, 
  CalendarDays, 
  Crown,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamicConfig = 'force-dynamic';

// Lazy Loading de Componentes
const DashboardDiagnosticos = dynamic(
  () => import('../components/dashboard/DashboardDiagnosticos').then(mod => mod.DashboardDiagnosticos),
  { loading: () => <Skeleton className="h-[300px] w-full" />, ssr: false }
);

const DashboardProcedimientos = dynamic(
  () => import('../components/dashboard/DashboardProcedimientos').then(mod => mod.DashboardProcedimientos),
  { loading: () => <Skeleton className="h-[280px] w-full" />, ssr: false }
);

const DashboardSedesDetalle = dynamic(
  () => import('../components/dashboard/DashboardSedesDetalle').then(mod => mod.DashboardSedesDetalle),
  { loading: () => <Skeleton className="h-[200px] w-full" />, ssr: false }
);

const DashboardDemandaDias = dynamic(
  () => import('../components/dashboard/DashboardDemandaDias').then(mod => mod.DashboardDemandaDias),
  { loading: () => <Skeleton className="h-[250px] w-full" />, ssr: false }
);

const DashboardPacientesFieles = dynamic(
  () => import('../components/dashboard/DashboardPacientesFieles').then(mod => mod.DashboardPacientesFieles),
  { loading: () => <Skeleton className="h-[300px] w-full" />, ssr: false }
);

const DashboardKPIsClinico = dynamic(
  () => import('../components/dashboard/DashboardKPIsClinico').then(mod => mod.DashboardKPIsClinico),
  { loading: () => <Skeleton className="h-[100px] w-full" />, ssr: false }
);

const DashboardTendenciaSedes = dynamic(
  () => import('../components/dashboard/DashboardTendenciaSedes').then(mod => mod.DashboardTendenciaSedes),
  { loading: () => <Skeleton className="h-[280px] w-full" />, ssr: false }
);

export default function ClinicoPage() {
  const {
    kpiClinico,
    topDiagnosticos,
    topProcedimientos,
    rendimientoSedes,
    demandaPorDia,
    pacientesFieles,
    tendenciaMensual,
    loading,
    error
  } = useClinicalStats();

  if (loading) {
    return (
      <PageShell 
        title="Métricas Clínicas" 
        eyebrow="Cargando..."
        description="Cargando análisis clínico..."
        fullWidth
      >
        <div className="space-y-6">
          <Skeleton className="h-[100px] w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell 
        title="Métricas Clínicas" 
        eyebrow="Error"
        description="Error al cargar datos"
        fullWidth
      >
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Error al cargar métricas clínicas. Intenta recargar la página.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Análisis de Práctica Médica"
      title="Métricas Clínicas"
      description="Insights avanzados de diagnósticos, procedimientos, rendimiento por sede y patrones de demanda."
    >
      {/* KPIs Clínicos Principales */}
      <section className="mb-8">
        <DashboardKPIsClinico data={kpiClinico} />
      </section>

      {/* Fila 1: Diagnósticos y Procedimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Top Diagnósticos */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              Top Diagnósticos / Condiciones
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Principales motivos de consulta identificados en notas clínicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardDiagnosticos data={topDiagnosticos} />
          </CardContent>
        </Card>

        {/* Top Procedimientos */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Syringe className="w-4 h-4 text-purple-500" />
              Procedimientos Realizados
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Intervenciones y tratamientos más frecuentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardProcedimientos data={topProcedimientos} />
          </CardContent>
        </Card>

      </div>

      {/* Fila 2: Tendencia por Sedes y Rendimiento Detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Tendencia Mensual por Sede */}
        <Card className={`${cards.base} lg:col-span-2`}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Tendencia por Sede (12 meses)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Evolución de consultas Polanco vs Satélite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardTendenciaSedes data={tendenciaMensual} />
          </CardContent>
        </Card>

        {/* Rendimiento por Sede Detallado */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Rendimiento por Sede
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Métricas detalladas por ubicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardSedesDetalle data={rendimientoSedes} />
          </CardContent>
        </Card>

      </div>

      {/* Fila 3: Demanda por Día y Pacientes Fieles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Demanda por Día */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              Demanda por Día de Semana
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Patrones de carga de trabajo y tasa de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardDemandaDias data={demandaPorDia} />
          </CardContent>
        </Card>

        {/* Pacientes Más Fieles */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Pacientes Más Fieles
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Top 10 pacientes con más consultas (fidelización)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardPacientesFieles data={pacientesFieles} />
          </CardContent>
        </Card>

      </div>

      {/* Insights Footer */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-1">💡 Insights Clave</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Próstata/PSA</strong> representa ~23% de la práctica — enfoque principal en salud masculina</li>
              <li>• <strong>VPH/Condilomas</strong> es el 2do motivo más común — oportunidad para campañas de vacunación</li>
              <li>• <strong>Circuncisión</strong> es el procedimiento estrella — considerar marketing especializado</li>
              <li>• <strong>Ratio seguimiento/primera</strong> de {kpiClinico.ratioSeguimientoPrimera} — área de mejora en retención</li>
              <li>• <strong>Viernes</strong> suele ser el día más ocupado — optimizar agenda para máxima capacidad</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
