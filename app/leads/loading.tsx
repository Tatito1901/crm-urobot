/**
 * ============================================================
 * LOADING STATE - Leads
 * ============================================================
 * Evita FOUC y layout shifts durante SSR/navegación
 */

import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { TableContentSkeleton } from '@/app/components/common/ContentLoader';

export default function LeadsLoading() {
  return (
    <PageShell
      accent
      eyebrow="Pipeline"
      title="Leads activos"
      description="Cargando información de leads..."
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
      <Card className="bg-white/[0.03] min-h-[600px]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-56 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <TableContentSkeleton rows={8} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
