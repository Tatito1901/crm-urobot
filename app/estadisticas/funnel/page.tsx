'use client';

import { useStats } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing } from '@/app/lib/design-system';
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
      <Card className="bg-slate-950 border-slate-800">
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Embudo General
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Visualización del proceso de ventas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelLeads} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#e2e8f0" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
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
