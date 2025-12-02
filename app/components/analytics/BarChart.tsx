/**
 * ============================================================
 * BAR CHART - Gráfico de barras ligero con Recharts
 * ============================================================
 * Componente optimizado para visualizar comparaciones
 */

'use client';

import React, { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CustomTooltipPayload {
  value: number;
  payload: {
    label: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
}

interface BarChartData {
  label: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
}

// Tooltip memoizado para evitar recreación en cada render
const CustomTooltip = React.memo(({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-md px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-0.5">
          {data.payload.label}
        </p>
        <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
          {data.value}
        </p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

export const BarChart: React.FC<BarChartProps> = React.memo(({ data, height = 200 }) => {
  const hasData = useMemo(() => data.length > 0 && data.some((d) => d.value > 0), [data]);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center w-full bg-slate-100 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-800/50 border-dashed"
        style={{ height }}
      >
        <p className="text-xs text-slate-500 font-medium">Sin datos disponibles</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.05)', radius: 4 }}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
            animationDuration={1000}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
});

BarChart.displayName = 'BarChart';
