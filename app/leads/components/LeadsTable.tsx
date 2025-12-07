'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { STATE_COLORS } from '@/app/lib/crm-data';
import { GLOSARIO } from '@/app/lib/glosario-medico';
import { WrapTooltip } from '@/app/components/common/InfoTooltip';
import { TableHeaders } from '@/app/components/leads/LeadsTooltips';
import type { Lead } from '@/types/leads';

interface LeadsTableProps {
  leads: Lead[];
  emptyMessage: string;
  loading?: boolean;
}

export const LeadsTable = React.memo(function LeadsTable({ leads, emptyMessage }: LeadsTableProps) {
  // Configuración de columnas
  const headers = [
    { key: 'nombre', label: <TableHeaders.Persona /> },
    { key: 'mensajes', label: 'Mensajes' },
    { key: 'ultimoMensaje', label: <TableHeaders.UltimoMensaje /> },
    { key: 'estado', label: <TableHeaders.Etapa /> },
    { key: 'conversion', label: <TableHeaders.Paciente /> },
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
      mensajes: (
        <div className="text-center">
          <span className={`text-lg font-semibold ${
            lead.totalInteracciones >= 10 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : lead.totalInteracciones >= 5 
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground'
          }`}>
            {lead.totalInteracciones}
          </span>
          <span className="text-[11px] text-muted-foreground ml-1">msgs</span>
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
      conversion: (
        <div className="text-xs">
          {lead.estado === 'Convertido' && lead.pacienteId ? (
            <Link
              href={`/pacientes/${lead.pacienteId}`}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Ver perfil →
            </Link>
          ) : (
            <span className="text-muted-foreground">En prospección</span>
          )}
        </div>
      ),
    };
  }), [leads]);

  return (
    <DataTable
      headers={headers}
      rows={rows}
      empty={emptyMessage}
      mobileConfig={{
        primary: 'nombre',
        secondary: 'mensajes',
        metadata: ['estado', 'ultimoMensaje']
      }}
    />
  );
});
