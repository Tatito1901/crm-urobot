/**
 * ============================================================
 * LOADING STATE - Dashboard V3
 * ============================================================
 * Matches: Header → Hero 3-col KPIs → 4 secondary → 5-col bot → Activity → Charts
 */

import { MetricCardSkeleton, CardSkeleton, ListItemSkeleton } from '@/app/components/common/SkeletonLoader';

export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10">
        {/* Header skeleton */}
        <header>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="h-3 w-36 bg-muted/40 rounded" />
              <div className="h-8 w-44 bg-muted/50 rounded-lg" />
              <div className="h-4 w-64 bg-muted/30 rounded max-w-full" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-28 bg-muted/40 rounded-xl" />
            </div>
          </div>
        </header>

        {/* Hero KPIs skeleton — 3 columns */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/50" />
                  <div className="h-3 w-24 bg-muted/40 rounded" />
                </div>
                <div className="h-10 w-20 bg-muted/50 rounded-lg mb-2" />
                <div className="h-3 w-40 bg-muted/30 rounded mb-3" />
                <div className="h-[50px] w-full bg-muted/20 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Secondary KPIs — 4 columns */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[...Array(4)].map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Bot section — 5 columns */}
        <section>
          <div className="mb-3">
            <div className="h-3 w-32 bg-muted/40 rounded" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3.5 w-3.5 rounded bg-muted/50" />
                  <div className="h-2.5 w-16 bg-muted/40 rounded" />
                </div>
                <div className="h-8 w-14 bg-muted/50 rounded mb-1" />
                <div className="h-2.5 w-20 bg-muted/30 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Activity section */}
        <section>
          <div className="mb-3">
            <div className="h-3 w-28 bg-muted/40 rounded" />
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
                <div className="space-y-1.5">
                  <div className="h-5 w-32 bg-muted/40 rounded" />
                  <div className="h-3 w-44 bg-muted/30 rounded" />
                </div>
                <div className="h-6 w-10 bg-muted/30 rounded-full" />
              </div>
              <div className="p-1">
                {[...Array(5)].map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
                <div className="space-y-1.5">
                  <div className="h-5 w-36 bg-muted/40 rounded" />
                  <div className="h-3 w-40 bg-muted/30 rounded" />
                </div>
                <div className="h-6 w-10 bg-muted/30 rounded-full" />
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
        <section className="pb-8 sm:pb-4">
          <div className="mb-3">
            <div className="h-3 w-20 bg-muted/40 rounded" />
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
