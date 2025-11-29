'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { CANAL_COLORS } from '@/types/canales-marketing';
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
    { key: 'origen', label: <TableHeaders.Origen /> },
    { key: 'ultimoMensaje', label: <TableHeaders.UltimoMensaje /> },
    { key: 'estado', label: <TableHeaders.Etapa /> },
    { key: 'conversion', label: <TableHeaders.Paciente /> },
  ];

  // Transformación de filas memoizada
  const rows = React.useMemo(() => leads.map((lead) => {
    // Usar fuente (fuente_lead normalizado) para el badge de origen
    const origen = lead.fuente;
    const origenStyle = CANAL_COLORS[origen];

    return {
      id: lead.id,
      nombre: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{lead.nombre}</span>
            {lead.esCaliente && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 border">
                🔥
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-mono">{lead.telefono}</span>
          {lead.canalMarketing && <span className="text-[10px] text-muted-foreground/80 truncate max-w-[150px]">{lead.canalMarketing}</span>}
        </div>
      ),
      origen: (
        <WrapTooltip content={GLOSARIO.canales[origen]} side="right">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-help ${origenStyle.bg} ${origenStyle.text} ${origenStyle.border}`}>
            <span>{origenStyle.icon}</span>
            <span>{origen}</span>
          </span>
        </WrapTooltip>
      ),
      ultimoMensaje: (
        <div className="flex flex-col gap-1 text-xs">
          {lead.ultimaInteraccion ? (
            <>
              <span className="text-foreground font-medium">
                {new Date(lead.ultimaInteraccion).toLocaleDateString('es-MX', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="text-muted-foreground">
                Hace {lead.diasDesdeUltimaInteraccion}d
              </span>
            </>
          ) : (
            <span className="text-muted-foreground italic">
              Sin mensajes aún
            </span>
          )}
          {lead.esInactivo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30 border w-fit mt-1">
              Inactivo
            </span>
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
        <div className="flex flex-col gap-1 text-xs">
          {lead.estado === 'Convertido' && lead.pacienteId ? (
            <div className="group">
              <Link
                href={`/pacientes/${lead.pacienteId}`}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
              >
                Ver perfil
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              {lead.fechaConversion && (
                <span className="text-muted-foreground text-[10px]">
                  Convertido
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">
              En prospección
            </span>
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
        secondary: 'origen',
        metadata: ['estado', 'ultimoMensaje']
      }}
    />
  );
});
