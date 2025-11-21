'use client';

import { useStats } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cards, spacing } from '@/app/lib/design-system';
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
import { Activity } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

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
      <Card className="bg-slate-950 border-slate-800">
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Estado de Citas
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Desglose de citas programadas vs realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estadoCitas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                  {estadoCitas.map((entry, index) => (
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
