'use client';

import React, { useMemo } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { formatDate } from '@/app/lib/crm-data';
import type { RecordatorioDetalle } from '@/types/recordatorios';

const STATUS_COLORS = {
  pending: 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-400/60 dark:bg-amber-500/15 dark:text-amber-300',
  sent: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'border-red-200 bg-red-100 text-red-700 dark:border-red-400/60 dark:bg-red-500/15 dark:text-red-300',
  processing: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-400/60 dark:bg-blue-500/15 dark:text-blue-300',
  cancelled: 'border-slate-200 bg-slate-100 text-foreground/60 dark:bg-slate-500/15 dark:text-slate-300',
} as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  sent: 'Enviado',
  failed: 'Error',
  processing: 'Procesando',
  cancelled: 'Cancelado',
};

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

  // Helper para extraer tipo de metadata
  const getTipo = (r: RecordatorioDetalle) => {
    const meta = r.metadata as { tipo?: string } | null;
    return meta?.tipo || 'recordatorio';
  };

  const rows = useMemo(() => recordatorios.map((recordatorio) => ({
    id: recordatorio.id,
    programado: (
      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[120px] sm:min-w-[140px]">
        <span className="font-medium text-slate-900 dark:text-white text-[10px] sm:text-xs leading-tight">
          {formatDate(recordatorio.nextAttemptAt || recordatorio.createdAt || '', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
        {recordatorio.status === 'sent' && recordatorio.updatedAt && (
          <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-white/50">
            Enviado: {formatDate(recordatorio.updatedAt, { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        )}
      </div>
    ),
    paciente: (
      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[140px] sm:min-w-[180px]">
        <span className="font-medium text-foreground text-xs sm:text-sm leading-tight">
          {recordatorio.pacienteNombre || 'Sin paciente'}
        </span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">
          {recordatorio.sede || ''}
        </span>
      </div>
    ),
    consulta: (
      <span className="font-mono text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-transparent">
        {recordatorio.consultaId?.slice(0, 8) || 'N/A'}
      </span>
    ),
    tipo: (
      <div className="flex justify-center sm:justify-start">
        <Badge label={getTipo(recordatorio).replace(/_/g, ' ')} />
      </div>
    ),
    estado: (
      <div className="flex justify-center sm:justify-start">
        <Badge 
          label={STATUS_LABELS[recordatorio.status] || recordatorio.status} 
          tone={STATUS_COLORS[recordatorio.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending} 
        />
      </div>
    ),
    canal: (
      <div className="flex justify-center sm:justify-start">
        <Badge label="WhatsApp" variant="outline" className="border-border text-muted-foreground" />
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
