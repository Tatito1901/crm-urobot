'use client';

import React, { memo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

import { ChartData } from '@/hooks/useStats';

export const DashboardSedesChart = memo(function DashboardSedesChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[220px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
