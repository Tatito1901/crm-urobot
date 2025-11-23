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
          <div className="text-xl font-bold text-destructive">Error</div>
          <h3 className="text-lg font-semibold text-foreground">Error al cargar datos</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium"
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
