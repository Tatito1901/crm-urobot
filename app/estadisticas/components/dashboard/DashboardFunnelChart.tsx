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

import { ChartData } from '@/hooks/useStats';

export const DashboardFunnelChart = memo(function DashboardFunnelChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" stroke="#e2e8f0" fontSize={11} tickLine={false} axisLine={false} width={80} />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} name="Leads">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
