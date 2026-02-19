'use client';

import React, { memo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

import { ChartData } from '@/hooks/dashboard/useStats';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | string; payload: { fill: string } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-white mb-2">{label}</p>
        {payload?.map((p: { name: string; value: number | string; payload: { fill: string } }, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0 min-w-[120px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.payload.fill }} />
            <span className="text-foreground">{p.name}:</span>
            <span className="font-medium text-white ml-auto">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardFunnelChart = memo(function DashboardFunnelChart({ data, height = 280, barSize = 20 }: { data: ChartData[], height?: number, barSize?: number }) {
  // Si no hay datos, mostrar estado vacío
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground text-sm">
        Sin datos de embudo disponibles
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-slate)" strokeOpacity={0.2} horizontal={false} />
          <XAxis 
            type="number" 
            stroke="var(--chart-slate)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--chart-slate)' }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="var(--chart-slate)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            width={70} 
            tick={{ fill: 'var(--chart-slate)' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
            content={<CustomTooltip />}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={barSize} name="Leads">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
