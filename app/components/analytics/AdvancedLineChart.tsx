/**
 * ============================================================
 * ADVANCED LINE CHART - Gráfico de líneas mejorado
 * ============================================================
 */

'use client';

import React, { memo, useMemo } from 'react';

export interface LineChartDataPoint {
  label: string;
  value: number;
}

export interface AdvancedLineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showDots?: boolean;
  animate?: boolean;
}

export const AdvancedLineChart = memo(function AdvancedLineChart({
  data,
  height = 250,
  color = '#3b82f6',
  showGrid = true,
  showDots = true,
  animate = true,
}: AdvancedLineChartProps) {
  const { points, path, areaPath } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], max: 0, min: 0, path: '', areaPath: '' };
    }

    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const padding = 20;
    const width = 800;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const stepX = chartWidth / (data.length - 1 || 1);

    const points = data.map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - ((d.value - min) / range) * chartHeight;
      return { x, y, label: d.label, value: d.value };
    });

    // Crear path de línea
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Crear path de área (para relleno)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${
      height - padding
    } L ${padding} ${height - padding} Z`;

    return { points, max, min, path: linePath, areaPath };
  }, [data, height]);

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

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 800 ${height}`}
        className="w-full"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = 20 + ((100 - pct) / 100) * (height - 40);
              return (
                <line
                  key={pct}
                  x1="20"
                  y1={y}
                  x2="780"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>
        )}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#chartGradient)"
          className={animate ? 'animate-fade-in' : ''}
        />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? 'animate-draw-line' : ''}
        />

        {/* Data points */}
        {showDots &&
          points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill={color}
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
              <circle cx={p.x} cy={p.y} r="3" fill="white" />
            </g>
          ))}

        {/* Labels */}
        {points.map((p, i) => {
          // Mostrar solo algunos labels para evitar solapamiento
          if (data.length > 6 && i % 2 !== 0) return null;

          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              className="text-xs fill-slate-400"
            >
              {p.label}
            </text>
          );
        })}

        {/* Value labels (en hover) */}
        {points.map((p, i) => (
          <g key={`value-${i}`} className="opacity-0 hover:opacity-100 transition-opacity">
            <rect
              x={p.x - 25}
              y={p.y - 30}
              width="50"
              height="20"
              rx="4"
              fill="rgba(0,0,0,0.8)"
            />
            <text
              x={p.x}
              y={p.y - 16}
              textAnchor="middle"
              className="text-xs fill-white font-semibold"
            >
              {p.value}
            </text>
          </g>
        ))}
      </svg>

      <style jsx>{`
        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-draw-line {
          animation: draw-line 1.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
});
