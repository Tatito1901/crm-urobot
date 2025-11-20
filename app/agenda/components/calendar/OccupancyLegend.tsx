/**
 * ============================================================
 * OCCUPANCY LEGEND - Leyenda del heatmap de ocupación
 * ============================================================
 * Muestra una leyenda visual para entender los niveles de ocupación
 */

'use client';

import React from 'react';
import { useOccupancyHeatmap, getOccupancyColors } from '../../hooks/useOccupancyHeatmap';
import { BarChart3 } from 'lucide-react';

export const OccupancyLegend: React.FC = () => {
  const { stats } = useOccupancyHeatmap();

  const levels = [
    { level: 'low' as const, label: 'Baja', range: '1-25%' },
    { level: 'medium' as const, label: 'Media', range: '26-50%' },
    { level: 'high' as const, label: 'Alta', range: '51-75%' },
    { level: 'very-high' as const, label: 'Muy Alta', range: '76-100%' },
  ];

  return (
    <div className="px-4 py-3 border-t border-slate-800/40">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Ocupación Histórica
        </h4>
      </div>
      
      <div className="space-y-1.5">
        {levels.map(({ level, label, range }) => {
          const colors = getOccupancyColors(level);
          return (
            <div key={level} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors.indicator}`} />
                <span className="text-slate-300">{label}</span>
              </div>
              <span className="text-slate-500 text-[10px]">{range}</span>
            </div>
          );
        })}
      </div>

      {/* Estadísticas globales */}
      {stats.total > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-800/40 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Promedio/día:</span>
            <span className="text-slate-200 font-semibold">{Math.round(stats.avg)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Máximo:</span>
            <span className="text-emerald-400 font-semibold">{stats.max}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Total histórico:</span>
            <span className="text-blue-400 font-semibold">{stats.total}</span>
          </div>
        </div>
      )}
    </div>
  );
};
