'use client';

import { useStats } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Target } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | string; payload: { fill: string } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
        {payload?.map((p: { name: string; value: number | string; payload: { fill: string } }, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0 min-w-[120px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.payload.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
            <span className="font-medium text-slate-900 dark:text-white ml-auto">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function FunnelPage() {
  const { funnelLeads, loading } = useStats();

  if (loading) {
    return (
      <PageShell 
        title="Funnel de Conversión" 
        description="Cargando datos..." 
        fullWidth
        eyebrow="Análisis"
      >
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Conversión"
      title="Funnel de Conversión"
      description="Análisis detallado del flujo de leads desde la captura hasta el cierre."
    >
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Embudo General
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Visualización del proceso de ventas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelLeads} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.2} horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  width={100} 
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                  {funnelLeads.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
