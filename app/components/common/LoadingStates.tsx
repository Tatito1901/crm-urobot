/**
 * ============================================================
 * LOADING STATES - Estados de carga mejorados
 * ============================================================
 */

'use client';

import React from 'react';

// ===== SPINNER =====
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

// ===== SKELETON =====
export function Skeleton({
  className = '',
  variant = 'text',
}: {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}) {
  const baseClasses = 'animate-pulse bg-white/10';

  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}

// ===== SKELETON CARD =====
export function SkeletonCard() {
  return (
    <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-lg">
      <Skeleton className="w-1/3 mb-4" />
      <Skeleton className="w-full h-12" variant="rectangular" />
      <div className="mt-4 space-y-2">
        <Skeleton className="w-full" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  );
}

// ===== SKELETON TABLE =====
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton className="w-1/4 h-8" />
        <Skeleton className="w-1/4 h-8" />
        <Skeleton className="w-1/4 h-8" />
        <Skeleton className="w-1/4 h-8" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-1/4 h-12" variant="rectangular" />
          <Skeleton className="w-1/4 h-12" variant="rectangular" />
          <Skeleton className="w-1/4 h-12" variant="rectangular" />
          <Skeleton className="w-1/4 h-12" variant="rectangular" />
        </div>
      ))}
    </div>
  );
}

// ===== FULL PAGE LOADER =====
export function FullPageLoader({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
      <p className="mt-4 text-slate-400">{message}</p>
    </div>
  );
}

// ===== INLINE LOADER =====
export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Spinner size="sm" />
      {message && <span className="text-sm text-slate-400">{message}</span>}
    </div>
  );
}

// ===== EMPTY STATE =====
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

// ===== ERROR STATE =====
export function ErrorState({
  error,
  onRetry,
}: {
  error: Error | string;
  onRetry?: () => void;
}) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-200 mb-2">Error al cargar datos</h3>
      <p className="text-sm text-red-300/80 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
