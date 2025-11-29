/**
 * ============================================================
 * LOADING STATE - Pacientes
 * ============================================================
 * Evita FOUC y layout shifts durante SSR/navegación
 */

import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TableContentSkeleton, CardSkeleton } from '@/app/components/common/SkeletonLoader';

export default function PacientesLoading() {
  return (
    <PageShell
      accent
      eyebrow="Pacientes"
      title="Carpeta clínica activa"
      description="Cargando información de pacientes..."
      headerSlot={
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <div className="h-4 w-16 bg-white/10 rounded " />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-10 w-full bg-white/10 rounded " />
          </CardContent>
        </Card>
      }
    >
      {/* Resumen cards skeleton */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </section>

      {/* Tabla skeleton */}
      <Card className="bg-white/[0.03] min-h-[600px]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-white/10 rounded " />
              <div className="h-4 w-64 bg-white/10 rounded " />
            </div>
            <div className="h-8 w-8 bg-white/10 rounded " />
          </div>
        </CardHeader>
        <CardContent>
          <TableContentSkeleton rows={8} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
