/**
 * ============================================================
 * DONUT CHART - Gráfico de dona mejorado
 * ============================================================
 */


import React, { memo } from 'react';

export interface DonutChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutChartDataPoint[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  centerText?: string;
  centerSubtext?: string;
}

export const DonutChart = memo(function DonutChart({
  data,
  size = 200,
  thickness = 30,
  showLegend = true,
  centerText,
  centerSubtext,
}: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-slate-400"
        style={{ width: size, height: size }}
      >
        No hay datos
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={thickness}
          />

          {/* Data segments */}
          {data.map((item, index) => {
            const percentage = item.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercentage * circumference;

            accumulatedPercentage += percentage;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-80"
                style={{
                  filter: `drop-shadow(0 0 8px ${item.color}80)`,
                }}
              />
            );
          })}
        </svg>

        {/* Center text */}
        {(centerText || centerSubtext) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerText && (
              <div className="text-3xl font-bold text-white">{centerText}</div>
            )}
            {centerSubtext && (
              <div className="text-sm text-slate-400">{centerSubtext}</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 justify-center">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300">
                  {item.label}: <span className="font-semibold">{item.value}</span>{' '}
                  <span className="text-slate-400">({percentage}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
