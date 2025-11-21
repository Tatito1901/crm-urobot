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

interface MensajeriaChartProps {
  data: ChartData[];
}

export const MensajeriaChart = memo(function MensajeriaChart({ data }: MensajeriaChartProps) {
  return (
    <div className="h-[400px] w-full flex items-center justify-center">
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
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b', 
              borderRadius: '8px', 
              fontSize: '12px', 
              color: '#fff' 
            }}
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ 
              fontSize: '12px', 
              paddingTop: '20px', 
              color: '#94a3b8' 
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
