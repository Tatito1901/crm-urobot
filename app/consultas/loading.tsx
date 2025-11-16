/**
 * ============================================================
 * LOADING STATE - Consultas
 * ============================================================
 */

import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { TableContentSkeleton, CardSkeleton } from '@/app/components/common/ContentLoader';

export default function ConsultasLoading() {
  return (
    <PageShell
      accent={false}
      eyebrow="Consultas"
      title="Consultas programadas"
      description="Cargando información de consultas..."
      headerSlot={
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader className="pb-2">
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              <div className="h-2 w-24 bg-white/10 rounded animate-pulse mt-1" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader className="pb-2">
              <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="flex gap-2 pt-0">
              <div className="h-8 flex-1 bg-white/10 rounded animate-pulse" />
              <div className="h-8 flex-1 bg-white/10 rounded animate-pulse" />
              <div className="h-8 flex-1 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      }
    >
      {/* Resumen cards skeleton */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </section>

      {/* Tabla skeleton */}
      <Card className="bg-white/[0.03] min-h-[600px]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <TableContentSkeleton rows={10} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
