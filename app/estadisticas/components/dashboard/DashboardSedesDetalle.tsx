'use client';

import React from 'react';
import { Building2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import type { SedeRendimiento } from '@/hooks/estadisticas/useClinicalStats';

interface Props {
  data: SedeRendimiento[];
}

export function DashboardSedesDetalle({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-muted/20 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Sin datos de sedes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((sede, index) => (
        <div 
          key={index}
          className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${sede.fill}20` }}
              >
                <Building2 className="w-4 h-4" style={{ color: sede.fill }} />
              </div>
              <span className="font-semibold text-foreground text-sm">{sede.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: sede.tasaAsistencia >= 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: sede.tasaAsistencia >= 90 ? '#10b981' : '#f59e0b'
              }}
            >
              <TrendingUp className="w-3 h-3" />
              {sede.tasaAsistencia}%
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{sede.totalConsultas.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{sede.completadas.toLocaleString()}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xl font-bold text-red-600 dark:text-red-400">{sede.canceladas}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Canceladas</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${sede.tasaAsistencia}%`,
                  backgroundColor: sede.fill 
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
