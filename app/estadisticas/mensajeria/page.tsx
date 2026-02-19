'use client';

import dynamic from 'next/dynamic';
import { useStats } from '@/hooks/dashboard/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamicConfig = 'force-dynamic';

// Lazy Load
const MensajeriaChart = dynamic(() => import('../components/dashboard/DashboardMensajeriaChart').then(mod => mod.DashboardMensajeriaChart), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
  ssr: false
});

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
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Volumen de Mensajes
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Enviados vs Recibidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <MensajeriaChart data={metricasMensajeria} height={400} />
            </div>
          </CardContent>
        </Card>
        
        {/* Aquí se podrían agregar más métricas detalladas de tiempo de respuesta, etc. */}
      </div>
    </PageShell>
  );
}
