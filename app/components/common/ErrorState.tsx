/**
 * ============================================================
 * ERROR STATE - Componente para mostrar errores de API/fetching
 * ============================================================
 * QUICK WIN #7: Manejo robusto de errores
 * Diferente de ErrorBoundary (que captura errores de React)
 * Este componente muestra errores de API, network, etc.
 */

'use client';

import React from 'react';

interface ErrorStateProps {
  /** Título del error */
  title?: string;
  /** Descripción del error */
  message?: string;
  /** Error object (opcional, se extrae el mensaje) */
  error?: Error | null;
  /** Función para reintentar */
  onRetry?: () => void;
  /** Texto del botón de retry */
  retryText?: string;
  /** Tamaño del componente */
  size?: 'small' | 'medium' | 'large';
}

export function ErrorState({
  title = 'Error al cargar datos',
  message,
  error,
  onRetry,
  retryText = 'Reintentar',
  size = 'medium',
}: ErrorStateProps) {
  const errorMessage = message || error?.message || 'Ocurrió un error inesperado';

  // Tamaños
  const sizeClasses = {
    small: 'min-h-[200px] p-6',
    medium: 'min-h-[300px] p-8',
    large: 'min-h-[400px] p-12',
  };

  const iconSize = {
    small: 'text-4xl',
    medium: 'text-5xl',
    large: 'text-6xl',
  };

  const titleSize = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 ${sizeClasses[size]}`}
    >
      <div className={`mb-4 text-red-400 ${iconSize[size]}`}>⚠️</div>

      <h3 className={`mb-2 font-semibold text-red-100 ${titleSize[size]}`}>
        {title}
      </h3>

      <p className="mb-6 max-w-md text-center text-sm text-red-200/80">
        {errorMessage}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {retryText}
        </button>
      )}

      {/* Detalles técnicos en desarrollo */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 max-w-lg">
          <summary className="cursor-pointer text-xs text-red-300/60 hover:text-red-300">
            Detalles técnicos
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-red-950/50 p-3 text-xs text-red-200">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Variante inline para errores pequeños (útil en cards)
 */
export function InlineErrorState({
  message = 'Error al cargar',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-red-400">⚠️</span>
        <span className="text-sm text-red-200">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-300 hover:text-red-200 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
