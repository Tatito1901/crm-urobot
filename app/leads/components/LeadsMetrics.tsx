'use client';

import React from 'react';
import { Users, UserCheck, UserPlus, Clock, AlertCircle } from 'lucide-react';

interface LeadsStats {
  total: number;
  nuevo: number;
  seguimiento: number;
  convertido: number;
  descartado: number;
  enProceso: number;
  clientes: number;
  calientes: number;
  inactivos: number;
}

interface LeadsMetricsProps {
  stats: LeadsStats;
  loading?: boolean;
}

export const LeadsMetrics = React.memo(function LeadsMetrics({ stats, loading }: LeadsMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
      {/* Total */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-12 h-12 text-blue-400" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1 font-medium">Total Leads</div>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Base de datos completa</div>
      </div>

      {/* Nuevos (Prioridad) */}
      <div className="bg-card border border-blue-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserPlus className="w-12 h-12 text-blue-400" />
        </div>
        <div>
          <div className="text-xs text-blue-500 dark:text-blue-300 mb-1 font-medium flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Nuevos
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.nuevo}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Requieren primer contacto</div>
      </div>

      {/* En Seguimiento */}
      <div className="bg-card border border-indigo-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="w-12 h-12 text-indigo-400" />
        </div>
        <div>
          <div className="text-xs text-indigo-500 dark:text-indigo-300 mb-1 font-medium">En Seguimiento</div>
          <div className="text-2xl font-bold text-foreground">{stats.seguimiento}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Conversaciones activas</div>
      </div>

      {/* Convertidos (Éxito) */}
      <div className="bg-card border border-emerald-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserCheck className="w-12 h-12 text-emerald-400" />
        </div>
        <div>
          <div className="text-xs text-emerald-500 dark:text-emerald-300 mb-1 font-medium">Convertidos</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-100">{stats.convertido}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Pacientes agendados</div>
      </div>

      {/* Alta Prioridad (Hot) */}
      <div className="hidden lg:flex bg-card border border-amber-500/20 rounded-lg p-4 flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertCircle className="w-12 h-12 text-amber-400" />
        </div>
        <div>
          <div className="text-xs text-amber-500 dark:text-amber-300 mb-1 font-medium flex items-center gap-1">
            🔥 Alta Prioridad
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-100">{stats.calientes}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Muy interesados</div>
      </div>
    </div>
  );
});
