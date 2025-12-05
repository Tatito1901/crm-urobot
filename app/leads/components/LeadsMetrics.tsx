'use client';

import React from 'react';
import { Users, UserCheck, UserPlus, Clock, AlertCircle } from 'lucide-react';

interface LeadsStats {
  total: number;
  nuevo: number;
  contactado: number;  // Leads en seguimiento
  interesado: number;
  convertido: number;
  descartado: number;
  activos: number;     // Pipeline activo (nuevo + contactado + interesado)
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
          <div key={i} className="h-24 bg-muted/50 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* Pipeline Activo (Métrica Principal) */}
      <div className="bg-card border border-primary/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-12 h-12 text-primary" />
        </div>
        <div>
          <div className="text-xs text-primary mb-1 font-medium">Pipeline Activo</div>
          <div className="text-2xl font-bold text-foreground">{stats.activos}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Leads en gestión</div>
      </div>

      {/* Nuevos (Alta Prioridad) */}
      <div className="bg-card border border-blue-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserPlus className="w-12 h-12 text-blue-400" />
        </div>
        <div>
          <div className="text-xs text-blue-500 dark:text-blue-300 mb-1 font-medium flex items-center gap-1">
            <span className="animate-pulse">●</span> Nuevos
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.nuevo}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">&lt;24h sin contactar</div>
      </div>

      {/* Contactados (En Seguimiento) */}
      <div className="bg-card border border-amber-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="w-12 h-12 text-amber-400" />
        </div>
        <div>
          <div className="text-xs text-amber-500 dark:text-amber-300 mb-1 font-medium">Contactados</div>
          <div className="text-2xl font-bold text-foreground">{stats.contactado}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">En seguimiento</div>
      </div>

      {/* Interesados */}
      <div className="bg-card border border-purple-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertCircle className="w-12 h-12 text-purple-400" />
        </div>
        <div>
          <div className="text-xs text-purple-500 dark:text-purple-300 mb-1 font-medium">Interesados</div>
          <div className="text-2xl font-bold text-foreground">{stats.interesado}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Mostraron interés real</div>
      </div>

      {/* Convertidos (Éxito) */}
      <div className="bg-card border border-emerald-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserCheck className="w-12 h-12 text-emerald-400" />
        </div>
        <div>
          <div className="text-xs text-emerald-500 dark:text-emerald-300 mb-1 font-medium">✓ Convertidos</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.convertido}</div>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">Ya son pacientes</div>
      </div>
    </div>
  );
});
