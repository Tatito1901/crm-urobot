/**
 * ============================================================
 * DASHBOARD PREDICTIVE - Análisis predictivo y tendencias
 * ============================================================
 * Muestra predicciones y análisis de demanda con IA básica
 */

'use client';

import React from 'react';
import { useOccupancyHeatmap } from '@/hooks/estadisticas/useOccupancyHeatmap';
import { TrendingUp, TrendingDown, Calendar, Clock, Target, Zap } from 'lucide-react';

export function DashboardPredictive() {
  const { predictions, stats, hourlyPatterns } = useOccupancyHeatmap();

  // Encontrar hora pico
  const peakHour = React.useMemo(() => {
    if (!hourlyPatterns || hourlyPatterns.length === 0) return null;
    
    let maxTotal = 0;
    let peakPattern = hourlyPatterns[0];
    
    hourlyPatterns.forEach(pattern => {
      if (pattern.total > maxTotal) {
        maxTotal = pattern.total;
        peakPattern = pattern;
      }
    });
    
    return peakPattern;
  }, [hourlyPatterns]);

  const isGrowing = predictions.monthlyGrowth >= 0;

  return (
    <div className="space-y-4">
      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-3">
        {/* Día Pico */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-[11px] font-medium text-indigo-300 uppercase tracking-wide">Día Pico</span>
          </div>
          <div className="text-xl font-bold text-foreground capitalize">
            {predictions.busiestDay.label}
          </div>
          <div className="text-[11px] text-muted-foreground">
            ~{predictions.busiestDay.avgCount.toFixed(1)} citas promedio
          </div>
        </div>

        {/* Tendencia */}
        <div className={`bg-gradient-to-br ${isGrowing ? 'from-emerald-900/20 to-green-900/20 border-emerald-500/20' : 'from-rose-900/20 to-red-900/20 border-rose-500/20'} border rounded-lg p-3`}>
          <div className="flex items-center gap-2 mb-2">
            {isGrowing ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            )}
            <span className={`text-[11px] font-medium uppercase tracking-wide ${isGrowing ? 'text-emerald-300' : 'text-rose-300'}`}>
              Tendencia
            </span>
          </div>
          <div className={`text-xl font-bold ${isGrowing ? 'text-emerald-400' : 'text-rose-400'}`}>
            {predictions.monthlyGrowth > 0 ? '+' : ''}{predictions.monthlyGrowth.toFixed(1)}%
          </div>
          <div className="text-[11px] text-muted-foreground">
            vs mes anterior
          </div>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hora Pico */}
        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wide">Hora Pico</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {peakHour ? `${peakHour.hour}:00` : '--:--'}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {peakHour ? `${peakHour.total} citas históricas` : 'Sin datos'}
          </div>
        </div>

        {/* Proyección */}
        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-[11px] font-medium text-blue-300 uppercase tracking-wide">Próx. Semana</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            ~{predictions.predictedNextWeekCount}
          </div>
          <div className="text-[11px] text-muted-foreground">
            citas estimadas
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Promedio diario:</span>
            <span className="font-semibold text-foreground">{stats.avg.toFixed(1)} citas</span>
          </div>
          <div className="text-muted-foreground">
            Máximo: <span className="font-semibold text-foreground">{stats.max}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
