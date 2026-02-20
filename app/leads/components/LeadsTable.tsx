'use client';

import React from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { STATE_COLORS } from '@/app/lib/crm-data';
import { GLOSARIO } from '@/app/lib/glosario-medico';
import { CANAL_COLORS } from '@/types/canales-marketing';
import { WrapTooltip } from '@/app/components/common/InfoTooltip';
import { TableHeaders } from '@/app/components/leads/LeadsTooltips';
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
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary border border-primary/20">
            {initials}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground leading-tight text-sm">
              {lead.nombre}
            </span>
            <span className="text-[11px] text-muted-foreground/80 font-mono">{lead.telefono}</span>
          </div>
        </div>
      ),
      sintomas: (
        <div className="flex flex-col gap-1.5">
          {lead.sintomasReportados.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              {lead.sintomasReportados.map((s, i) => (
                <span key={i} className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          ) : lead.signals?.perfil_paciente ? (
            <div className="flex items-center gap-1.5">
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
      temp: (() => {
        const tempConfig = {
          frio:         { dot: 'bg-blue-400',  label: 'Frío',         cls: 'text-blue-400' },
          tibio:        { dot: 'bg-amber-400', label: 'Tibio',        cls: 'text-amber-400' },
          caliente:     { dot: 'bg-rose-400',  label: 'Caliente',     cls: 'text-rose-400' },
          muy_caliente: { dot: 'bg-red-500',   label: 'Muy caliente', cls: 'text-red-400 font-bold' },
          urgente:      { dot: 'bg-red-500',   label: 'Urgente',      cls: 'text-red-400 font-bold' },
        }[lead.temperatura] ?? { dot: 'bg-slate-400', label: lead.temperatura, cls: 'text-slate-400' };
        return (
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tempConfig.dot}`} />
            <span className={`text-xs font-medium whitespace-nowrap ${tempConfig.cls}`}>{tempConfig.label}</span>
          </div>
        );
      })(),
      fuente: (() => {
        const canal = CANAL_COLORS[lead.fuente] ?? CANAL_COLORS['Otro'];
        return (
          <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap ${canal.chip}`}>
              <span className="font-black text-[10px] leading-none">{canal.icon}</span>
              {canal.abbr}
            </span>
            {lead.esMetaAds && lead.campanaHeadline && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={lead.campanaHeadline}>
                {lead.campanaHeadline}
              </span>
            )}
          </div>
        );
      })(),
      mensajes: (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-bold">{lead.totalMensajes}</span>
          <span className="text-muted-foreground">msgs</span>
        </div>
      ),
      ultimoMensaje: (
        <div className="text-xs text-right">
          {lead.ultimaInteraccion ? (
            <span className={lead.diasDesdeUltimaInteraccion !== null && lead.diasDesdeUltimaInteraccion > 3 ? 'text-amber-400/80' : 'text-muted-foreground'}>
              {lead.diasDesdeUltimaInteraccion === 0 ? 'Hoy' : `${lead.diasDesdeUltimaInteraccion}d`}
            </span>
          ) : (
            <span className="text-muted-foreground/50">—</span>
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
