'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

interface SparklineData {
  fecha: string;
  count: number;
}

interface CustomTooltipPayload {
  value: number;
  payload: {
    fecha: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
}

const SparklineTooltip = React.memo(({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    const date = new Date(d.payload.fecha + 'T12:00:00');
    const label = date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
    return (
      <div className="bg-card border border-border rounded-md px-2.5 py-1.5 shadow-xl text-xs">
        <p className="text-muted-foreground capitalize">{label}</p>
        <p className="font-bold text-foreground tabular-nums">{d.value}</p>
      </div>
    );
  }
  return null;
});

SparklineTooltip.displayName = 'SparklineTooltip';

interface SparklineChartProps {
  data: SparklineData[];
  color?: string;
  height?: number;
  gradientId?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = React.memo(({
  data,
  color = 'var(--chart-blue)',
  height = 60,
  gradientId = 'sparkGrad',
}) => {
  const hasData = useMemo(() => data.length > 0 && data.some(d => d.count > 0), [data]);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center w-full text-xs text-muted-foreground" style={{ height }}>
        Sin datos
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="fecha" hide />
          <Tooltip content={<SparklineTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

SparklineChart.displayName = 'SparklineChart';
