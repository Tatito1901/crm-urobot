'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TendenciaMensual } from '@/hooks/estadisticas/useClinicalStats';

interface Props {
  data: TendenciaMensual[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="text-xs font-bold text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardTendenciaSedes({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] bg-muted/20 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Sin datos de tendencia</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPolanco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSatelite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
          <XAxis 
            dataKey="mes" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => <span className="text-xs capitalize text-muted-foreground">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="polanco"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPolanco)"
          />
          <Area
            type="monotone"
            dataKey="satelite"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSatelite)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
