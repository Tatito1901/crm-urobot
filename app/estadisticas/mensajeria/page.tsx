'use client';

import { useStats } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number | string; payload: { fill: string } }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{payload[0].name}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <span className="text-slate-500 dark:text-slate-400">Total:</span>
          <span className="font-medium text-slate-900 dark:text-white ml-auto">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function MensajeriaPage() {
  const { metricasMensajeria, loading } = useStats();

  if (loading) {
    return (
      <PageShell 
        title="Mensajería" 
        description="Cargando datos..." 
        fullWidth
        eyebrow="Interacción"
      >
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Engagement"
      title="Mensajería"
      description="Métricas de interacción conversacional entre el bot, agentes y pacientes."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Volumen de Mensajes
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Enviados vs Recibidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metricasMensajeria}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metricasMensajeria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Aquí se podrían agregar más métricas detalladas de tiempo de respuesta, etc. */}
      </div>
    </PageShell>
  );
}
