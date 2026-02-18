'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useConversationFunnel } from '@/hooks/urobot/useConversationFunnel';
import { FASE_DISPLAY } from '@/types/chat';
import { Loader2, TrendingUp, AlertTriangle } from 'lucide-react';

const PHASE_COLORS: Record<string, string> = {
  bienvenida: 'var(--chart-slate, #64748b)',
  descubrimiento: 'var(--chart-blue, #3b82f6)',
  horarios_dados: 'var(--chart-cyan, #06b6d4)',
  oferta_cita: 'var(--chart-violet, #8b5cf6)',
  confirmacion: 'var(--chart-emerald, #10b981)',
  precio_dado: 'var(--chart-amber, #f59e0b)',
  ubicacion_dada: 'var(--chart-teal, #14b8a6)',
  escalamiento: 'var(--chart-red, #ef4444)',
  seguimiento: 'var(--chart-indigo, #6366f1)',
  conversacion: 'var(--chart-gray, #9ca3af)',
};

export default function ConversationFunnelChart() {
  const { stats, isLoading } = useConversationFunnel(30);

  const chartData = useMemo(() => {
    return stats.fases.map((f) => ({
      fase: FASE_DISPLAY[f.fase]?.label || f.fase,
      faseKey: f.fase,
      total: f.total,
      porcentaje: f.porcentaje,
    }));
  }, [stats.fases]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">Sin datos de fases aún</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Los datos aparecerán cuando el bot clasifique mensajes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="px-3 py-2 bg-secondary/50 rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Mensajes</p>
          <p className="text-lg font-bold tabular-nums text-foreground">{stats.total_mensajes_clasificados}</p>
        </div>
        <div className="px-3 py-2 bg-emerald-500/10 rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Confirmación</p>
          <p className="text-lg font-bold tabular-nums text-emerald-500">{stats.tasa_confirmacion.toFixed(1)}%</p>
        </div>
        <div className="px-3 py-2 bg-red-500/10 rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Escalamiento</p>
          <p className="text-lg font-bold tabular-nums text-red-500">{stats.tasa_escalamiento.toFixed(1)}%</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="fase"
            type="category"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, _name: string, props: { payload?: { porcentaje: number } }) => [
              `${value} msgs (${props.payload?.porcentaje?.toFixed(1) ?? 0}%)`,
              'Total',
            ]}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {chartData.map((entry) => (
              <Cell key={entry.faseKey} fill={PHASE_COLORS[entry.faseKey] || '#9ca3af'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
