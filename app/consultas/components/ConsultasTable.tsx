'use client';

import React, { useMemo } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Consulta } from '@/types/consultas';
import { CheckCircle2 } from 'lucide-react';

const SEDE_COLORS: Record<'POLANCO' | 'SATELITE', string> = {
  POLANCO: 'border border-fuchsia-200 text-fuchsia-700 bg-fuchsia-100 dark:border-fuchsia-400/60 dark:bg-fuchsia-500/15 dark:text-fuchsia-100',
  SATELITE: 'border border-cyan-200 text-cyan-700 bg-cyan-100 dark:border-cyan-400/60 dark:bg-cyan-500/15 dark:text-cyan-100',
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
        <span className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm leading-tight">{consulta.paciente}</span>
        <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wide">{consulta.tipo.replace('_', ' ')}</span>
      </div>
    ),
    sede: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={consulta.sede} tone={SEDE_COLORS[consulta.sede]} />
      </div>
    ),
    estado: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
      </div>
    ),
    fecha: (
      <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]">
        <span className="text-slate-700 dark:text-white/80 font-medium text-[10px] sm:text-xs">
          {formatDate(consulta.fechaConsulta)}
        </span>
        <span className="text-slate-500 dark:text-white/50 text-[9px] sm:text-[10px]">
          {consulta.horaConsulta.slice(0, 5)} · {consulta.duracionMinutos}min
        </span>
      </div>
    ),
    confirmada: (
      <div className="flex items-center justify-center">
        {consulta.confirmadoPaciente ? (
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Sí</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10">
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-slate-300 dark:border-white/20" />
            <span className="hidden sm:inline">No</span>
          </span>
        )}
      </div>
    ),
    detalle: (
      <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm max-w-[150px] sm:max-w-[200px]">
        <span className="text-slate-600 dark:text-white/70 line-clamp-2 text-[10px] sm:text-xs leading-tight">
          {consulta.motivoConsulta || 'Sin motivo registrado'}
        </span>
        <span className="text-slate-400 dark:text-white/50 text-[9px] sm:text-[10px] flex items-center gap-1">
          <span>•</span>
          <span className="truncate">{consulta.canalOrigen || 'WhatsApp'}</span>
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
