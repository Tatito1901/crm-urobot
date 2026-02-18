'use client';

import React from 'react';
import { Crown, Calendar, CheckCircle2 } from 'lucide-react';
import type { PacienteFiel } from '@/hooks/estadisticas/useClinicalStats';

interface Props {
  data: PacienteFiel[];
}

export function DashboardPacientesFieles({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Sin datos de pacientes</p>
      </div>
    );
  }

  // Función para formatear fecha
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
  };

  // Colores para el ranking
  const getRankStyle = (index: number) => {
    if (index === 0) return { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' };
    if (index === 1) return { bg: 'bg-slate-400/10', text: 'text-slate-500', border: 'border-slate-400/30' };
    if (index === 2) return { bg: 'bg-orange-600/10', text: 'text-orange-600', border: 'border-orange-500/30' };
    return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
  };

  return (
    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
      {data.map((paciente, index) => {
        const rankStyle = getRankStyle(index);
        return (
          <div 
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg border ${rankStyle.border} hover:bg-muted/30 transition-colors`}
          >
            {/* Ranking */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${rankStyle.bg} flex items-center justify-center`}>
              {index < 3 ? (
                <Crown className={`w-4 h-4 ${rankStyle.text}`} />
              ) : (
                <span className={`text-xs font-bold ${rankStyle.text}`}>{index + 1}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground truncate">
                  {paciente.nombre}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(paciente.primeraVisita)} - {formatDate(paciente.ultimaVisita)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-bold text-foreground">{paciente.totalConsultas}</div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                {paciente.completadas}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
