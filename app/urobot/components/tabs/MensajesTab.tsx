'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useConversacionesStats } from '@/hooks/conversaciones/useConversacionesStats';
import { spacing, layouts } from '@/app/lib/design-system';
import { ChartSkeleton } from '../ChartSkeleton';
import {
  ConversacionesKPIs,
  MensajesResumen,
  TiposInteraccionCard,
  TopPreguntasCard,
  ActividadPorHora,
} from '../ConversacionesStats';
import type { TimeSeriesData } from '@/hooks/urobot/useUrobotStats';

const ActivityChart = dynamic(
  () => import('../charts/ActivityChart').then(mod => ({ default: mod.ActivityChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

interface MensajesTabProps {
  dias: number;
  evolucionHoras: TimeSeriesData[];
}

export function MensajesTab({ dias, evolucionHoras }: MensajesTabProps) {
  const { stats: convStats, kpi: convKpi } = useConversacionesStats(dias);

  return (
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
        <ActivityChart data={evolucionHoras} />
      </div>
    </>
  );
}
