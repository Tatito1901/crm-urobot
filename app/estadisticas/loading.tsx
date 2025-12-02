import { Skeleton } from '@/app/components/common/SkeletonLoader';
import { PageShell } from '@/app/components/crm/page-shell';

export default function StatsLoading() {
  return (
    <PageShell
      eyebrow="Análisis"
      title="Estadísticas"
      description="Cargando métricas..."
      fullWidth
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </PageShell>
  );
}
