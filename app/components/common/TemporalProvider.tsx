/**
 * ============================================================
 * TEMPORAL PROVIDER
 * ============================================================
 * Componente que carga el polyfill de Temporal solo cuando es necesario
 * y muestra un loading mientras tanto
 */

'use client';

import { useEffect, useState } from 'react';
import { ensureTemporalPolyfill } from '@/lib/temporal-loader';

interface TemporalProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TemporalProvider({ children, fallback }: TemporalProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ensureTemporalPolyfill()
      .then(() => setIsReady(true))
      .catch((error) => {
        console.error('Failed to load Temporal polyfill:', error);
        // Aún así mostrar el contenido, podría fallar más tarde
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-urobot">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
