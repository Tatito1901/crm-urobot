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
    { key: 'nombre', label: 'LEAD' },
    { key: 'sintomas', label: 'INTENCIÓN / SÍNTOMAS' },
    { key: 'estado', label: 'ESTADO' },
    { key: 'temp', label: 'TEMP.' },
    { key: 'fuente', label: 'ORIGEN' },
    { key: 'mensajes', label: 'MSGS' },
    { key: 'ultimoMensaje', label: 'ÚLTIMA ACTIVIDAD' },
  ];

  // Función auxiliar para obtener iniciales
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Transformación de filas memoizada
  const rows = React.useMemo(() => leads.map((lead) => {
    const initials = getInitials(lead.nombre);
    
    return {
      id: lead.id,
      nombre: (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-xs font-bold text-foreground border border-border">
            {initials}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground leading-tight text-sm">
              {lead.nombre}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">{lead.telefono}</span>
          </div>
        </div>
      ),
      sintomas: (
        <div className="flex flex-col gap-1.5">
          {lead.signals?.perfil_paciente ? (
            <div className="flex items-center gap-1.5">
              <span className="text-blue-500 text-[10px]">⚛</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                {lead.signals.perfil_paciente.replace(/_/g, ' ')}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Sin intención detectada</span>
          )}
          {lead.signals?.pregunto_precio && (
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 text-[10px]">💰</span>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                PREGUNTA PRECIOS
              </span>
            </div>
          )}
        </div>
      ),
      estado: (
        <div className="flex items-center">
          <Badge 
            label={lead.estadoDisplay} 
            tone={STATE_COLORS[lead.estado]} 
            className="w-full justify-start py-1"
          />
        </div>
      ),
      temp: (
        <div className="flex items-center gap-1.5">
          <Badge 
            label={lead.temperatura.toUpperCase()} 
            tone={
              lead.temperatura === 'frio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              lead.temperatura === 'tibio' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              lead.temperatura === 'caliente' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              'bg-red-500/20 text-red-500 border-red-500/30 font-bold'
            }
            className="w-24 justify-center"
          />
        </div>
      ),
      fuente: (
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span>{CANAL_COLORS[lead.fuente]?.icon || '📌'}</span>
          <span className="capitalize">{lead.fuente.toLowerCase().replace(/_/g, ' ')}</span>
        </div>
      ),
      mensajes: (
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-blue-400">💬</span>
          <span className="text-foreground">{lead.totalMensajes}</span>
        </div>
      ),
      ultimoMensaje: (
        <div className="text-xs text-muted-foreground text-right">
          {lead.ultimaInteraccion ? (
            <span>Hace {lead.diasDesdeUltimaInteraccion} {lead.diasDesdeUltimaInteraccion === 1 ? 'día' : 'días'}</span>
          ) : (
            <span>-</span>
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
      onRowClick={onRowClick}
      mobileConfig={{
        primary: 'nombre',
        secondary: 'sintomas',
        metadata: ['estado', 'temp', 'ultimoMensaje']
      }}
    />
  );
});
