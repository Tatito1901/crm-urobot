'use client';

/**
 * ============================================================
 * ESTADÍSTICAS MODERNIZADAS - Dashboard Inteligente
 * ============================================================
 * Interfaz limpia, organizada y responsiva
 */

import { useState, useMemo, memo } from 'react';
import dynamicImport from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';
import {
  TrendingUp,
  Calendar,
  Users,
  Target,
  MessageSquare,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Lazy load de gráficos
const DonutChart = dynamicImport(() => import('@/app/components/analytics/DonutChart').then(mod => ({ default: mod.DonutChart })), {
  loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-xl" />,
  ssr: false,
});

const GrowthChart = dynamicImport(() => import('@/app/components/analytics/GrowthChart').then(mod => ({ default: mod.GrowthChart })), {
  loading: () => <div className="h-72 animate-pulse bg-white/5 rounded-xl" />,
  ssr: false,
});

type Tab = 'general' | 'conversion' | 'canales' | 'mensajeria' | 'operativo';
type Periodo = 'mes' | '3m' | '6m' | 'todo';

// ✅ KPI Card optimizada
const KPICard = memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: React.ElementType; 
  trend?: { value: number; isPositive: boolean };
}) => (
  <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
      <Icon className="h-4 w-4 text-blue-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">{subtitle}</p>
        {trend && (
          <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </CardContent>
  </Card>
));

KPICard.displayName = 'KPICard';

// ✅ Stat Card compacta
const StatCard = memo(({ label, value, icon }: { label: string; value: number; icon: string }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
    <div>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
    <span className="text-3xl">{icon}</span>
  </div>
));

StatCard.displayName = 'StatCard';

export default function EstadisticasPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  
  const { metrics: dm, loading: loadingMetrics, refetch: refetchMetrics } = useDashboardMetrics();
  const { leads, loading: loadingLeads, refetch: refetchLeads } = useLeads();
  const { consultas, loading: loadingConsultas, refetch: refetchConsultas } = useConsultas();

  const isLoading = loadingMetrics || loadingLeads || loadingConsultas;

  const handleRefresh = async () => {
    await Promise.all([refetchMetrics(), refetchLeads(), refetchConsultas()]);
  };

  // Calcular stats por periodo
  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (periodo) {
      case 'mes':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'todo':
        startDate = new Date(2000, 0, 1);
        break;
    }

    const consultasPeriodo = consultas.filter(c => new Date(c.fecha) >= startDate);
    const leadsPeriodo = leads.filter(l => new Date(l.primerContacto) >= startDate);

    return {
      totalConsultas: consultasPeriodo.length,
      totalLeads: leadsPeriodo.length,
      confirmadas: consultasPeriodo.filter(c => c.estado === 'Confirmada').length,
      canceladas: consultasPeriodo.filter(c => c.estado === 'Cancelada').length,
      completadas: consultasPeriodo.filter(c => c.estado === 'Completada').length,
      convertidos: leadsPeriodo.filter(l => l.estado === 'Convertido').length,
      tasaConversion: leadsPeriodo.length > 0 
        ? Math.round((leadsPeriodo.filter(l => l.estado === 'Convertido').length / leadsPeriodo.length) * 100) 
        : 0,
    };
  }, [consultas, leads, periodo]);

  // Tendencia de leads (últimos 6 meses)
  const leadTrend = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const today = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();

      const count = leads.filter(lead => {
        const leadDate = new Date(lead.primerContacto);
        return leadDate.getMonth() === monthIndex && leadDate.getFullYear() === year;
      }).length;

      result.push({ label: months[monthIndex], value: count });
    }

    return result;
  }, [leads]);

  // Distribución de consultas por estado
  const consultasEstado = useMemo(() => [
    { label: 'Confirmadas', value: stats.confirmadas, color: '#10b981' },
    { label: 'Completadas', value: stats.completadas, color: '#3b82f6' },
    { label: 'Canceladas', value: stats.canceladas, color: '#ef4444' },
  ], [stats]);

  // Tabs configuración
  const tabs = [
    { id: 'general' as Tab, label: 'General', icon: BarChart3 },
    { id: 'conversion' as Tab, label: 'Conversión', icon: TrendingUp },
    { id: 'canales' as Tab, label: 'Canales', icon: Target },
    { id: 'mensajeria' as Tab, label: 'Mensajería', icon: MessageSquare },
    { id: 'operativo' as Tab, label: 'Operativo', icon: Activity },
  ];

  const periodos = [
    { id: 'mes' as Periodo, label: 'Mes' },
    { id: '3m' as Periodo, label: '3M' },
    { id: '6m' as Periodo, label: '6M' },
    { id: 'todo' as Periodo, label: 'Todo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b18] via-[#0a1429] to-[#050b18] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Inteligencia Operativa</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Estadísticas</h1>
            <p className="text-white/60 mt-1 text-sm">Análisis completo en tiempo real</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>

        {/* Tabs & Período */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selector de período */}
          <div className="flex gap-2">
            {periodos.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  periodo === p.id
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Principales */}
        {activeTab === 'general' && (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Leads"
                value={stats.totalLeads}
                subtitle={`${stats.convertidos} convertidos`}
                icon={Users}
                trend={{ value: 12, isPositive: true }}
              />
              <KPICard
                title="Tasa Conversión"
                value={`${stats.tasaConversion}%`}
                subtitle="Leads → Pacientes"
                icon={TrendingUp}
              />
              <KPICard
                title="Total Consultas"
                value={stats.totalConsultas}
                subtitle={`${stats.confirmadas} confirmadas`}
                icon={Calendar}
              />
              <KPICard
                title="Pacientes Activos"
                value={dm?.pacientesActivos || 0}
                subtitle={`Total: ${dm?.totalPacientes || 0}`}
                icon={Activity}
              />
            </div>

            {/* Gráficos Principales */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Evolución de Leads
                  </CardTitle>
                  <CardDescription className="text-white/60">Últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <GrowthChart title="Evolución de Leads" data={leadTrend} />
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    Consultas por Estado
                  </CardTitle>
                  <CardDescription className="text-white/60">Distribución actual</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.totalConsultas === 0 ? (
                    <p className="text-center text-white/40 py-12">No hay datos</p>
                  ) : (
                    <DonutChart
                      data={consultasEstado}
                      size={220}
                      thickness={40}
                      centerText={stats.totalConsultas.toString()}
                      centerSubtext="Total"
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Compactas */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Confirmadas" value={stats.confirmadas} icon="✅" />
              <StatCard label="Completadas" value={stats.completadas} icon="✓" />
              <StatCard label="Canceladas" value={stats.canceladas} icon="✗" />
              <StatCard label="Convertidos" value={stats.convertidos} icon="🎯" />
            </div>
          </>
        )}

        {/* Tab: Conversión */}
        {activeTab === 'conversion' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Funnel de Conversión</CardTitle>
                <CardDescription className="text-white/70">Lead → Paciente → Consulta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white/60 mb-2">Leads Totales</p>
                    <p className="text-4xl font-bold text-white">{stats.totalLeads}</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm text-emerald-400 mb-2">Convertidos</p>
                    <p className="text-4xl font-bold text-emerald-300">{stats.convertidos}</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm text-blue-400 mb-2">Consultas</p>
                    <p className="text-4xl font-bold text-blue-300">{stats.totalConsultas}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Tasa de Conversión</span>
                    <span className="text-2xl font-bold text-emerald-400">{stats.tasaConversion}%</span>
                  </div>
                  <div className="mt-2 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.tasaConversion}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Canales */}
        {activeTab === 'canales' && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Canales de Adquisición</CardTitle>
              <CardDescription className="text-white/60">Origen de los leads</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-white/40 py-12">Contenido de canales (próximamente)</p>
            </CardContent>
          </Card>
        )}

        {/* Tab: Mensajería */}
        {activeTab === 'mensajeria' && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Análisis de Mensajería</CardTitle>
              <CardDescription className="text-white/60">Engagement y conversaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-white/40 py-12">Contenido de mensajería (próximamente)</p>
            </CardContent>
          </Card>
        )}

        {/* Tab: Operativo */}
        {activeTab === 'operativo' && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Operativo en Tiempo Real</CardTitle>
              <CardDescription className="text-white/60">Métricas actuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Consultas Hoy" value={dm?.consultasHoy || 0} icon="📅" />
                <StatCard label="Pendientes Confirmación" value={dm?.pendientesConfirmacion || 0} icon="⏳" />
                <StatCard label="Polanco Futuras" value={dm?.polancoFuturas || 0} icon="🏢" />
                <StatCard label="Satélite Futuras" value={dm?.sateliteFuturas || 0} icon="🏢" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-600/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-6 text-xs text-white/60">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Datos en tiempo real
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Sincronización Supabase
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full" />
                n8n Workflows activos
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
