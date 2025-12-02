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

interface MetricData {
  name: string;
  value: number;
  fill?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number | string; payload: { fill: string } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-foreground dark:text-white mb-2">{payload[0].name}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <span className="text-foreground">Total:</span>
          <span className="font-medium text-foreground dark:text-white ml-auto">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardMensajeriaChart = memo(function DashboardMensajeriaChart({ data, height = 400 }: { data: MetricData[], height?: number }) {
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#64748b' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
