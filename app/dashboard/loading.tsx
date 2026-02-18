/**
 * ============================================================
 * LOADING STATE - Dashboard
 * ============================================================
 * Evita FOUC y layout shifts durante SSR/navegación
 */

import { MetricCardSkeleton, CardSkeleton, ListItemSkeleton } from '@/app/components/common/SkeletonLoader';

export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
        <div className="absolute left-1/3 top-[-15%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-[160px] dark:bg-teal-500/20" />
        <div className="absolute right-[10%] top-[5%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-500/15" />
      </div>
      
      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-24 pt-6 sm:gap-6 sm:px-6 sm:pb-8 sm:pt-8 md:gap-8 lg:pt-8 lg:gap-6 lg:pb-16">
        {/* Header skeleton */}
        <header className="space-y-3 sm:space-y-4 lg:space-y-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 rounded-full bg-gradient-to-r from-teal-500/40 to-cyan-500/40" />
            <div className="h-3 w-28 bg-white/[0.05] rounded" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between lg:items-center">
            <div className="space-y-1.5">
              <div className="h-8 w-48 bg-white/[0.06] rounded-lg" />
              <div className="h-4 w-72 bg-white/[0.04] rounded max-w-full" />
            </div>
            <div className="h-9 w-28 bg-white/[0.05] rounded-xl" />
          </div>
        </header>

        {/* Métricas skeleton */}
        <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-fade-up stagger-2">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </section>

        {/* Actividad reciente skeleton */}
        <section className="grid gap-6 lg:grid-cols-2 animate-fade-up stagger-3">
          {/* Leads skeleton */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4 shine-top">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/[0.06] rounded" />
                <div className="h-3 w-44 bg-white/[0.04] rounded" />
              </div>
              <div className="h-6 w-14 bg-white/[0.05] rounded-full" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Consultas skeleton */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4 shine-top">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-36 bg-white/[0.06] rounded" />
                <div className="h-3 w-32 bg-white/[0.04] rounded" />
              </div>
              <div className="h-6 w-16 bg-white/[0.05] rounded-full" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Gráficos skeleton */}
        <section className="grid gap-6 lg:grid-cols-2 animate-fade-up stagger-4">
          <CardSkeleton />
          <CardSkeleton />
        </section>
      </div>
    </div>
  );
}
