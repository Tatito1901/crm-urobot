'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUrobotMetricasCRM } from '@/hooks/urobot/useUrobotMetricasCRM';
import { MessageCircle, Brain } from 'lucide-react';
import { spacing, layouts } from '@/app/lib/design-system';
import { ChartSkeleton } from '../ChartSkeleton';
import {
  MetricasCRMKPIs,
  FunnelConversion,
  IntentsDistribucion,
  SentimentPanel,
  ActividadHeatmap,
} from '../MetricasCRMPanel';
import type { TimeSeriesData } from '@/hooks/urobot/useUrobotStats';

const ActivityChart = dynamic(
  () => import('../charts/ActivityChart').then(mod => ({ default: mod.ActivityChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const ConversationFunnelChart = dynamic(
  () => import('../charts/ConversationFunnelChart'),
  { loading: () => <ChartSkeleton height={320} />, ssr: false }
);

const BehavioralDistributionChart = dynamic(
  () => import('../charts/BehavioralDistributionChart'),
  { loading: () => <ChartSkeleton height={280} />, ssr: false }
);

interface CRMTabProps {
  dias: number;
  evolucionHoras: TimeSeriesData[];
}

export function CRMTab({ dias, evolucionHoras }: CRMTabProps) {
  const { data: crmData, resumen: crmResumen } = useUrobotMetricasCRM(dias);

  return (
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
              Funnel de Conversación ({dias}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConversationFunnelChart dias={dias} />
          </CardContent>
        </Card>
      </div>

      {/* Distribución Behavioral */}
      <div className={spacing.sectionGap}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-500" />
              Perfiles Behavioral ({dias}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BehavioralDistributionChart dias={dias} />
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de evolución */}
      <div className={spacing.sectionGap}>
        <ActivityChart data={evolucionHoras} />
      </div>
    </>
  );
}
