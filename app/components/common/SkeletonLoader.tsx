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
    <div style={{ height: `${height}px` }} className="w-full">
      <Skeleton className="h-full w-full rounded-xl" />
    </div>
  );
}

/**
 * Spinner component
 */
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-blue-400/30 border-t-blue-400 rounded-full animate-spin`}
    />
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  icon = '📭',
  title = 'No hay datos',
  description,
  action,
}: {
  icon?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-4 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Full page loader
 */
export function FullPageLoader({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
      <p className="mt-4 text-slate-400">{message}</p>
    </div>
  );
}
