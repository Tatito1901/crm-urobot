'use client';

import dynamic from 'next/dynamic';
import { useStats } from '@/hooks/dashboard/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { Activity } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

// ✅ OPTIMIZACIÓN: Lazy load de Recharts (reduce bundle ~90KB)
const RechartsBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } = mod;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { default: ({ data, CustomTooltip }: { data: any[]; CustomTooltip: React.FC<any> }) => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.2} vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
          <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
            {data.map((entry: { fill?: string }, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill || '#64748b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )};
  }),
  { 
    loading: () => <div className="h-[500px] w-full bg-slate-100 dark:bg-slate-800/20 rounded-lg animate-pulse" />,
    ssr: false 
  }
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | string; payload: { fill: string } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-foreground mb-2">{label}</p>
        {payload?.map((p: { name: string; value: number | string; payload: { fill: string } }, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0 min-w-[120px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.payload.fill }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-medium text-foreground ml-auto">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformancePage() {
  const { estadoCitas, loading } = useStats();

  if (loading) {
    return (
      <PageShell 
        title="Performance Operativo" 
        description="Cargando datos..." 
        fullWidth
        eyebrow="Operaciones"
      >
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Eficiencia"
      title="Performance Operativo"
      description="Métricas de rendimiento de citas, asistencia y eficiencia de la clínica."
    >
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Estado de Citas
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Desglose de citas programadas vs realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] sm:h-[500px] w-full">
            <RechartsBarChart data={estadoCitas} CustomTooltip={CustomTooltip} />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
