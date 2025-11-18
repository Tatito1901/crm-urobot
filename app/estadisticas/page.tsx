'use client';

/**
 * ============================================================
 * ESTADÍSTICAS UNIFICADAS - Análisis completo del CRM
 * ============================================================
 * Combina métricas, tendencias y análisis detallado
 * Adaptado a flujos de UROBOT y datos disponibles en Supabase
 */

import { useState, useMemo } from 'react';
import dynamicImport from 'next/dynamic';
import { PageShell } from '@/app/components/crm/page-shell';
import { StatCard } from '@/app/components/crm/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';
import { Calendar, Clock, TrendingUp, Globe, CheckCircle, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Lazy load de gráficos
const BarChart = dynamicImport(() => import('@/app/components/analytics/BarChart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-[220px] animate-pulse bg-slate-800/30 rounded-lg" />,
  ssr: false,
});

const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-[240px] animate-pulse bg-slate-800/30 rounded-lg" />,
  ssr: false,
});

const GrowthChart = dynamicImport(
  () => import('@/app/components/analytics/GrowthChart').then(mod => ({ default: mod.GrowthChart })),
  {
    loading: () => <div className="h-[300px] animate-pulse bg-slate-800/30 rounded-lg" />,
    ssr: false,
  }
);

const ComparisonBars = dynamicImport(
  () => import('@/app/components/analytics/ComparisonBars').then(mod => ({ default: mod.ComparisonBars })),
  {
    loading: () => <div className="h-[200px] animate-pulse bg-slate-800/30 rounded-lg" />,
    ssr: false,
  }
);

type Periodo = 'mes_actual' | 'ultimos_3_meses' | 'ultimos_6_meses' | 'todo';

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes_actual');
  
  const { metrics: dm, loading: loadingMetrics, refetch: refetchMetrics } = useDashboardMetrics();
  const { leads, loading: loadingLeads, refetch: refetchLeads } = useLeads();
  const { consultas, loading: loadingConsultas, refetch: refetchConsultas } = useConsultas();

  const handleRefresh = async () => {
    await Promise.all([refetchMetrics(), refetchLeads(), refetchConsultas()]);
  };

  // 📊 Métricas principales
  const metricsCards = useMemo(() => {
    if (!dm) return [];
    
    return [
      {
        title: 'Leads totales',
        value: dm.leadsTotal.toLocaleString('es-MX'),
        hint: `${dm.leadsConvertidos} convertidos (${dm.tasaConversion}%)`,
      },
      {
        title: 'Pacientes activos',
        value: dm.pacientesActivos.toLocaleString('es-MX'),
        hint: `Total: ${dm.totalPacientes.toLocaleString('es-MX')} pacientes`,
      },
      {
        title: 'Consultas futuras',
        value: dm.consultasFuturas.toLocaleString('es-MX'),
        hint: `Polanco ${dm.polancoFuturas} · Satélite ${dm.sateliteFuturas}`,
      },
      {
        title: 'Pendientes confirmación',
        value: dm.pendientesConfirmacion.toLocaleString('es-MX'),
        hint: `Consultas de hoy: ${dm.consultasHoy}`,
      },
      {
        title: 'Tasa de conversión',
        value: `${dm.tasaConversion}%`,
        hint: `Meta: 35% · ${dm.leadsConvertidos} leads convertidos`,
      },
      {
        title: 'Leads este mes',
        value: dm.leadsMes.toLocaleString('es-MX'),
        hint: 'Contactos adquiridos en el mes actual',
      },
    ];
  }, [dm]);

  // 📈 Calcular tendencia real de leads por mes (últimos 6 meses)
  const leadTrend = useMemo(() => {
    if (loadingLeads || leads.length === 0) {
      return [{ label: 'Cargando...', value: 0 }];
    }

    const today = new Date();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const result: { label: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const monthLabel = months[monthIndex];

      const count = leads.filter((lead) => {
        const leadDate = new Date(lead.primerContacto);
        return leadDate.getMonth() === monthIndex && leadDate.getFullYear() === year;
      }).length;

      result.push({ label: monthLabel, value: count });
    }

    return result;
  }, [leads, loadingLeads]);

  // 🏢 Distribución por sede
  const sedeDistribution = useMemo(() => {
    if (!dm) return [];

    return [
      {
        label: 'Polanco',
        value: dm.polancoFuturas,
        hint: 'Consultas futuras',
      },
      {
        label: 'Satélite',
        value: dm.sateliteFuturas,
        hint: 'Consultas futuras',
      },
    ];
  }, [dm]);

  // ✅ Estado de confirmaciones
  const confirmStatus = useMemo(() => {
    if (loadingConsultas) {
      return [
        { label: 'Confirmadas', value: 0, hint: 'Cargando...' },
        { label: 'Pendientes', value: 0, hint: 'Cargando...' },
        { label: 'Reagendadas', value: 0, hint: 'Cargando...' },
        { label: 'Canceladas', value: 0 },
      ];
    }

    const confirmadas = consultas.filter((c) => c.estado === 'Confirmada').length;
    const pendientes = consultas.filter((c) => c.estado === 'Programada' && !c.confirmadoPaciente).length;
    const reagendadas = consultas.filter((c) => c.estado === 'Reagendada').length;
    const canceladas = consultas.filter((c) => c.estado === 'Cancelada').length;

    return [
      {
        label: 'Confirmadas',
        value: confirmadas,
        hint: 'Citas confirmadas por paciente',
      },
      {
        label: 'Pendientes',
        value: pendientes,
        hint: 'Esperan confirmación',
      },
      {
        label: 'Reagendadas',
        value: reagendadas,
        hint: 'Reprogramadas',
      },
      {
        label: 'Canceladas',
        value: canceladas,
      },
    ];
  }, [consultas, loadingConsultas]);

  // Calcular estadísticas basadas en el periodo seleccionado
  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (periodo) {
      case 'mes_actual':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'ultimos_3_meses':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'ultimos_6_meses':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'todo':
        startDate = new Date(2000, 0, 1); // Fecha muy antigua para incluir todo
        break;
    }

    // Filtrar consultas del periodo
    const consultasPeriodo = consultas.filter(c => {
      const fecha = new Date(c.fecha);
      return fecha >= startDate;
    });

    // Filtrar leads del periodo
    const leadsPeriodo = leads.filter(l => {
      const fecha = new Date(l.primerContacto);
      return fecha >= startDate;
    });

    // Consultas por estado
    const programadas = consultasPeriodo.filter(c => c.estado === 'Programada').length;
    const confirmadas = consultasPeriodo.filter(c => c.estado === 'Confirmada').length;
    const completadas = consultasPeriodo.filter(c => c.estado === 'Completada').length;
    const canceladas = consultasPeriodo.filter(c => c.estado === 'Cancelada').length;
    const reagendadas = consultasPeriodo.filter(c => c.estado === 'Reagendada').length;

    // Canales de reserva (basado en fuente de leads)
    const webLeads = leadsPeriodo.filter(l => l.fuente === 'Web' || l.fuente === 'Formulario web').length;
    const telefonoLeads = leadsPeriodo.filter(l => l.fuente === 'Llamada').length;
    const whatsappLeads = leadsPeriodo.filter(l => l.fuente === 'WhatsApp').length;
    const otrosLeads = leadsPeriodo.length - webLeads - telefonoLeads - whatsappLeads;

    // Tasa de conversión del periodo
    const convertidosPeriodo = leadsPeriodo.filter(l => l.estado === 'Convertido').length;
    const tasaConversion = leadsPeriodo.length > 0 ? Math.round((convertidosPeriodo / leadsPeriodo.length) * 100) : 0;

    return {
      totalCitas: consultasPeriodo.length,
      totalLeads: leadsPeriodo.length,
      programadas,
      confirmadas,
      completadas,
      canceladas,
      reagendadas,
      webLeads,
      telefonoLeads,
      whatsappLeads,
      otrosLeads,
      convertidosPeriodo,
      tasaConversion,
      pendientesConfirmacion: consultasPeriodo.filter(c => !c.confirmadoPaciente && c.estado === 'Programada').length,
    };
  }, [consultas, leads, periodo]);

  // Datos para gráfico de citas por estado
  const citasEstadoData = useMemo(() => [
    { label: 'Programadas', value: stats.programadas, color: '#3b82f6' },
    { label: 'Confirmadas', value: stats.confirmadas, color: '#10b981' },
    { label: 'Completadas', value: stats.completadas, color: '#64748b' },
    { label: 'Reagendadas', value: stats.reagendadas, color: '#f59e0b' },
    { label: 'Canceladas', value: stats.canceladas, color: '#ef4444' },
  ], [stats]);

  // Datos para gráfico de canales de reserva
  const canalesData = useMemo(() => [
    { label: 'Web', value: stats.webLeads, color: '#3b82f6' },
    { label: 'Teléfono', value: stats.telefonoLeads, color: '#10b981' },
    { label: 'WhatsApp', value: stats.whatsappLeads, color: '#22c55e' },
    { label: 'Otros', value: stats.otrosLeads, color: '#64748b' },
  ], [stats]);

  return (
    <PageShell
      accent
      eyebrow="Inteligencia Operativa"
      title="Estadísticas y Métricas"
      description="Análisis completo del consultorio con datos en tiempo real desde Supabase"
      headerSlot={
        <button
          onClick={handleRefresh}
          disabled={loadingMetrics || loadingLeads || loadingConsultas}
          className="group flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 px-4 py-3 sm:px-5 sm:py-2.5 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0"
        >
          <span className="transition-transform group-hover:rotate-180 duration-500">
            {(loadingMetrics || loadingLeads || loadingConsultas) ? '⟳' : '↻'}
          </span>
          <span>{(loadingMetrics || loadingLeads || loadingConsultas) ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Métricas principales - Responsive optimizado */}
        {loadingMetrics ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-slate-800/30" />
            ))}
          </div>
        ) : (
          <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
            {metricsCards.map((metric) => (
              <StatCard key={metric.title} title={metric.title} value={metric.value} hint={metric.hint} />
            ))}
          </section>
        )}

        {/* Selector de periodo - Responsive optimizado */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-700">
          <span className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-2 flex-shrink-0">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Filtrar por periodo:</span>
            <span className="sm:hidden">Periodo:</span>
          </span>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {[
              { value: 'mes_actual', label: 'Mes actual' },
              { value: 'ultimos_3_meses', label: '3 meses' },
              { value: 'ultimos_6_meses', label: '6 meses' },
              { value: 'todo', label: 'Todo' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value as Periodo)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  periodo === p.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sección: Tendencias de Crecimiento */}
        <section>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            <span>Tendencias de Crecimiento</span>
          </h2>
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
            <GrowthChart 
              title="Evolución de Leads (últimos 6 meses)" 
              data={leadTrend} 
            />
            <ComparisonBars 
              title="Consultas Futuras por Sede" 
              items={sedeDistribution} 
            />
          </div>
        </section>

        {/* Sección: Análisis de Citas */}
        <section>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
            <span className="truncate">
              Análisis de Citas
              <span className="hidden sm:inline"> ({periodo === 'mes_actual' ? 'Mes Actual' : periodo === 'ultimos_3_meses' ? 'Últimos 3 Meses' : periodo === 'ultimos_6_meses' ? 'Últimos 6 Meses' : 'Todo el Tiempo'})</span>
            </span>
          </h2>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            {/* Total de citas */}
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white">Total de Citas</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Todas las citas del periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-blue-400">{stats.totalCitas}</div>
                <div className="mt-2 text-xs sm:text-sm text-slate-400">
                  {stats.confirmadas} confirmadas • {stats.pendientesConfirmacion} pendientes
                </div>
              </CardContent>
            </Card>

            {/* Tasa de conversión del periodo */}
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white">Tasa de Conversión</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Leads → Pacientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400">{stats.tasaConversion}%</div>
                <div className="mt-2 text-xs sm:text-sm text-slate-400">
                  {stats.convertidosPeriodo} de {stats.totalLeads} leads convertidos
                </div>
              </CardContent>
            </Card>

            {/* Completadas */}
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white">Citas Completadas</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Consultas finalizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-slate-300">{stats.completadas}</div>
                <div className="mt-2 text-xs sm:text-sm text-slate-400">
                  Servicios médicos prestados
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de distribución de citas */}
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Distribución de Citas por Estado</CardTitle>
              <CardDescription className="text-slate-400">Análisis del flujo completo</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalCitas === 0 ? (
                <p className="text-center text-slate-400 py-12">No hay citas en este periodo</p>
              ) : (
                <BarChart data={citasEstadoData} height={220} />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Sección: Canales de Adquisición */}
        <section>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            <span className="truncate">Canales de Adquisición</span>
          </h2>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white">Distribución por Canal</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Origen de los contactos</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.totalLeads === 0 ? (
                  <p className="text-center text-slate-400 py-12 text-sm">No hay leads en este periodo</p>
                ) : (
                  <div className="flex justify-center py-2">
                    <DonutChart
                      data={canalesData}
                      size={180}
                      thickness={30}
                      centerText={stats.totalLeads.toString()}
                      centerSubtext="Leads"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white">Detalle de Canales</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Cantidad y porcentaje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {canalesData.map((canal) => (
                    <div key={canal.label} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-900/50">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: canal.color }} />
                        <span className="text-xs sm:text-sm font-medium text-slate-300">{canal.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-bold text-white">{canal.value}</span>
                        <span className="text-[10px] sm:text-xs text-slate-400 ml-1 sm:ml-2">
                          ({stats.totalLeads > 0 ? Math.round((canal.value / stats.totalLeads) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sección: Confirmaciones */}
        <section>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            <span>Estado de Confirmaciones</span>
          </h2>
          <ComparisonBars 
            title="Estatus de todas las citas" 
            items={confirmStatus} 
          />
        </section>

        {/* Información del sistema */}
        <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-600/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <span>Integración CRM-UROBOT</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-900/30">
                <span className="text-emerald-400 text-sm sm:text-base">●</span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white">Datos en tiempo real</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Sincronización con Supabase via SWR</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-900/30">
                <span className="text-emerald-400 text-sm sm:text-base">●</span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white">Workflows n8n activos</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Automatización de procesos</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-900/30">
                <span className="text-blue-400 text-sm sm:text-base">ⓘ</span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white">Filtrado por periodo</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Análisis histórico personalizable</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-900/30">
                <span className="text-purple-400 text-sm sm:text-base">✓</span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white">Caché inteligente</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">RPC → Vista → Cálculo manual</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
