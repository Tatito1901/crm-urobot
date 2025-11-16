/**
 * ============================================================
 * CONTENT LOADER - Sistema unificado de carga sin parpadeos
 * ============================================================
 * Evita layout shifts y proporciona transiciones suaves
 */


import { ReactNode } from 'react';

interface ContentLoaderProps {
  loading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  skeleton: ReactNode;
  children: ReactNode;
  minHeight?: string;
  emptyState?: ReactNode;
  isEmpty?: boolean;
}

export function ContentLoader({
  loading,
  error,
  onRetry,
  skeleton,
  children,
  minHeight = 'min-h-[400px]',
  emptyState,
  isEmpty = false,
}: ContentLoaderProps) {
  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center ${minHeight}`}>
        <div className="max-w-md text-center space-y-4">
          <div className="text-xl font-bold text-red-400">Error</div>
          <h3 className="text-lg font-semibold text-white">Error al cargar datos</h3>
          <p className="text-sm text-slate-400">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state - muestra skeleton sin parpadeo
  if (loading) {
    return (
      <div className={`animate-fade-in ${minHeight}`}>
        {skeleton}
      </div>
    );
  }

  // Empty state
  if (isEmpty && emptyState) {
    return (
      <div className={`flex items-center justify-center ${minHeight} animate-fade-in`}>
        {emptyState}
      </div>
    );
  }

  // Content con fade-in suave
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}

/**
 * Card Skeleton - Para cards de resumen
 */
export function CardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
        <div className="h-6 w-12 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * List Item Skeleton - Para listas
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-3.5">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
    </div>
  );
}

/**
 * Table Skeleton - Para tablas completas
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
