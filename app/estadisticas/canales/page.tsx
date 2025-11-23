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
import { Share2 } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

const CustomTooltip = ({ active, payload, label }: any) => {
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
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            Distribución por Fuente
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
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
    </PageShell>
  );
}
