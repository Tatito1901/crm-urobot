'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { CANAL_COLORS, type CanalMarketing } from '@/types/canales-marketing';
import { STATE_COLORS } from '@/app/lib/crm-data';
import { GLOSARIO } from '@/app/lib/glosario-medico';
import { WrapTooltip } from '@/app/components/common/InfoTooltip';
import { TableHeaders } from '@/app/components/leads/LeadsTooltips';
import type { Lead } from '@/types/leads';

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  emptyMessage: string;
}

export const LeadsTable = React.memo(function LeadsTable({ leads, loading, emptyMessage }: LeadsTableProps) {
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
    const canal = (lead.canalMarketing || 'Otro') as CanalMarketing;
    const canalStyle = CANAL_COLORS[canal] || CANAL_COLORS['Otro'];

    return {
      id: lead.id,
      nombre: (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{lead.nombre}</span>
            {lead.esCaliente && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                🔥
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">{lead.telefono}</span>
          <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{lead.fuente}</span>
        </div>
      ),
      origen: (
        <WrapTooltip content={GLOSARIO.canales[canal]} side="right">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${canalStyle.bg} ${canalStyle.text} ${canalStyle.border} cursor-help transition-transform hover:scale-105`}>
            <span>{canalStyle.icon}</span>
            <span>{canal}</span>
          </span>
        </WrapTooltip>
      ),
      ultimoMensaje: (
        <div className="flex flex-col gap-1 text-xs">
          {lead.ultimaInteraccion ? (
            <>
              <span className="text-slate-300 font-medium">
                {new Date(lead.ultimaInteraccion).toLocaleDateString('es-MX', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="text-slate-500">
                Hace {lead.diasDesdeUltimaInteraccion}d
              </span>
            </>
          ) : (
            <span className="text-slate-600 italic">
              Sin mensajes aún
            </span>
          )}
          {lead.esInactivo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-red-950/30 text-red-400 border border-red-900/30 w-fit mt-1">
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
              <p className="text-white/70">{GLOSARIO.estados.detalle[lead.estado]}</p>
            </div>
          } 
          side="right"
        >
          <div className="inline-block cursor-help transition-transform hover:scale-105">
            <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
          </div>
        </WrapTooltip>
      ),
      conversion: (
        <div className="flex flex-col gap-1 text-xs">
          {lead.esCliente && lead.paciente ? (
            <div className="group">
              <Link
                href={`/pacientes/${lead.paciente.id}`}
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
              >
                Ver perfil
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              <span className="text-slate-500 block mt-0.5">
                {lead.paciente.totalConsultas} {lead.paciente.totalConsultas === 1 ? 'consulta' : 'consultas'}
              </span>
              {lead.diasDesdeConversion !== null && (
                <span className="text-slate-600 text-[10px]">
                  Hace {lead.diasDesdeConversion}d
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-600">
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
