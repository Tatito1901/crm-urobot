'use client';

import dynamic from 'next/dynamic';
import { useStats } from '@/hooks/dashboard/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { Target } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamicConfig = 'force-dynamic';

// Lazy Load del gráfico pesado
const FunnelChart = dynamic(() => import('../components/dashboard/DashboardFunnelChart').then(mod => mod.DashboardFunnelChart), {
  loading: () => <Skeleton className="h-[500px] w-full" />,
  ssr: false
});

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
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Embudo General
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Visualización del proceso de ventas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart data={funnelLeads} height={500} barSize={40} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
