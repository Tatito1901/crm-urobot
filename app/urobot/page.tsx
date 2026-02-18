'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUrobotStats, marcarAlertaRevisada } from '@/hooks/urobot/useUrobotStats';
import { useConversacionesStats } from '@/hooks/conversaciones/useConversacionesStats';
import { useUrobotMetricasCRM } from '@/hooks/urobot/useUrobotMetricasCRM';
import { Bot, RefreshCw, XCircle, AlertTriangle, MessageCircle, Activity, Target } from 'lucide-react';

// Componentes optimizados
import { UrobotMetrics } from './components/UrobotMetrics';
import { ErrorsTable } from './components/ErrorsTable';
import { AlertasPanel } from './components/AlertasPanel';
import { 
  ConversacionesKPIs, 
  MensajesResumen, 
  TiposInteraccionCard, 
  TopPreguntasCard,
  ActividadPorHora 
} from './components/ConversacionesStats';
import {
  MetricasCRMKPIs,
  FunnelConversion,
  IntentsDistribucion,
  SentimentPanel,
  ActividadHeatmap,
} from './components/MetricasCRMPanel';

// Lazy loading de gráficos (heavy components)
const ActivityChart = dynamic(
  () => import('./components/charts/ActivityChart').then(mod => ({ default: mod.ActivityChart })),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const InteractionsPieChart = dynamic(
  () => import('./components/charts/InteractionsPieChart').then(mod => ({ default: mod.InteractionsPieChart })),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const HorizontalBarChart = dynamic(
  () => import('./components/charts/HorizontalBarChart').then(mod => ({ default: mod.HorizontalBarChart })),
  { 
    loading: () => <ChartSkeleton height={180} />,
    ssr: false,
  }
);

// Skeleton para carga de gráficos
function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="animate-pulse bg-muted/50 rounded" style={{ height }} />
      </CardContent>
    </Card>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

type TabView = 'crm' | 'mensajes' | 'monitoreo';

export default function UrobotPage() {
  const [dias, setDias] = useState(7);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('crm');
  
  const { stats, kpi, isLoading, refetch } = useUrobotStats(dias);
  const { stats: convStats, kpi: convKpi, isLoading: convLoading, refetch: convRefetch } = useConversacionesStats(dias);
  const { data: crmData, resumen: crmResumen, isLoading: crmLoading, refetch: crmRefetch } = useUrobotMetricasCRM(dias);

  // Prevenir mismatch de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleRefresh = () => {
    refetch();
    convRefetch();
    crmRefetch();
  };

  const handleRevisarAlerta = async (alertaId: string) => {
    try {
      await marcarAlertaRevisada(alertaId);
      refetch();
    } catch (error) {
      console.error('Error al marcar alerta:', error);
    }
  };

  // Calcular estado general
  const estadoGeneral = useMemo(() => {
    if (kpi.tasaExito >= 95) return { status: 'Óptimo', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
    if (kpi.tasaExito >= 85) return { status: 'Estable', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500' };
    return { status: 'Atención', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' };
  }, [kpi.tasaExito]);

  // Estado de carga seguro para hidratación
  const showLoading = mounted && (isLoading || convLoading || crmLoading);

  return (
    <PageShell
      eyebrow="Analíticas"
      title={
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-600 dark:text-cyan-400" />
          <span className="text-lg sm:text-xl">UroBot Analytics</span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${estadoGeneral.bg}/20 ${estadoGeneral.color}`}>
            <span className={`w-2 h-2 rounded-full ${estadoGeneral.bg} animate-pulse`} />
            {estadoGeneral.status}
          </div>
        </div>
      }
      description="Estadísticas de mensajes y monitoreo del asistente"
      headerSlot={
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-muted border border-border text-sm"
          >
            <option value={1}>24h</option>
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={showLoading}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${showLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      }
    >
      {/* Tabs de navegación */}
      <div className="mb-4 sm:mb-6 border-b border-border overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-0.5 sm:gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === 'crm' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            <Target className="w-4 h-4" />
            <span>Conversiones</span>
            {crmResumen.citasAgendadas > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                {crmResumen.citasAgendadas}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('mensajes')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === 'mensajes' 
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Mensajes</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-muted">
              {convKpi.totalMensajesRecibidos + convKpi.totalMensajesEnviados}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('monitoreo')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === 'monitoreo' 
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            <Activity className="w-4 h-4" />
            <span>Monitoreo</span>
            {kpi.alertasPendientes > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                {kpi.alertasPendientes}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* ============================================================ */}
      {/* TAB: CRM - Métricas de conversión */}
      {/* ============================================================ */}
      {activeTab === 'crm' && (
        <>
          {/* KPIs de conversiones */}
          <section className="mb-4 sm:mb-8">
            <MetricasCRMKPIs resumen={crmResumen} />
          </section>

          {/* Funnel + Intenciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <FunnelConversion funnel={crmData.funnel} />
            <IntentsDistribucion intents={crmData.intents} />
          </div>

          {/* Sentiment + Actividad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <SentimentPanel 
              positivo={crmResumen.sentimentPositivo}
              negativo={crmResumen.sentimentNegativo}
              urgente={crmResumen.sentimentUrgente}
              neutral={crmResumen.sentimentNeutral}
            />
            <ActividadHeatmap datos={crmData.porHora} />
          </div>

          {/* Gráfico de evolución */}
          <div className="mb-4 sm:mb-8">
            <ActivityChart data={stats.evolucionHoras} />
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* TAB: MENSAJES - Estadísticas de conversaciones */}
      {/* ============================================================ */}
      {activeTab === 'mensajes' && (
        <>
          {/* KPIs de conversaciones */}
          <section className="mb-4 sm:mb-8">
            <ConversacionesKPIs kpi={convKpi} />
          </section>

          {/* Fila principal: Resumen + Actividad por hora */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <MensajesResumen 
              recibidos={convKpi.totalMensajesRecibidos}
              enviados={convKpi.totalMensajesEnviados}
              conversaciones={convKpi.totalConversaciones}
            />
            <ActividadPorHora datos={convStats.mensajesPorHora} />
          </div>

          {/* Segunda fila: Tipos de interacción + Top preguntas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <TiposInteraccionCard tipos={convStats.tiposInteraccion} />
            <TopPreguntasCard preguntas={convStats.topPreguntas} />
          </div>

          {/* Gráfico de evolución */}
          <div className="mb-4 sm:mb-8">
            <ActivityChart data={stats.evolucionHoras} />
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* TAB: MONITOREO - Estado técnico del bot */}
      {/* ============================================================ */}
      {activeTab === 'monitoreo' && (
        <>
          {/* KPIs técnicos */}
          <section className="mb-4 sm:mb-8">
            <UrobotMetrics kpi={kpi} />
          </section>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <ActivityChart data={stats.evolucionHoras} />
            <InteractionsPieChart data={stats.interaccionesPorTipo} />
          </div>

          {/* Segunda fila de gráficos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <HorizontalBarChart 
              data={stats.erroresPorTipo} 
              title="Errores por Tipo"
              emptyMessage="Sin errores en el período"
            />
            <HorizontalBarChart 
              data={stats.herramientasUsadas} 
              title="Herramientas Usadas"
              emptyMessage="Sin datos de herramientas"
            />
            <InteractionsPieChart 
              data={stats.sentimentDistribucion} 
              title="Sentiment de Usuarios"
              innerRadius={40}
            />
          </div>

          {/* Tablas de errores y alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Últimos Errores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorsTable errors={stats.ultimosErrores} />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Alertas Pendientes ({stats.alertasPendientes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertasPanel alertas={stats.alertasPendientes} onRevisar={handleRevisarAlerta} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
}
