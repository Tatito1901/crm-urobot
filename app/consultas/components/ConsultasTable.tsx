'use client';

import React, { useMemo } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Consulta } from '@/types/consultas';
import { CheckCircle2 } from 'lucide-react';

// Incluye TRINIDAD como sede histórica (ya no activa pero con datos existentes)
const SEDE_COLORS: Record<'POLANCO' | 'SATELITE' | 'TRINIDAD', string> = {
  POLANCO: 'border border-fuchsia-200 dark:border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10',
  SATELITE: 'border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10',
  TRINIDAD: 'border border-slate-200 dark:border-slate-500/20 text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10',
};

interface ConsultasTableProps {
  consultas: Consulta[];
  emptyMessage: string;
}

export const ConsultasTable = React.memo(function ConsultasTable({ 
  consultas, 
  emptyMessage 
}: ConsultasTableProps) {

  const headers = useMemo(() => [
    { key: 'paciente', label: 'Paciente' },
    { key: 'sede', label: 'Sede' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha y hora' },
    { key: 'confirmada', label: 'Confirmada' },
    { key: 'detalle', label: 'Detalle' },
  ], []);

  const rows = useMemo(() => consultas.map((consulta) => ({
    id: consulta.id,
    paciente: (
      <div className="flex flex-col gap-1 min-w-[140px] sm:min-w-[180px]">
        <span className="font-medium text-foreground text-xs sm:text-sm leading-tight">{consulta.paciente}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">{consulta.tipoCita}</span>
      </div>
    ),
    sede: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={consulta.sede || 'N/A'} tone={consulta.sede ? SEDE_COLORS[consulta.sede] : ''} />
      </div>
    ),
    estado: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={consulta.estadoCita} tone={STATE_COLORS[consulta.estadoCita]} />
      </div>
    ),
    fecha: (
      <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]">
        <span className="text-foreground font-medium text-[10px] sm:text-xs">
          {formatDate(consulta.fechaConsulta)}
        </span>
        <span className="text-muted-foreground text-[9px] sm:text-[10px]">
          {consulta.horaConsulta.slice(0, 5)} · {consulta.duracionMinutos}min
        </span>
      </div>
    ),
    confirmada: (
      <div className="flex items-center justify-center">
        {consulta.confirmadoPaciente ? (
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-500/10 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Sí</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-muted px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground border border-border">
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-muted-foreground/30" />
            <span className="hidden sm:inline">No</span>
          </span>
        )}
      </div>
    ),
    detalle: (
      <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm max-w-[150px] sm:max-w-[200px]">
        <span className="text-foreground/80 line-clamp-2 text-[10px] sm:text-xs leading-tight">
          {consulta.motivoConsulta || 'Sin motivo registrado'}
        </span>
        <span className="text-muted-foreground text-[9px] sm:text-[10px] flex items-center gap-1">
          <span>•</span>
          <span className="truncate">WhatsApp</span>
        </span>
      </div>
    ),
  })), [consultas]);

  return (
    <DataTable
      headers={headers}
      rows={rows}
      empty={emptyMessage}
      mobileConfig={{
        primary: 'paciente',
        secondary: 'fecha',
        metadata: ['sede', 'estado', 'confirmada']
      }}
    />
  );
});
