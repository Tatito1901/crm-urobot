'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { EvolucionMes } from '@/hooks/estadisticas/useImpactStats';

interface TrendChartProps {
  data: EvolucionMes[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        Sin datos históricos disponibles
      </div>
    );
  }

  // Transformar datos para el gráfico
  const chartData = data.map(item => ({
    name: item.mes_corto,
    consultas: item.consultas,
    completadas: item.completadas,
    pacientes: item.pacientes_unicos,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-blue)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--chart-blue)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-emerald)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--chart-emerald)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-slate)" strokeOpacity={0.15} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--chart-slate)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: 'var(--chart-slate)' }}
          />
          <YAxis 
            stroke="var(--chart-slate)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: 'var(--chart-slate)' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
          <Area
            type="monotone"
            dataKey="consultas"
            name="Programadas"
            stroke="var(--chart-blue)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorConsultas)"
          />
          <Area
            type="monotone"
            dataKey="completadas"
            name="Completadas"
            stroke="var(--chart-emerald)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCompletadas)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
