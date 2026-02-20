'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageShell } from '@/app/components/crm/page-shell';
import { useUrobotStats, marcarAlertaRevisada } from '@/hooks/urobot/useUrobotStats';
import { Bot, MessageCircle, Activity, Target } from 'lucide-react';
import { RefreshButton } from '@/app/components/common/RefreshButton';
import { TabBar } from '@/app/components/common/TabBar';
import { buttons } from '@/app/lib/design-system';
import { invalidateDomain } from '@/lib/swr-config';

import { CRMTab } from './components/tabs/CRMTab';
import { MensajesTab } from './components/tabs/MensajesTab';
import { MonitoreoTab } from './components/tabs/MonitoreoTab';

// ============================================================
// HELPERS
// ============================================================

function formatBadge(n: number): string | number | undefined {
  if (n <= 0) return undefined;
  if (n >= 10_000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return n;
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

type TabView = 'crm' | 'mensajes' | 'monitoreo';

export default function UrobotPage() {
  const [dias, setDias] = useState(7);
  const [activeTab, setActiveTab] = useState<TabView>('crm');

  const { stats, kpi, isLoading, refetch } = useUrobotStats(dias);

  const handleRefresh = useCallback(() => {
    refetch();
    invalidateDomain('urobot');
  }, [refetch]);

  const handleRevisarAlerta = useCallback(async (alertaId: string) => {
    try {
      await marcarAlertaRevisada(alertaId);
      refetch();
    } catch (error) {
      console.error('Error al marcar alerta:', error);
    }
  }, [refetch]);

  const estadoGeneral = useMemo(() => {
    if (kpi.tasaExito >= 95) return { status: 'Óptimo', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (kpi.tasaExito >= 85) return { status: 'Estable', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    return { status: 'Atención', color: 'text-red-400', bg: 'bg-red-500' };
  }, [kpi.tasaExito]);

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
          <RefreshButton onClick={handleRefresh} loading={isLoading} variant="cyan" />
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
            accentColor: 'emerald',
          },
          {
            key: 'mensajes',
            label: 'Mensajes',
            icon: <MessageCircle className="w-4 h-4" />,
            badge: formatBadge(kpi.totalMensajes),
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

      {activeTab === 'crm' && (
        <CRMTab dias={dias} evolucionHoras={stats.evolucionHoras} />
      )}

      {activeTab === 'mensajes' && (
        <MensajesTab dias={dias} evolucionHoras={stats.evolucionHoras} />
      )}

      {activeTab === 'monitoreo' && (
        <MonitoreoTab
          kpi={kpi}
          evolucionHoras={stats.evolucionHoras}
          interaccionesPorTipo={stats.interaccionesPorTipo}
          erroresPorTipo={stats.erroresPorTipo}
          herramientasUsadas={stats.herramientasUsadas}
          sentimentDistribucion={stats.sentimentDistribucion}
          ultimosErrores={stats.ultimosErrores}
          alertasPendientes={stats.alertasPendientes}
          onRevisarAlerta={handleRevisarAlerta}
        />
      )}
    </PageShell>
  );
}
