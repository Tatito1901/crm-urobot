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
import { Share2 } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

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
      <Card className="bg-slate-950 border-slate-800">
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-pink-400" />
            Distribución por Fuente
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Origen de los leads registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fuentesCaptacion}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={160}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Desconocido'} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {fuentesCaptacion.map((entry, index) => (
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
    </PageShell>
  );
}
