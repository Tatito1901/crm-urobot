/**
 * ============================================================
 * HOOK: usePrefetchRoutes
 * ============================================================
 * Prefetch inteligente de rutas probables basado en la ruta actual
 * Mejora la navegación haciendo que las transiciones sean instantáneas
 * Optimizado para móviles con detección de conexión y viewport
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Mapa de rutas que se deben prefetchear automáticamente
 * basado en la ruta actual del usuario
 */
const PREFETCH_MAP: Record<string, string[]> = {
  '/dashboard': [
    '/agenda',
    '/pacientes',
    '/leads',
    '/consultas',
  ],
  '/agenda': [
    '/pacientes',
    '/confirmaciones',
  ],
  '/pacientes': [
    '/agenda',
  ],
  '/leads': [
    '/pacientes',
    '/agenda',
  ],
  '/consultas': [
    '/agenda',
    '/pacientes',
  ],
  '/confirmaciones': [
    '/agenda',
  ],
  '/metricas': [
    '/dashboard',
  ],
};

/**
 * Hook que implementa prefetching inteligente de rutas
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   usePrefetchRoutes(); // Automáticamente prefetchea rutas relevantes
 *   return <div>...</div>
 * }
 * ```
 */
export function usePrefetchRoutes() {
  const pathname = usePathname();
  const router = useRouter();
  const [shouldPrefetch, setShouldPrefetch] = useState(true);

  useEffect(() => {
    // Detectar conexión lenta o datos ahorrados
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const nav = navigator as unknown as { connection: { effectiveType: string; saveData: boolean } };
      const conn = nav.connection;
      if (conn) {
        // No prefetch en conexiones lentas (2G, slow-2g) o con ahorro de datos
        const isSlowConnection = conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
        const isSaveData = conn.saveData === true;
        setShouldPrefetch(!isSlowConnection && !isSaveData);
      }
    }

    // Detectar si es móvil por tamaño de pantalla
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    
    // Si es móvil, esperar más tiempo antes de prefetch
    const delay = isMobile ? 500 : 100;

    if (!pathname || !shouldPrefetch) return;

    // Obtener rutas a prefetchear para la ruta actual
    const routesToPrefetch = PREFETCH_MAP[pathname] || [];

    // Limitar prefetch en móviles (solo las 2 primeras rutas)
    const routesToLoad = isMobile 
      ? routesToPrefetch.slice(0, 2) 
      : routesToPrefetch;

    // Prefetchear después de un delay para no bloquear el render inicial
    const timeoutId = setTimeout(() => {
      routesToLoad.forEach((route) => {
        router.prefetch(route);
      });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [pathname, router, shouldPrefetch]);
}
