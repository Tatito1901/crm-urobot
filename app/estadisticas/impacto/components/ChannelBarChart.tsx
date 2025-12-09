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
  LabelList
} from 'recharts';
import type { CanalRendimiento } from '@/hooks/useImpactStats';

interface ChannelBarChartProps {
  data: CanalRendimiento[];
}

// Colores para cada canal
const CANAL_COLORS: Record<string, string> = {
  'Facebook Ads': '#1877f2',
  'Google Ads': '#ea4335',
  'Instagram Ads': '#e4405f',
  'Orgánico': '#10b981',
  'Referido': '#8b5cf6',
  'WhatsApp Directo': '#25d366',
  'Doctoralia': '#00b8a9',
  'Otro': '#64748b',
};

function getColor(canal: string): string {
  return CANAL_COLORS[canal] || '#64748b';
}

export function ChannelBarChart({ data }: ChannelBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        Sin datos de canales disponibles
      </div>
    );
  }

  // Transformar y ordenar datos
  const chartData = data
    .map(item => ({
      canal: item.canal,
      leads: item.leads_total,
      convertidos: item.leads_convertidos,
      tasa: item.tasa_conversion,
      consultas: item.consultas_completadas,
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.15} horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            type="category"
            dataKey="canal"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#64748b' }}
            width={100}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'leads') return [value, 'Leads'];
              if (name === 'convertidos') return [value, 'Convertidos'];
              return [value, name];
            }}
            labelFormatter={(label) => `Canal: ${label}`}
          />
          <Bar 
            dataKey="leads" 
            name="leads"
            radius={[0, 4, 4, 0]}
            barSize={20}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.canal)} fillOpacity={0.8} />
            ))}
            <LabelList 
              dataKey="tasa" 
              position="right" 
              formatter={(value) => `${value}%`}
              style={{ fontSize: '10px', fill: '#64748b' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
