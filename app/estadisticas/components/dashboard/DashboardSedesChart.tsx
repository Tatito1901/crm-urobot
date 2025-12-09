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

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number | string; payload: { fill: string } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{payload[0].name}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <span className="text-foreground">Total:</span>
          <span className="font-medium text-slate-900 dark:text-white ml-auto">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardSedesChart = memo(function DashboardSedesChart({ data }: { data: ChartData[] }) {
  // Si no hay datos, mostrar estado vacío
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground text-sm">
        Sin datos disponibles
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: '10px', paddingTop: '5px', color: '#64748b' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
