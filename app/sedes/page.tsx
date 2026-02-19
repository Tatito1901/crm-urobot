'use client';

import React, { useCallback } from 'react';
import {
  Building2,
  RefreshCw,
  AlertCircle,
  CalendarRange,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSedes } from '@/hooks/sedes/useSedes';
import { typography, spacing, cards } from '@/app/lib/design-system';
import { cn } from '@/lib/utils';
import type { HorarioJson } from '@/types/sedes';
import { ScheduleEditor } from './components/ScheduleEditor';

export default function HorariosPage() {
  const { sedes, loading, error, refetch, updateHorario, updateInfo } = useSedes();

  const handleSaveHorario = useCallback(async (sedeId: string, horarioJson: HorarioJson) => {
    return updateHorario({ sedeId, horarioJson });
  }, [updateHorario]);

  const handleSaveInfo = useCallback(async (sedeId: string, info: {
    displayName?: string; direccion?: string;
    instruccionesLlegada?: string; anchorDate?: string; anchorWeekType?: string;
  }) => {
    return updateInfo({ sedeId, ...info });
  }, [updateInfo]);

  return (
    <div className={cn(spacing.container, spacing.containerY, 'max-w-4xl mx-auto')}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={typography.pageTitle}>Horarios del Doctor</h1>
          <p className={typography.pageSubtitle}>
            Configura los horarios de consulta por sede. Los cambios se reflejan en el bot de WhatsApp.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Recargar
        </Button>
      </div>

      {/* ── Info Banner ── */}
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 mb-6 flex items-start gap-3">
        <CalendarRange className="h-4.5 w-4.5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] text-foreground font-medium leading-tight">
            Semanas A y B alternantes
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            El sistema alterna automáticamente entre Semana A y B usando la fecha ancla.
            Si ambas son iguales, el horario se repite sin alternancia.
          </p>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className={cn(cards.glass, 'animate-pulse')}>
              <div className="border-b border-border px-5 py-3.5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-36 rounded bg-muted" />
                  <div className="h-2.5 w-56 rounded bg-muted" />
                </div>
              </div>
              <div className="px-5 py-4 space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <div key={j} className="h-9 rounded-xl bg-muted/30" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className={cn(cards.glass, 'border-rose-500/20')}>
          <div className="p-5 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-rose-400">Error al cargar sedes</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{error.message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && sedes.length === 0 && (
        <div className={cn(cards.glass, 'py-12 text-center')}>
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No hay sedes configuradas</p>
        </div>
      )}

      {/* ── Sede Editors ── */}
      {!loading && !error && (
        <div className="space-y-5">
          {sedes.map((sede) => (
            <ScheduleEditor
              key={sede.id}
              sede={sede}
              onSave={handleSaveHorario}
              onSaveInfo={handleSaveInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
