/**
 * ============================================================
 * LOADING STATE - Dashboard
 * ============================================================
 * Evita FOUC y layout shifts durante SSR/navegación
 */

import { MetricCardSkeleton, CardSkeleton, ListItemSkeleton } from '@/app/components/common/SkeletonLoader';

export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-urobot text-white font-sans">
      {/* Efecto de iluminación de fondo */}
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/30 blur-[200px]" />
        <div className="absolute right-[10%] top-[40%] h-[400px] w-[400px] rounded-full bg-blue-400/20 blur-[150px]" />
      </div>
      
      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-24 pt-6 sm:gap-6 sm:px-6 sm:pb-8 sm:pt-8 md:gap-8 lg:pt-8 lg:gap-6 lg:pb-16">
        {/* Header skeleton */}
        <header className="space-y-3 sm:space-y-4 lg:space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
            <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between lg:items-center">
            <div className="space-y-1 sm:space-y-1.5 lg:space-y-1">
              <div className="h-10 w-64 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-96 bg-white/10 rounded animate-pulse max-w-full" />
            </div>
            <div className="h-11 w-32 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </header>

        {/* Métricas skeleton */}
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </section>

        {/* Actividad reciente skeleton */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Leads skeleton */}
          <div className="bg-white/[0.05] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Consultas skeleton */}
          <div className="bg-white/[0.05] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-36 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Gráficos skeleton */}
        <section className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </section>
      </div>
    </div>
  );
}
