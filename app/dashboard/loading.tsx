/**
 * ============================================================
 * LOADING STATE - Dashboard
 * ============================================================
 * Matches the new tab-less layout: Header → Hero KPIs → Activity → Charts
 */

import { MetricCardSkeleton, CardSkeleton, ListItemSkeleton } from '@/app/components/common/SkeletonLoader';

export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] opacity-25 overflow-hidden" aria-hidden>
        <div className="absolute left-1/4 top-[-10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-teal-500/20 blur-[180px] dark:bg-teal-500/25" />
        <div className="absolute right-[5%] top-[8%] h-[350px] w-[350px] rounded-full bg-cyan-500/12 blur-[140px] dark:bg-cyan-500/18" />
        <div className="absolute left-[60%] top-[20%] h-[200px] w-[200px] rounded-full bg-indigo-500/8 blur-[100px] dark:bg-indigo-500/12" />
      </div>
      
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10">
        {/* Header skeleton */}
        <header className="animate-fade-up">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="h-[3px] w-8 rounded-full bg-gradient-to-r from-teal-500/40 to-cyan-500/40" />
                <div className="h-3 w-24 bg-white/[0.05] rounded" />
              </div>
              <div className="h-8 w-44 bg-white/[0.06] rounded-lg" />
              <div className="h-4 w-64 bg-white/[0.04] rounded max-w-full" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-white/[0.05] rounded-lg" />
              <div className="h-9 w-28 bg-white/[0.05] rounded-xl" />
            </div>
          </div>
        </header>

        {/* KPIs skeleton - Hero pair + Secondary trio */}
        <section className="animate-fade-up stagger-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        </section>

        {/* Activity section skeleton */}
        <section className="animate-fade-up stagger-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-5 w-5 bg-teal-500/10 rounded-md" />
            <div className="h-3 w-32 bg-white/[0.05] rounded" />
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden shine-top">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.06]">
                <div className="space-y-1.5">
                  <div className="h-5 w-32 bg-white/[0.06] rounded" />
                  <div className="h-3 w-44 bg-white/[0.04] rounded" />
                </div>
                <div className="h-6 w-10 bg-white/[0.05] rounded-full" />
              </div>
              <div className="p-1">
                {[...Array(5)].map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden shine-top">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.06]">
                <div className="space-y-1.5">
                  <div className="h-5 w-36 bg-white/[0.06] rounded" />
                  <div className="h-3 w-40 bg-white/[0.04] rounded" />
                </div>
                <div className="h-6 w-10 bg-white/[0.05] rounded-full" />
              </div>
              <div className="p-1">
                {[...Array(5)].map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Charts skeleton */}
        <section className="animate-fade-up stagger-4 pb-8 sm:pb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-5 w-5 bg-teal-500/10 rounded-md" />
            <div className="h-3 w-20 bg-white/[0.05] rounded" />
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </section>
      </div>
    </div>
  );
}
