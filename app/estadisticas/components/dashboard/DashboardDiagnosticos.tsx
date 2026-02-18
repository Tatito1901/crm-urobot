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
import type { DiagnosticoData } from '@/hooks/estadisticas/useClinicalStats';

interface Props {
  data: DiagnosticoData[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: DiagnosticoData }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{item.payload.name}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
          {item.value} <span className="text-xs font-normal text-muted-foreground">casos</span>
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardDiagnosticos({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Sin datos de diagnósticos</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            width={95}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
