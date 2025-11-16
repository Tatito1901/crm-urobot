/**
 * ============================================================
 * LOADING STATE - Métricas
 * ============================================================
 */

import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { CardSkeleton } from '@/app/components/common/ContentLoader';

export default function MetricasLoading() {
  return (
    <PageShell
      accent
      eyebrow="Analytics"
      title="Métricas y reportes"
      description="Cargando métricas..."
    >
      {/* KPIs principales */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </section>

      {/* Gráficos */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-4">
            <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-48 bg-white/10 rounded animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-white/5 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
        
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-4">
            <div className="h-5 w-36 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-52 bg-white/10 rounded animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-white/5 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
      </section>

      {/* Tablas de datos */}
      <section className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </section>
    </PageShell>
  );
}
