'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { ChartData } from '@/hooks/urobot/useUrobotStats';

interface HorizontalBarChartProps {
  data: ChartData[];
  title: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

// Custom tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string; name: string } }> }) => {
  if (!active || !payload || !payload[0]) return null;
  
  const data = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
      <p className="text-sm font-medium text-foreground">{data.payload.name}</p>
      <p className="text-xs text-muted-foreground">{data.value} veces</p>
    </div>
  );
};

export const HorizontalBarChart = React.memo(function HorizontalBarChart({ 
  data, 
  title,
  emptyMessage = 'Sin datos',
  emptyIcon = <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
}: HorizontalBarChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            {emptyIcon}
            <span className="text-sm">{emptyMessage}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Truncar nombres largos para mobile
  const processedData = data.map(d => ({
    ...d,
    displayName: d.name.length > 15 ? d.name.slice(0, 12) + '...' : d.name,
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis 
                type="number" 
                tick={{ fontSize: 10 }} 
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="displayName" 
                tick={{ fontSize: 9 }} 
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

HorizontalBarChart.displayName = 'HorizontalBarChart';
