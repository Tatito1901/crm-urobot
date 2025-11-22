'use client';

import { useStats } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing } from '@/app/lib/design-system';
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
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Volumen de Mensajes
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
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
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#94a3b8' }} />
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
