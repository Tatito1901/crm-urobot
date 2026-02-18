'use client';

import dynamic from 'next/dynamic';
import { useStats } from '@/hooks/dashboard/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { Share2 } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

// ✅ OPTIMIZACIÓN: Lazy load de Recharts PieChart
const RechartsPieChart = dynamic(
  () => import('recharts').then(mod => {
    const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } = mod;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { default: ({ data }: { data: any[] }) => (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={160}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
          >
            {data.map((entry: { fill?: string }, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill || 'var(--chart-slate)'} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0];
                return (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs shadow-lg">
                    <p className="font-bold text-foreground mb-2">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: String(p.payload?.fill || 'var(--chart-slate)') }} />
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium text-foreground ml-auto">{p.value}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: 'var(--chart-slate)' }} />
        </PieChart>
      </ResponsiveContainer>
    )};
  }),
  { 
    loading: () => <div className="h-[500px] w-full bg-slate-100 dark:bg-slate-800/20 rounded-lg animate-pulse flex items-center justify-center"><div className="w-40 h-40 rounded-full bg-slate-200 dark:bg-slate-700" /></div>,
    ssr: false 
  }
);

export default function CanalesPage() {
  const { fuentesCaptacion, loading } = useStats();

  if (loading) {
    return (
      <PageShell 
        title="Canales de Marketing" 
        description="Cargando datos..." 
        fullWidth
        eyebrow="Adquisición"
      >
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Marketing"
      title="Canales de Captación"
      description="Análisis de fuentes de adquisición de leads y pacientes."
    >
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Share2 className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            Distribución por Fuente
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Origen de los leads registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] sm:h-[500px] w-full flex items-center justify-center">
            <RechartsPieChart data={fuentesCaptacion} />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
