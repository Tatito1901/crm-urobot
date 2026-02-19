'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUrobotStats, marcarAlertaRevisada } from '@/hooks/urobot/useUrobotStats';
import { useConversacionesStats } from '@/hooks/conversaciones/useConversacionesStats';
import { useUrobotMetricasCRM } from '@/hooks/urobot/useUrobotMetricasCRM';
import { Bot, RefreshCw, XCircle, AlertTriangle, MessageCircle, Activity, Target, Brain } from 'lucide-react';
import { RefreshButton } from '@/app/components/common/RefreshButton';
import { TabBar } from '@/app/components/common/TabBar';
import { buttons, spacing, layouts } from '@/app/lib/design-system';

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

import { ChartSkeleton } from './components/ChartSkeleton';

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

const ConversationFunnelChart = dynamic(
  () => import('./components/charts/ConversationFunnelChart'),
  {
    loading: () => <ChartSkeleton height={320} />,
    ssr: false,
  }
);

const BehavioralDistributionChart = dynamic(
  () => import('./components/charts/BehavioralDistributionChart'),
  {
    loading: () => <ChartSkeleton height={280} />,
    ssr: false,
  }
);

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
    if (kpi.tasaExito >= 95) return { status: 'Óptimo', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (kpi.tasaExito >= 85) return { status: 'Estable', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    return { status: 'Atención', color: 'text-red-400', bg: 'bg-red-500' };
  }, [kpi.tasaExito]);

  // Estado de carga seguro para hidratación
  const showLoading = mounted && (isLoading || convLoading || crmLoading);

  return (
    <PageShell
      eyebrow="Analíticas"
      title={
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
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
            className={buttons.select}
          >
            <option value={1}>24h</option>
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
          </select>
          <RefreshButton onClick={handleRefresh} loading={showLoading} variant="cyan" />
        </div>
      }
    >
      {/* Tabs de navegación */}
      <TabBar
        variant="icon"
        flush
        tabs={[
          {
            key: 'crm',
            label: 'Conversiones',
            icon: <Target className="w-4 h-4" />,
            badge: crmResumen.citasAgendadas > 0 ? crmResumen.citasAgendadas : undefined,
            badgeColor: 'emerald',
            accentColor: 'emerald',
          },
          {
            key: 'mensajes',
            label: 'Mensajes',
            icon: <MessageCircle className="w-4 h-4" />,
            badge: convKpi.totalMensajesRecibidos + convKpi.totalMensajesEnviados,
            accentColor: 'cyan',
          },
          {
            key: 'monitoreo',
            label: 'Monitoreo',
            icon: <Activity className="w-4 h-4" />,
            badge: kpi.alertasPendientes > 0 ? kpi.alertasPendientes : undefined,
            badgeColor: 'red',
            accentColor: 'cyan',
          },
        ]}
        active={activeTab}
        onChange={(key) => setActiveTab(key as TabView)}
      />
      {/* ============================================================ */}
      {/* TAB: CRM - Métricas de conversión */}
      {/* ============================================================ */}
      {activeTab === 'crm' && (
        <>
          {/* KPIs de conversiones */}
          <section className={spacing.sectionGap}>
            <MetricasCRMKPIs resumen={crmResumen} />
          </section>

          {/* Funnel + Intenciones */}
          <div className={`${layouts.grid2} ${spacing.sectionGap}`}>
            <FunnelConversion funnel={crmData.funnel} />
            <IntentsDistribucion intents={crmData.intents} />
          </div>

          {/* Sentiment + Actividad */}
          <div className={`${layouts.grid2} ${spacing.sectionGap}`}>
            <SentimentPanel 
              positivo={crmResumen.sentimentPositivo}
              negativo={crmResumen.sentimentNegativo}
              urgente={crmResumen.sentimentUrgente}
              neutral={crmResumen.sentimentNeutral}
            />
            <ActividadHeatmap datos={crmData.porHora} />
          </div>

          {/* Funnel de fases de conversación */}
          <div className={spacing.sectionGap}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-violet-500" />
                  Funnel de Conversación (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConversationFunnelChart />
              </CardContent>
            </Card>
          </div>

          {/* Distribución Behavioral */}
          <div className={spacing.sectionGap}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-500" />
                  Perfiles Behavioral (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BehavioralDistributionChart />
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de evolución */}
          <div className={spacing.sectionGap}>
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
          <section className={spacing.sectionGap}>
            <ConversacionesKPIs kpi={convKpi} />
          </section>

          {/* Fila principal: Resumen + Actividad por hora */}
          <div className={`${layouts.grid2} ${spacing.sectionGap}`}>
            <MensajesResumen 
              recibidos={convKpi.totalMensajesRecibidos}
              enviados={convKpi.totalMensajesEnviados}
              conversaciones={convKpi.totalConversaciones}
            />
            <ActividadPorHora datos={convStats.mensajesPorHora} />
          </div>

          {/* Segunda fila: Tipos de interacción + Top preguntas */}
          <div className={`${layouts.grid2} ${spacing.sectionGap}`}>
            <TiposInteraccionCard tipos={convStats.tiposInteraccion} />
            <TopPreguntasCard preguntas={convStats.topPreguntas} />
          </div>

          {/* Gráfico de evolución */}
          <div className={spacing.sectionGap}>
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
          <section className={spacing.sectionGap}>
            <UrobotMetrics kpi={kpi} />
          </section>

          {/* Gráficos principales */}
          <div className={`${layouts.grid2} ${spacing.sectionGap}`}>
            <ActivityChart data={stats.evolucionHoras} />
            <InteractionsPieChart data={stats.interaccionesPorTipo} />
          </div>

          {/* Segunda fila de gráficos */}
          <div className={`${layouts.grid3} ${spacing.sectionGap}`}>
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
          <div className={layouts.grid2}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
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
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
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
