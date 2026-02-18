'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLeadsByCampaign } from '@/hooks/urobot/useLeadsByCampaign';
import { Loader2, Megaphone } from 'lucide-react';

export default function CampaignLeadsChart() {
  const { stats, isLoading } = useLeadsByCampaign(30);

  const chartData = useMemo(() => {
    return stats.campaigns.map((c) => ({
      name: c.campana.length > 25 ? c.campana.substring(0, 25) + '…' : c.campana,
      fullName: c.campana,
      leads: c.total_leads,
      convertidos: c.convertidos,
      calientes: c.calientes,
    }));
  }, [stats.campaigns]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Megaphone className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">Sin datos de campañas</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Los datos aparecerán cuando lleguen leads de Meta Ads</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="px-3 py-2 bg-blue-500/10 rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Meta Ads</p>
          <p className="text-lg font-bold tabular-nums text-blue-500">{stats.total_meta_ads}</p>
        </div>
        <div className="px-3 py-2 bg-secondary/50 rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Orgánico</p>
          <p className="text-lg font-bold tabular-nums text-foreground">{stats.total_organico}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="leads" name="Total" fill="var(--chart-blue, #3b82f6)" radius={[0, 4, 4, 0]} maxBarSize={20} />
          <Bar dataKey="convertidos" name="Convertidos" fill="var(--chart-emerald, #10b981)" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
