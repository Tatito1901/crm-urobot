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
    <div className={cn(spacing.container, spacing.containerY, 'max-w-4xl mx-auto pb-20 lg:pb-8')}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-[2px] rounded-full bg-teal-400" aria-hidden />
            <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground/60">Configuración</p>
          </div>
          <h1 className={typography.pageTitle}>Horarios del Doctor</h1>
          <p className="text-xs sm:text-sm text-muted-foreground/70">
            Configura los horarios de consulta por sede. Los cambios se reflejan en el bot.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:border-teal-500/20 hover:bg-teal-500/5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Recargar
        </button>
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
