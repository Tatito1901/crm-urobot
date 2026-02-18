'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartData } from '@/hooks/urobot/useUrobotStats';

interface InteractionsPieChartProps {
  data: ChartData[];
  title?: string;
  innerRadius?: number;
}

// Custom tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
  if (!active || !payload || !payload[0]) return null;
  
  const data = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }} />
        <span className="text-sm font-medium text-foreground">{data.name}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{data.value} interacciones</p>
    </div>
  );
};

// Custom legend
const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-muted-foreground capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const InteractionsPieChart = React.memo(function InteractionsPieChart({ 
  data, 
  title = 'Tipos de Interacción',
  innerRadius = 0,
}: InteractionsPieChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Sin datos de interacciones
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data as unknown as Record<string, unknown>[]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={60}
                innerRadius={innerRadius}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill || '#94a3b8'} 
                    className="stroke-background"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

InteractionsPieChart.displayName = 'InteractionsPieChart';
