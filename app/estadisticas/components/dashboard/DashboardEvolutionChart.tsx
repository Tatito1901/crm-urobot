'use client';

import React, { memo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

import { MonthlyData } from '@/hooks/dashboard/useStats';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
        {payload?.map((p: { name: string; value: number | string; color: string }, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0 min-w-[120px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-foreground">{p.name}:</span>
            <span className="font-medium text-slate-900 dark:text-white ml-auto">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardEvolutionChart = memo(function DashboardEvolutionChart({ data }: { data: MonthlyData[] }) {
  // Si no hay datos, mostrar estado vacío
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground text-sm">
        Sin datos de evolución disponibles
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.2} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b' }}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="consultas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorConsultas)" name="Consultas" />
          <Area type="monotone" dataKey="pacientes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPacientes)" name="Pacientes" />
          <Legend 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: '10px', paddingTop: '8px', color: '#64748b' }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
