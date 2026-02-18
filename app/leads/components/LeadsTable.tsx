'use client';

import React from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { STATE_COLORS } from '@/app/lib/crm-data';
import { GLOSARIO } from '@/app/lib/glosario-medico';
import { CANAL_COLORS } from '@/types/canales-marketing';
import { WrapTooltip } from '@/app/components/common/InfoTooltip';
import { TableHeaders } from '@/app/components/leads/LeadsTooltips';
import { LeadActionButton } from './LeadActionButton';
import type { Lead } from '@/types/leads';

interface LeadsTableProps {
  leads: Lead[];
  emptyMessage: string;
  loading?: boolean;
  onRefresh?: () => void;
  onRowClick?: (leadId: string) => void;
}

export const LeadsTable = React.memo(function LeadsTable({ leads, emptyMessage, onRefresh, onRowClick }: LeadsTableProps) {
  // Configuración de columnas
  const headers = [
    { key: 'nombre', label: <TableHeaders.Persona /> },
    { key: 'fuente', label: 'Origen' },
    { key: 'mensajes', label: 'Msgs' },
    { key: 'ultimoMensaje', label: <TableHeaders.UltimoMensaje /> },
    { key: 'estado', label: <TableHeaders.Etapa /> },
    { key: 'accion', label: 'Acción' },
  ];

  // Transformación de filas memoizada
  const rows = React.useMemo(() => leads.map((lead) => {
    return {
      id: lead.id,
      nombre: (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground leading-tight">{lead.nombre}</span>
            {lead.esCaliente && <span className="text-amber-500" title="Lead caliente">🔥</span>}
          </div>
          <span className="text-xs text-muted-foreground font-mono">{lead.telefono}</span>
        </div>
      ),
      fuente: (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${CANAL_COLORS[lead.fuente]?.bg || 'bg-secondary'} ${CANAL_COLORS[lead.fuente]?.text || 'text-foreground'} ${CANAL_COLORS[lead.fuente]?.border || 'border-border'}`}>
          <span>{CANAL_COLORS[lead.fuente]?.icon || '📌'}</span>
          <span className="hidden sm:inline">{lead.fuente}</span>
        </div>
      ),
      mensajes: (
        <div className="text-center">
          <span className={`text-lg font-semibold ${
            lead.totalMensajes >= 10 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : lead.totalMensajes >= 5 
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground'
          }`}>
            {lead.totalMensajes}
          </span>
          <span className="text-xs text-muted-foreground ml-1">msgs</span>
        </div>
      ),
      ultimoMensaje: (
        <div className="text-xs">
          {lead.ultimaInteraccion ? (
            <div className="flex flex-col">
              <span className="text-foreground">
                {new Date(lead.ultimaInteraccion).toLocaleDateString('es-MX', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="text-muted-foreground">
                Hace {lead.diasDesdeUltimaInteraccion}d
                {lead.esInactivo && <span className="text-red-500 ml-1">• Inactivo</span>}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">Sin mensajes</span>
          )}
        </div>
      ),
      estado: (
        <WrapTooltip 
          content={
            <div className="space-y-1">
              <p className="font-semibold">{lead.estado}</p>
              <p className="text-muted-foreground">{GLOSARIO.estados.detalle[lead.estado]}</p>
            </div>
          } 
          side="right"
        >
          <div className="inline-block cursor-help">
            <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
          </div>
        </WrapTooltip>
      ),
      accion: <LeadActionButton lead={lead} onRefresh={onRefresh} />,
    };
  }), [leads, onRefresh]);

  return (
    <DataTable
      headers={headers}
      rows={rows}
      empty={emptyMessage}
      onRowClick={onRowClick}
      mobileConfig={{
        primary: 'nombre',
        secondary: 'fuente',
        metadata: ['estado', 'accion']
      }}
    />
  );
});
