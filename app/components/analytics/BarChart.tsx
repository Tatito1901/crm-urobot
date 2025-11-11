/**
 * ============================================================
 * BAR CHART - Gráfico de barras vertical mejorado
 * ============================================================
 */

'use client';

import React, { memo } from 'react';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  showValues?: boolean;
  animate?: boolean;
}

export const BarChart = memo(function BarChart({
  data,
  height = 300,
  showValues = true,
  animate = true,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-slate-400"
        style={{ height }}
      >
        No hay datos para mostrar
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="flex items-end justify-around h-full gap-2 px-4">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const color = item.color || '#3b82f6';

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-end flex-1 gap-2"
            >
              {/* Value label */}
              {showValues && (
                <span className="text-sm font-semibold text-slate-300">
                  {item.value}
                </span>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                  animate ? 'hover:opacity-80' : ''
                }`}
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${color}40`,
                  animation: animate ? `slideUp 0.8s ease-out ${index * 0.1}s both` : 'none',
                }}
              />

              {/* Label */}
              <span className="text-xs text-slate-400 text-center mt-2">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});
