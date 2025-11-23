'use client';

import React, { useMemo } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { formatDate } from '@/app/lib/crm-data';
import type { RecordatorioDetalle } from '@/types/recordatorios';

const ESTADO_COLORS = {
  pendiente: 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-400/60 dark:bg-amber-500/15 dark:text-amber-300',
  enviado: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-300',
  error: 'border-red-200 bg-red-100 text-red-700 dark:border-red-400/60 dark:bg-red-500/15 dark:text-red-300',
} as const;

interface ConfirmacionesTableProps {
  recordatorios: RecordatorioDetalle[];
  emptyMessage: string;
}

export const ConfirmacionesTable = React.memo(function ConfirmacionesTable({ 
  recordatorios, 
  emptyMessage 
}: ConfirmacionesTableProps) {

  const headers = useMemo(() => [
    { key: 'programado', label: 'Programado' },
    { key: 'paciente', label: 'Paciente' },
    { key: 'consulta', label: 'Consulta' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'estado', label: 'Estado' },
    { key: 'canal', label: 'Canal' },
  ], []);

  const rows = useMemo(() => recordatorios.map((recordatorio) => ({
    id: recordatorio.id,
    programado: (
      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[120px] sm:min-w-[140px]">
        <span className="font-medium text-slate-900 dark:text-white text-[10px] sm:text-xs leading-tight">
          {formatDate(recordatorio.programado_para, { dateStyle: 'short', timeStyle: 'short' })}
        </span>
        {recordatorio.enviado_en && (
          <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-white/50">
            Enviado: {formatDate(recordatorio.enviado_en, { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        )}
      </div>
    ),
    paciente: (
      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[140px] sm:min-w-[180px]">
        <span className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm leading-tight">
          {recordatorio.paciente?.nombre_completo || 'Sin paciente'}
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wide">
          {recordatorio.consulta?.sede || ''}
        </span>
      </div>
    ),
    consulta: (
      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-transparent">
        {recordatorio.consulta?.consulta_id || 'N/A'}
      </span>
    ),
    tipo: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={recordatorio.tipo.replace(/_/g, ' ')} />
      </div>
    ),
    estado: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={recordatorio.estado || 'pendiente'} tone={ESTADO_COLORS[recordatorio.estado as keyof typeof ESTADO_COLORS] || ESTADO_COLORS.pendiente} />
      </div>
    ),
    canal: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={recordatorio.canal || 'whatsapp'} variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" />
      </div>
    ),
  })), [recordatorios]);

  return (
    <DataTable
      headers={headers}
      rows={rows}
      empty={emptyMessage}
      mobileConfig={{
        primary: 'paciente',
        secondary: 'programado',
        metadata: ['tipo', 'estado', 'canal']
      }}
    />
  );
});
