/**
 * ============================================================
 * SKELETON LOADER - Loading States Mejorados
 * ============================================================
 * QUICK WIN #5: Componentes reutilizables para estados de carga
 * Mejor UX que spinner o texto "Cargando..."
 */

import React from 'react';
import { cn } from '@/app/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton básico para cualquier contenido
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/5',
        className
      )}
    />
  );
}

/**
 * Skeleton para tarjetas de métricas
 */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/**
 * Skeleton para tabla de datos (desktop)
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="hidden md:block space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-white/10">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para cards mobile
 */
export function MobileCardsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="md:hidden grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
        >
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton completo para DataTable (desktop + mobile)
 */
export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <TableSkeleton rows={rows} />
      <MobileCardsSkeleton count={rows} />
    </div>
  );
}

/**
 * Skeleton para gráficos
 */
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <Skeleton
      className="w-full rounded-xl"
      style={{ height: `${height}px` }}
    />
  );
}
