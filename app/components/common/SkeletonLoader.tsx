/**
 * ============================================================
 * SKELETON LOADER - Loading States Mejorados
 * ============================================================
 * QUICK WIN #5: Componentes reutilizables para estados de carga
 * Mejor UX que spinner o texto "Cargando..."
 */

import React from 'react';
import { cn } from '@/lib/utils';

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
        'rounded-lg bg-muted/60',
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
    <div className="rounded-2xl border border-border/50 bg-card p-4">
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
      <div className="flex gap-4 pb-3 border-b border-border">
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
          className="rounded-2xl border border-border/50 bg-card p-3"
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
 * Skeleton para lista de items (Dashboard, Listas simples)
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-3.5">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

/**
 * Skeleton para cards de resumen (Dashboard)
 */
export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton simple (compatibilidad)
 */
export function TableContentSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
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
      className={`${sizeClasses[size]} border-blue-400/40 border-t-blue-500 rounded-full`}
      style={{ animation: 'spin 1s linear infinite' }}
    />
  );
}

/**
 * Empty state component - Responsivo
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
    <div className="flex flex-col items-center justify-center min-h-[180px] sm:min-h-[250px] p-4 sm:p-8 text-center">
      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 opacity-50">{icon}</div>
      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-1 sm:mb-2">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 max-w-xs sm:max-w-md">{description}</p>}
      {action && <div className="mt-3 sm:mt-4">{action}</div>}
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
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}
