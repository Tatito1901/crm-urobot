'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { DemandaDia } from '@/hooks/estadisticas/useClinicalStats';

interface Props {
  data: DemandaDia[];
}

// Colores por día
const dayColors: Record<string, string> = {
  'Dom': 'var(--chart-slate)',
  'Lun': 'var(--chart-blue)',
  'Mar': 'var(--chart-purple)',
  'Mié': 'var(--chart-emerald)',
  'Jue': 'var(--chart-amber)',
  'Vie': 'var(--chart-rose)',
  'Sáb': 'var(--chart-rose)',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: DemandaDia }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-semibold text-foreground mb-1">{item.payload.name}</p>
        <div className="space-y-1">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {item.value} <span className="text-xs font-normal text-muted-foreground">consultas</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Tasa asistencia: <span className="font-semibold text-emerald-600">{item.payload.tasaAsistencia}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardDemandaDias({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] bg-muted/20 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">Sin datos de demanda</p>
      </div>
    );
  }

  // Calcular promedio
  const promedio = Math.round(data.reduce((sum, d) => sum + d.consultas, 0) / data.length);

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'var(--chart-slate)', fontSize: 11, fontWeight: 500 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'var(--chart-slate)', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
          <ReferenceLine 
            y={promedio} 
            stroke="var(--chart-slate)" 
            strokeDasharray="5 5" 
            label={{ 
              value: `Prom: ${promedio}`, 
              position: 'right',
              fill: 'var(--chart-slate)',
              fontSize: 10
            }} 
          />
          <Bar 
            dataKey="consultas" 
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={dayColors[entry.name] || 'var(--chart-slate)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
