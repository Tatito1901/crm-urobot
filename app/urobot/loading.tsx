import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot } from 'lucide-react';

function SkeletonCard() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="w-10 h-10 bg-muted animate-pulse rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 animate-pulse rounded" style={{ height }} />
      </CardContent>
    </Card>
  );
}

export default function UrobotLoading() {
  return (
    <PageShell
      eyebrow="Monitoreo"
      title={
        <div className="flex items-center gap-3">
          <Bot className="w-7 h-7 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          <span className="text-xl">Estado de UroBot</span>
        </div>
      }
      description="Cargando métricas..."
    >
      {/* KPIs Skeleton - 2 filas de 4 */}
      <section className="space-y-4 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`row1-${i}`} />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`row2-${i}`} />
          ))}
        </div>
      </section>

      {/* Charts Skeleton - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Charts Skeleton - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ChartSkeleton height={180} />
        <ChartSkeleton height={180} />
        <ChartSkeleton height={180} />
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={250} />
        <ChartSkeleton height={250} />
      </div>
    </PageShell>
  );
}
