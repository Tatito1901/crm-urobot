'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useBehavioralDistribution } from '@/hooks/urobot/useBehavioralDistribution';
import { Loader2, Brain } from 'lucide-react';

const PERFIL_COLORS: Record<string, string> = {
  decidido: '#10b981',
  interesado_dudoso: '#3b82f6',
  solo_curiosidad: '#9ca3af',
  precio_primero: '#f59e0b',
  urgente: '#ef4444',
};

const PREDICCION_COLORS: Record<string, string> = {
  alta: '#10b981',
  media: '#f59e0b',
  baja: '#f97316',
  muy_baja: '#ef4444',
};

const BARRERA_COLORS: Record<string, string> = {
  precio: '#f59e0b',
  miedo: '#8b5cf6',
  tiempo: '#06b6d4',
  desconfianza: '#ef4444',
  distancia: '#6366f1',
};

function formatLabel(label: string): string {
  return label.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function MiniDonut({ data, colors, title }: { data: { label: string; total: number }[]; colors: Record<string, string>; title: string }) {
  const chartData = useMemo(
    () => data.map((d) => ({ name: formatLabel(d.label), value: d.total, key: d.label })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-[11px] text-muted-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">Sin datos</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-center mb-1">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={colors[entry.key] || '#9ca3af'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '11px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
        {chartData.map((entry) => (
          <div key={entry.key} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: colors[entry.key] || '#9ca3af' }}
            />
            <span className="text-[10px] text-muted-foreground">{entry.name} ({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BehavioralDistributionChart() {
  const { stats, isLoading } = useBehavioralDistribution(30);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  const coverage = stats.total_leads > 0
    ? ((stats.total_con_signals / stats.total_leads) * 100).toFixed(1)
    : '0';

  if (stats.total_con_signals === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Brain className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">Sin perfiles behavioral aún</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Los datos aparecerán cuando Gemini analice leads</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Coverage indicator */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[11px] text-muted-foreground">
          {stats.total_con_signals} de {stats.total_leads} leads con perfil ({coverage}%)
        </span>
      </div>

      {/* 3 mini donuts side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniDonut data={stats.perfiles} colors={PERFIL_COLORS} title="Perfiles" />
        <MiniDonut data={stats.predicciones} colors={PREDICCION_COLORS} title="Predicción" />
        <MiniDonut data={stats.barreras} colors={BARRERA_COLORS} title="Barreras" />
      </div>
    </div>
  );
}
