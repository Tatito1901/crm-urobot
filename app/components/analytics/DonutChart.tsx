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
  thickness: _thickness = 40, // Reserved for future use
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

  // Tamaño responsivo
  const responsiveSize = Math.min(size, 200);

  return (
    <div className="relative flex flex-col items-center gap-3 sm:gap-4 w-full">
      {/* Gráfico */}
      <div 
        className="relative mx-auto"
        style={{ 
          width: '100%', 
          maxWidth: responsiveSize, 
          aspectRatio: '1 / 1' 
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={2}
              dataKey="value"
              animationDuration={800}
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
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{centerText}</div>
            )}
            {centerSubtext && (
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium">{centerSubtext}</div>
            )}
          </div>
        )}
      </div>

      {/* Leyenda responsiva */}
      <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
        {validData.map((item) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          
          return (
            <div
              key={item.label}
              className="flex items-center justify-between text-[11px] sm:text-xs group hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded px-2 py-1 sm:py-1.5 transition-colors cursor-default"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-foreground font-medium truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                <span className="text-slate-900 dark:text-white font-semibold tabular-nums">{item.value}</span>
                <span className="text-slate-500 text-[9px] sm:text-[10px]">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DonutChart.displayName = 'DonutChart';
