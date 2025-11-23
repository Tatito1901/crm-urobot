/**
 * ============================================================
 * DONUT CHART - Gráfico de dona ligero con Recharts
 * ============================================================
 * Componente optimizado para visualizar distribuciones porcentuales
 */

'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartData {
  label: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  thickness?: number;
  centerText?: string;
  centerSubtext?: string;
}

export const DonutChart: React.FC<DonutChartProps> = React.memo(({
  data,
  size = 200,
  thickness = 40,
  centerText,
  centerSubtext,
}) => {
  // Filtrar datos con valor 0 y memoizar resultado
  const validData = useMemo(() => data.filter((d) => d.value > 0), [data]);
  const total = useMemo(() => validData.reduce((sum, item) => sum + item.value, 0), [validData]);

  if (validData.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-100 dark:bg-slate-800/20 rounded-full border border-slate-200 dark:border-slate-800/50 border-dashed"
        style={{ width: size, height: size }}
      >
        <p className="text-xs text-slate-500 font-medium">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Gráfico */}
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              innerRadius={size / 2 - thickness}
              outerRadius={size / 2}
              paddingAngle={2}
              dataKey="value"
              animationDuration={1000}
              animationBegin={0}
              stroke="none"
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centro con texto */}
        {(centerText || centerSubtext) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            {centerText && (
              <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{centerText}</div>
            )}
            {centerSubtext && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{centerSubtext}</div>
            )}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex flex-col gap-2 w-full max-w-[240px]">
        {validData.map((item) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          
          return (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs group hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded px-2 py-1.5 transition-colors cursor-default"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white/5"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[100px]">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900 dark:text-white font-semibold tabular-nums">{item.value}</span>
                <span className="text-slate-500 text-[10px]">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DonutChart.displayName = 'DonutChart';
