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

import { MonthlyData } from '@/hooks/useStats';

export const DashboardEvolutionChart = memo(function DashboardEvolutionChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="h-[300px] w-full">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
          />
          <Area type="monotone" dataKey="consultas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorConsultas)" name="Consultas" />
          <Area type="monotone" dataKey="pacientes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPacientes)" name="Nuevos Pacientes" />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#94a3b8' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
