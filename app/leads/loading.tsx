/**
 * ============================================================
 * LOADING STATE - Leads
 * ============================================================
 * Matches clean layout: Header → Stats row → Filters → Table
 */

import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeadsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Stats grid skeleton - 5 compact cards in a row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card/80 border border-border/40 min-h-[72px]">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar skeleton */}
      <div className="flex items-center gap-4 bg-card/80 p-4 rounded-xl border border-border/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
          <Skeleton className="h-9 w-72 rounded-lg" />
          <Skeleton className="h-9 w-56 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm p-4">
        <TableContentSkeleton rows={6} />
      </div>
    </div>
  );
}
