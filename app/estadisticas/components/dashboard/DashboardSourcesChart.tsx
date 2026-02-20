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

import { ChartData } from '@/hooks/dashboard/useStats';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number | string; payload: { fill: string } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-foreground mb-2">{payload[0].name}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium text-foreground ml-auto">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardSourcesChart = memo(function DashboardSourcesChart({ data }: { data: ChartData[] }) {
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
            cx="40%"
            cy="50%"
            innerRadius={35}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right" 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: '10px', color: 'var(--chart-slate)', paddingLeft: '8px', maxWidth: '45%' }} 
            formatter={(value) => <span className="truncate block max-w-[80px]">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
