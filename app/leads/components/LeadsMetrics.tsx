'use client';

import React from 'react';
import { Users, UserCheck, UserPlus, Clock, AlertCircle } from 'lucide-react';

interface LeadsStats {
  total: number;
  nuevos: number;
  interactuando: number;
  contactados: number;
  citaPropuesta: number;
  enSeguimiento: number;
  citaAgendada: number;
  convertidos: number;
  perdidos: number;
  activos: number;
}

interface LeadsMetricsProps {
  stats: LeadsStats;
  loading?: boolean;
}

export const LeadsMetrics = React.memo(function LeadsMetrics({ stats, loading }: LeadsMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4">
      {/* Pipeline Activo (Métrica Principal) */}
      <div className="bg-card border border-primary/20 rounded-lg p-2.5 sm:p-3.5 flex flex-col justify-between relative overflow-hidden group col-span-2 sm:col-span-1">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </div>
        <div>
          <div className="text-[10px] sm:text-[11px] text-primary mb-0.5 font-medium">Pipeline Activo</div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.activos}</div>
        </div>
        <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">Leads en gestión</div>
      </div>

      {/* Nuevos (Alta Prioridad) */}
      <div className="bg-card border border-blue-500/20 rounded-lg p-2.5 sm:p-3.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
        </div>
        <div>
          <div className="text-[10px] sm:text-[11px] text-blue-500 dark:text-blue-300 mb-0.5 font-medium flex items-center gap-1">
            <span className="animate-pulse">●</span> Nuevos
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.nuevos}</div>
        </div>
        <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">&lt;24h sin contactar</div>
      </div>

      {/* Contactados (En Seguimiento) */}
      <div className="bg-card border border-amber-500/20 rounded-lg p-2.5 sm:p-3.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
        </div>
        <div>
          <div className="text-[10px] sm:text-[11px] text-amber-500 dark:text-amber-300 mb-0.5 font-medium">En proceso</div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.interactuando + stats.contactados + stats.citaPropuesta}</div>
        </div>
        <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">Bot + Contactados + Propuestas</div>
      </div>

      {/* Citas Agendadas */}
      <div className="bg-card border border-purple-500/20 rounded-lg p-2.5 sm:p-3.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
        </div>
        <div>
          <div className="text-[10px] sm:text-[11px] text-purple-500 dark:text-purple-300 mb-0.5 font-medium">Citas agendadas</div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.citaAgendada}</div>
        </div>
        <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">Esperando asistencia</div>
      </div>

      {/* Convertidos (Éxito) */}
      <div className="bg-card border border-emerald-500/20 rounded-lg p-2.5 sm:p-3.5 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
        </div>
        <div>
          <div className="text-[10px] sm:text-[11px] text-emerald-500 dark:text-emerald-300 mb-0.5 font-medium">✓ Convertidos</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.convertidos}</div>
        </div>
        <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">Ya son pacientes</div>
      </div>
    </div>
  );
});
