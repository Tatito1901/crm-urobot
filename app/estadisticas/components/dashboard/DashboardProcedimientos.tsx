'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ProcedimientoData } from '@/hooks/estadisticas/useClinicalStats';

interface Props {
  data: ProcedimientoData[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: ProcedimientoData }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{item.payload.name}</p>
        <p className="text-lg font-bold text-white tabular-nums">
          {item.value} <span className="text-xs font-normal text-muted-foreground">procedimientos</span>
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardProcedimientos({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] bg-muted/20 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Sin datos de procedimientos</p>
      </div>
    );
  }

  // Truncar nombres largos
  const formattedData = data.map(item => ({
    ...item,
    shortName: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
          <XAxis 
            dataKey="shortName" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'var(--chart-slate)', fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'var(--chart-slate)', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
