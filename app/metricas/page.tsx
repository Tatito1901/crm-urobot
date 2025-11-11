'use client';

/**
 * ============================================================
 * METRICAS PAGE - Vista de métricas avanzadas (OPTIMIZADA)
 * ============================================================
 * ✨ Gráficos lazy-loaded para mejor rendimiento inicial
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageShell } from '@/app/components/crm/page-shell';
import { StatCard } from '@/app/components/crm/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';

// ✅ OPTIMIZACIÓN: Lazy load de gráficos para reducir bundle inicial
const GrowthChart = dynamic(
  () => import('@/app/components/analytics/GrowthChart').then(mod => ({ default: mod.GrowthChart })),
  {
    loading: () => <div className="h-[300px] animate-pulse bg-white/5 rounded-xl" />,
    ssr: false,
  }
);

const ComparisonBars = dynamic(
  () => import('@/app/components/analytics/ComparisonBars').then(mod => ({ default: mod.ComparisonBars })),
  {
    loading: () => <div className="h-[200px] animate-pulse bg-white/5 rounded-xl" />,
    ssr: false,
  }
);

export default function MetricasPage() {
  // ✅ Datos reales de Supabase
  const { metrics: dm, loading: loadingMetrics, refetch: refetchMetrics } = useDashboardMetrics();
  const { leads, loading: loadingLeads, refetch: refetchLeads } = useLeads();
  const { consultas, loading: loadingConsultas, refetch: refetchConsultas } = useConsultas();

  const handleRefresh = async () => {
    await Promise.all([refetchMetrics(), refetchLeads(), refetchConsultas()]);
  };

  // 📊 Calcular métricas principales con datos reales
  const metrics = useMemo(() => {
    if (!dm) return [];
    
    return [
      {
        title: 'Leads totales',
        value: dm.leadsTotal.toLocaleString('es-MX'),
        hint: `Convertidos ${dm.leadsConvertidos.toLocaleString('es-MX')}`,
      },
      {
        title: 'Leads este mes',
        value: dm.leadsMes.toLocaleString('es-MX'),
        hint: 'Actualizado desde Supabase',
      },
      {
        title: 'Tasa de conversión',
        value: `${dm.tasaConversion}%`,
        hint: `Meta mensual 35% · ${dm.leadsConvertidos} convertidos`,
      },
      {
        title: 'Pacientes activos',
        value: dm.pacientesActivos.toLocaleString('es-MX'),
        hint: `Total pacientes ${dm.totalPacientes.toLocaleString('es-MX')}`,
      },
      {
        title: 'Consultas futuras',
        value: dm.consultasFuturas.toLocaleString('es-MX'),
        hint: `Polanco ${dm.polancoFuturas} · Satélite ${dm.sateliteFuturas}`,
      },
      {
        title: 'Pendientes confirmación',
        value: dm.pendientesConfirmacion.toLocaleString('es-MX'),
        hint: `Consultas de hoy ${dm.consultasHoy}`,
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

    // Últimos 6 meses
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

  // 🏢 Distribución por sede (datos reales)
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

  // ✅ Estado de confirmaciones (calculado con datos reales)
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

  return (
    <PageShell
      accent
      eyebrow="Inteligencia Operativa"
      title="Métricas clave"
      description="Indicadores de rendimiento desde Supabase."
      headerSlot={
        <button
          onClick={handleRefresh}
          disabled={loadingMetrics || loadingLeads || loadingConsultas}
          className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {(loadingMetrics || loadingLeads || loadingConsultas) ? 'Actualizando...' : '↻ Actualizar datos'}
        </button>
      }
    >
      {/* Métricas principales */}
      {loadingMetrics ? (
        <div className="text-center text-white/60 py-10">Cargando métricas desde Supabase...</div>
      ) : (
        <section className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <StatCard key={metric.title} title={metric.title} value={metric.value} hint={metric.hint} />
          ))}
        </section>
      )}

      {/* Gráficas de tendencias */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <GrowthChart 
          title="Crecimiento de leads (últimos 6 meses)" 
          data={leadTrend} 
        />
        <ComparisonBars 
          title="Consultas futuras por sede" 
          items={sedeDistribution} 
        />
      </section>

      {/* Análisis de confirmaciones y próximos pasos */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <ComparisonBars 
          title="Estatus de confirmaciones" 
          items={confirmStatus} 
        />
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Datos en tiempo real</CardTitle>
            <CardDescription>Conexión activa con Supabase</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 text-sm text-white/70">
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-2">
                <span className="text-green-400">●</span>
                <span>Datos cargados desde Supabase con SWR caché</span>
              </li>
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-2">
                <span className="text-green-400">●</span>
                <span>Actualización manual con botón de refresh</span>
              </li>
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-2">
                <span className="text-blue-400">ⓘ</span>
                <span>Usa RPC → Vista → Cálculo manual (fallback en cascada)</span>
              </li>
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-2">
                <span className="text-purple-400">✓</span>
                <span>Integración completa con n8n workflows</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
