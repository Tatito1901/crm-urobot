/**
 * ============================================================
 * LOADING STATE - Confirmaciones
 * ============================================================
 */

import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { TableContentSkeleton, CardSkeleton } from '@/app/components/common/ContentLoader';

export default function ConfirmacionesLoading() {
  return (
    <PageShell
      accent={false}
      eyebrow="Confirmaciones"
      title="Gestión de confirmaciones"
      description="Cargando confirmaciones..."
      headerSlot={
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
          </CardContent>
        </Card>
      }
    >
      {/* Stats skeleton */}
      <section className="grid gap-4 sm:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </section>

      {/* Content skeleton */}
      <Card className="bg-white/[0.03] min-h-[600px]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-72 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <TableContentSkeleton rows={8} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
