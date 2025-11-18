'use client';

/**
 * ============================================================
 * ESTADÍSTICAS UNIFICADAS - Análisis completo del CRM
 * ============================================================
 * Dashboard interactivo con sidebar de navegación
 * Adaptado a flujos de UROBOT y datos disponibles en Supabase
 */

import { useState, useMemo, memo, use } from 'react';
import dynamicImport from 'next/dynamic';
import { PageShell } from '@/app/components/crm/page-shell';
import { StatCard } from '@/app/components/crm/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';
import { typography, spacing, cards, layouts } from '@/app/lib/design-system';
import {
  Calendar,
  Clock,
  TrendingUp,
  Globe,
  CheckCircle,
  BarChart3,
  MessageSquare,
  Users,
  Target,
  Activity,
  ChevronRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Secciones de estadísticas
type SeccionId = 'resumen' | 'funnel' | 'mensajeria' | 'canales' | 'consultas' | 'leads' | 'operativo';

interface Seccion {
  id: SeccionId;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const SECCIONES: Seccion[] = [
  {
    id: 'resumen',
    label: 'Resumen General',
    icon: BarChart3,
    description: 'Vista global de todas las métricas',
    color: 'blue'
  },
  {
    id: 'funnel',
    label: 'Funnel de Conversión',
    icon: TrendingUp,
    description: 'Lead → Paciente → Consulta',
    color: 'emerald'
  },
  {
    id: 'mensajeria',
    label: 'Análisis de Mensajería',
    icon: MessageSquare,
    description: 'Engagement y conversaciones',
    color: 'purple'
  },
  {
    id: 'canales',
    label: 'Canales Marketing',
    icon: Target,
    description: 'ROI por canal',
    color: 'amber'
  },
  {
    id: 'consultas',
    label: 'Performance Consultas',
    icon: Calendar,
    description: 'Agendamiento',
    color: 'cyan'
  },
  {
    id: 'leads',
    label: 'Análisis de Leads',
    icon: Users,
    description: 'Temperatura',
    color: 'pink'
  },
  {
    id: 'operativo',
    label: 'Operativo Real-time',
    icon: Activity,
    description: 'En tiempo real',
    color: 'red'
  },
];

// Componente de botón de sección memoizado
const SeccionButton = memo(({ 
  seccion, 
  isActive, 
  onClick 
}: { 
  seccion: Seccion; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  const colorClasses = {
    blue: isActive ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'hover:bg-blue-500/10 hover:border-blue-500/20',
    emerald: isActive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'hover:bg-emerald-500/10 hover:border-emerald-500/20',
    purple: isActive ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'hover:bg-purple-500/10 hover:border-purple-500/20',
    amber: isActive ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'hover:bg-amber-500/10 hover:border-amber-500/20',
    cyan: isActive ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'hover:bg-cyan-500/10 hover:border-cyan-500/20',
    pink: isActive ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' : 'hover:bg-pink-500/10 hover:border-pink-500/20',
    red: isActive ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'hover:bg-red-500/10 hover:border-red-500/20',
  };

  const Icon = seccion.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg border transition-all ${
        isActive 
          ? `${colorClasses[seccion.color as keyof typeof colorClasses]} shadow-lg scale-[1.02]` 
          : `border-white/10 text-white/60 ${colorClasses[seccion.color as keyof typeof colorClasses]}`
      }`}
    >
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isActive ? '' : 'text-white/40'}`} />
      <div className="flex-1 text-left min-w-0">
        <p className={`text-xs sm:text-sm font-medium truncate ${isActive ? '' : 'text-white/70'}`}>
          {seccion.label}
        </p>
        <p className="text-[10px] sm:text-xs text-white/40 truncate hidden sm:block">
          {seccion.description}
        </p>
      </div>
      <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform ${isActive ? 'rotate-90' : ''}`} />
    </button>
  );
});

SeccionButton.displayName = 'SeccionButton';

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

export default function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string }>;
}) {
  // Next.js 15: unwrap searchParams con React.use()
  const params = use(searchParams);
  const seccionActiva = (params.seccion as SeccionId) || 'resumen';
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

  // 📱 NUEVAS MÉTRICAS: Análisis de Mensajería
  const mensajeriaStats = useMemo(() => {
    const leadsPeriodo = leads.filter(l => {
      const now = new Date();
      const startDate = periodo === 'mes_actual' ? new Date(now.getFullYear(), now.getMonth(), 1) :
                       periodo === 'ultimos_3_meses' ? new Date(now.getFullYear(), now.getMonth() - 3, 1) :
                       periodo === 'ultimos_6_meses' ? new Date(now.getFullYear(), now.getMonth() - 6, 1) :
                       new Date(2000, 0, 1);
      const fecha = new Date(l.primerContacto);
      return fecha >= startDate;
    });

    // Personas únicas que enviaron mensaje
    const personasConMensajes = leadsPeriodo.filter(l => 
      (l.totalMensajesRecibidos && l.totalMensajesRecibidos > 0) ||
      (l.totalInteracciones && l.totalInteracciones > 0)
    ).length;

    // Total de mensajes enviados y recibidos
    const totalMensajesEnviados = leadsPeriodo.reduce((sum, l) => sum + (l.totalMensajesEnviados || 0), 0);
    const totalMensajesRecibidos = leadsPeriodo.reduce((sum, l) => sum + (l.totalMensajesRecibidos || 0), 0);
    const totalInteracciones = leadsPeriodo.reduce((sum, l) => sum + (l.totalInteracciones || 0), 0);

    // Promedio de mensajes por persona
    const promedioMensajes = personasConMensajes > 0 
      ? Math.round((totalMensajesEnviados + totalMensajesRecibidos) / personasConMensajes) 
      : 0;

    // Tasa de respuesta
    const tasaRespuesta = totalMensajesRecibidos > 0 
      ? Math.round((totalMensajesEnviados / totalMensajesRecibidos) * 100) 
      : 0;

    return {
      personasConMensajes,
      totalMensajesEnviados,
      totalMensajesRecibidos,
      totalInteracciones,
      promedioMensajes,
      tasaRespuesta,
    };
  }, [leads, periodo]);

  // 📊 Análisis por Canal de Marketing
  const canalMarketingStats = useMemo(() => {
    const leadsPeriodo = leads.filter(l => {
      const now = new Date();
      const startDate = periodo === 'mes_actual' ? new Date(now.getFullYear(), now.getMonth(), 1) :
                       periodo === 'ultimos_3_meses' ? new Date(now.getFullYear(), now.getMonth() - 3, 1) :
                       periodo === 'ultimos_6_meses' ? new Date(now.getFullYear(), now.getMonth() - 6, 1) :
                       new Date(2000, 0, 1);
      const fecha = new Date(l.primerContacto);
      return fecha >= startDate;
    });

    // Agrupar por canal de marketing
    const canales: Record<string, number> = {};
    leadsPeriodo.forEach(l => {
      const canal = l.canalMarketing || 'Otro';
      canales[canal] = (canales[canal] || 0) + 1;
    });

    // Convertir a array ordenado
    return Object.entries(canales)
      .map(([canal, cantidad]) => ({ canal, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [leads, periodo]);

  // 🏥 Consultas agendadas por canal
  const consultasPorCanal = useMemo(() => {
    const consultasPeriodo = consultas.filter(c => {
      const now = new Date();
      const startDate = periodo === 'mes_actual' ? new Date(now.getFullYear(), now.getMonth(), 1) :
                       periodo === 'ultimos_3_meses' ? new Date(now.getFullYear(), now.getMonth() - 3, 1) :
                       periodo === 'ultimos_6_meses' ? new Date(now.getFullYear(), now.getMonth() - 6, 1) :
                       new Date(2000, 0, 1);
      const fecha = new Date(c.fecha);
      return fecha >= startDate;
    });

    // Agrupar por canal de origen
    const canales: Record<string, number> = {};
    consultasPeriodo.forEach(c => {
      const canal = c.canalOrigen || 'WhatsApp';
      canales[canal] = (canales[canal] || 0) + 1;
    });

    return Object.entries(canales)
      .map(([canal, cantidad]) => ({ label: canal, value: cantidad }))
      .sort((a, b) => b.value - a.value);
  }, [consultas, periodo]);

  // 🌡️ Distribución por temperatura de leads
  const temperaturaStats = useMemo(() => {
    const leadsPeriodo = leads.filter(l => {
      const now = new Date();
      const startDate = periodo === 'mes_actual' ? new Date(now.getFullYear(), now.getMonth(), 1) :
                       periodo === 'ultimos_3_meses' ? new Date(now.getFullYear(), now.getMonth() - 3, 1) :
                       periodo === 'ultimos_6_meses' ? new Date(now.getFullYear(), now.getMonth() - 6, 1) :
                       new Date(2000, 0, 1);
      const fecha = new Date(l.primerContacto);
      return fecha >= startDate;
    });

    const calientes = leadsPeriodo.filter(l => l.temperatura === 'Caliente').length;
    const tibios = leadsPeriodo.filter(l => l.temperatura === 'Tibio').length;
    const frios = leadsPeriodo.filter(l => l.temperatura === 'Frio').length;

    return [
      { label: 'Calientes', value: calientes, color: '#ef4444' },
      { label: 'Tibios', value: tibios, color: '#f59e0b' },
      { label: 'Fríos', value: frios, color: '#3b82f6' },
    ];
  }, [leads, periodo]);

  // Determinar título según sección
  const seccionInfo = SECCIONES.find(s => s.id === seccionActiva);
  const tituloSeccion = seccionInfo?.label || 'Estadísticas y Métricas';

  return (
    <PageShell
      accent
      eyebrow="Inteligencia Operativa"
      title={tituloSeccion}
      description="Análisis completo del consultorio con datos en tiempo real desde Supabase"
      headerSlot={
        <button
          onClick={handleRefresh}
          disabled={loadingMetrics || loadingLeads || loadingConsultas}
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-500/20 px-4 py-3 sm:px-5 sm:py-2.5 text-sm font-medium text-blue-200 backdrop-blur-sm border border-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 hover:border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 sm:hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 min-h-[44px] sm:min-h-0 touch-target"
        >
          <span className="transition-transform group-hover:rotate-180 duration-500">
            {(loadingMetrics || loadingLeads || loadingConsultas) ? '⟳' : '↻'}
          </span>
          <span>{(loadingMetrics || loadingLeads || loadingConsultas) ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      }
    >
      {/* Contenido sin sidebar duplicada - ya está en la Sidebar principal */}
      <div className="space-y-6">
        {/* Métricas principales - Solo mostrar en resumen o cuando corresponda */}
        {(seccionActiva === 'resumen' || seccionActiva === 'operativo') && (
          <>
        {loadingMetrics ? (
          <div className={layouts.gridCols4}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 sm:h-36 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <section className={layouts.gridCols4}>
            {metricsCards.map((metric) => (
              <StatCard key={metric.title} title={metric.title} value={metric.value} hint={metric.hint} />
            ))}
          </section>
        )}
        </>
        )}

        {/* Selector de periodo - Unificado */}
        <Card className={cards.base}>
          <CardContent className="py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className={`${typography.label} flex items-center gap-2 flex-shrink-0`}>
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                <span>Periodo:</span>
              </span>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
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
          </CardContent>
        </Card>

        {/* Sección: Tendencias de Crecimiento */}
        {(seccionActiva === 'resumen' || seccionActiva === 'funnel') && (
        <section className={spacing.spaceLg}>
          <h2 className={`${typography.sectionTitle} mb-4 sm:mb-6 flex items-center gap-3`}>
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            <span>Tendencias de Crecimiento</span>
          </h2>
          <div className={layouts.gridCols2}>
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
        )}

        {/* Sección: Análisis de Citas */}
        {(seccionActiva === 'resumen' || seccionActiva === 'consultas') && (
        <section className={spacing.spaceLg}>
          <h2 className={`${typography.sectionTitle} mb-4 sm:mb-6 flex items-center gap-3`}>
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0" />
            <span className="truncate">
              Análisis de Citas
              <span className="hidden sm:inline text-lg text-slate-400"> ({periodo === 'mes_actual' ? 'Mes Actual' : periodo === 'ultimos_3_meses' ? 'Últimos 3 Meses' : periodo === 'ultimos_6_meses' ? 'Últimos 6 Meses' : 'Todo el Tiempo'})</span>
            </span>
          </h2>

          <div className={`${layouts.gridCols3} mb-5 sm:mb-6`}>
            {/* Total de citas */}
            <Card className={cards.base}>
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
            <Card className={cards.base}>
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
            <Card className={cards.base}>
              <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${spacing.cardHeader}`}>
                <CardTitle className={typography.cardTitle}>Canceladas</CardTitle>
                <span className="text-2xl sm:text-3xl">⊗</span>
              </CardHeader>
              <CardContent>
                <div className={`${typography.metricLarge} text-red-400`}>{stats.canceladas}</div>
                <p className={`${typography.metadata} mt-2`}>
                  {stats.totalCitas > 0 ? ((stats.canceladas / stats.totalCitas) * 100).toFixed(1) : 0}% del total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de distribución de citas */}
          <Card className={cards.base}>
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
        )}

        {/* NUEVA SECCIÓN: Análisis de Mensajería */}
        {(seccionActiva === 'resumen' || seccionActiva === 'mensajeria') && (
        <section className={spacing.spaceLg}>
          <h2 className={`${typography.sectionTitle} mb-4 sm:mb-6 flex items-center gap-3`}>
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            <span>Análisis de Mensajería</span>
          </h2>

          <div className={layouts.gridCols4}>
            {/* Personas que enviaron mensajes */}
            <Card className={cards.base}>
              <CardHeader className={spacing.cardHeader}>
                <CardTitle className={typography.cardTitle}>
                  <Users className="h-5 w-5 inline mr-2 text-blue-400" />
                  Personas Activas
                </CardTitle>
                <CardDescription className={typography.cardDescription}>Enviaron mensajes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`${typography.metricLarge} text-blue-400`}>{mensajeriaStats.personasConMensajes}</div>
                <div className={`${typography.metadata} mt-3`}>
                  {mensajeriaStats.totalInteracciones} interacciones totales
                </div>
              </CardContent>
            </Card>

            {/* Total de mensajes */}
            <Card className={cards.base}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="text-lg">📨</span>
                  <span>Mensajes</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Enviados y recibidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400">
                  {(mensajeriaStats.totalMensajesEnviados + mensajeriaStats.totalMensajesRecibidos).toLocaleString()}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-slate-400">
                  📤 {mensajeriaStats.totalMensajesEnviados} enviados • 📥 {mensajeriaStats.totalMensajesRecibidos} recibidos
                </div>
              </CardContent>
            </Card>

            {/* Promedio por persona */}
            <Card className={cards.base}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>Promedio</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Mensajes por persona</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-purple-400">{mensajeriaStats.promedioMensajes}</div>
                <div className="mt-2 text-xs sm:text-sm text-slate-400">
                  Engagement promedio
                </div>
              </CardContent>
            </Card>

            {/* Tasa de respuesta */}
            <Card className={cards.base}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span>Tasa de Respuesta</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-400">Respuestas vs recibidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-amber-400">{mensajeriaStats.tasaRespuesta}%</div>
                <div className="mt-2 text-xs sm:text-sm text-slate-400">
                  Velocidad de atención
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        )}

        {/* NUEVA SECCIÓN: Canales de Marketing */}
        {(seccionActiva === 'resumen' || seccionActiva === 'canales' || seccionActiva === 'leads') && (
        <section className={spacing.spaceLg}>
          <h2 className={`${typography.sectionTitle} mb-4 sm:mb-6 flex items-center gap-3`}>
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            <span>Canales de Marketing</span>
          </h2>

          <div className={layouts.gridCols2}>
            {/* Lista de canales */}
            <Card className={cards.base}>
              <CardHeader className={spacing.cardHeader}>
                <CardTitle className={typography.cardTitle}>De dónde vienen los leads</CardTitle>
                <CardDescription className={typography.cardDescription}>Por canal de marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {canalMarketingStats.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">No hay datos en este periodo</p>
                  ) : (
                    canalMarketingStats.map((item, index) => (
                      <div key={item.canal} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-900/50 border border-white/5">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-lg">{
                            index === 0 ? '🥇' :
                            index === 1 ? '🥈' :
                            index === 2 ? '🥉' : '📍'
                          }</span>
                          <span className="text-xs sm:text-sm font-medium text-slate-300">{item.canal}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-bold text-white">{item.cantidad}</span>
                          <span className="text-[10px] sm:text-xs text-slate-400 ml-1 sm:ml-2">leads</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Temperatura de leads */}
            <Card className={cards.base}>
              <CardHeader className={spacing.cardHeader}>
                <CardTitle className={typography.cardTitle}>Temperatura de Leads</CardTitle>
                <CardDescription className={typography.cardDescription}>Clasificación por interés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {temperaturaStats.map((temp) => {
                    const total = temperaturaStats.reduce((sum, t) => sum + t.value, 0);
                    const porcentaje = total > 0 ? Math.round((temp.value / total) * 100) : 0;
                    return (
                      <div key={temp.label} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-slate-300">{temp.label}</span>
                          <span className="text-sm sm:text-base font-bold text-white">{temp.value}</span>
                        </div>
                        <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${porcentaje}%`,
                              backgroundColor: temp.color
                            }}
                          />
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-400">{porcentaje}% del total</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        )}

        {/* NUEVA SECCIÓN: Consultas Agendadas por Canal */}
        {(seccionActiva === 'resumen' || seccionActiva === 'consultas' || seccionActiva === 'canales') && (
        <section>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📅</span>
            <span>Agendamiento por Canal</span>
          </h2>

          <Card className={cards.base}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base text-white">De dónde se agendaron las consultas</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-400">Canal de origen de cada cita</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {consultasPorCanal.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm col-span-full">No hay consultas en este periodo</p>
                ) : (
                  consultasPorCanal.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/5">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400 mb-1">{item.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{item.value}</p>
                      </div>
                      <span className="text-3xl sm:text-4xl">
                        {item.label.includes('WhatsApp') ? '📱' :
                         item.label.includes('Web') ? '🌐' :
                         item.label.includes('Teléfono') ? '📞' : '📋'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
        )}

        {/* Sección: Canales de Adquisición (Original) */}
        {(seccionActiva === 'resumen' || seccionActiva === 'canales') && (
        <section>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            <span className="truncate">Canales de Adquisición (Resumen)</span>
          </h2>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className={cards.base}>
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

            <Card className={cards.base}>
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
        )}

        {/* Sección: Confirmaciones */}
        {(seccionActiva === 'resumen' || seccionActiva === 'operativo') && (
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
        )}

        {/* Información del sistema */}
        {seccionActiva === 'resumen' && (
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
        )}
      </div>
    </PageShell>
  );
}
