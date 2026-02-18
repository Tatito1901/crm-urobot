/**
 * ============================================================
 * HOOK: usePrefetchRoutes
 * ============================================================
 * Prefetch inteligente de rutas probables basado en la ruta actual
 * Mejora la navegación haciendo que las transiciones sean instantáneas
 * Optimizado para móviles con detección de conexión y viewport
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile, useSlowConnection } from './useIsMobile';

/**
 * Mapa de rutas que se deben prefetchear automáticamente
 * basado en la ruta actual del usuario
 */
const PREFETCH_MAP: Record<string, string[]> = {
  '/dashboard': [
    '/agenda',
    '/leads',
    '/consultas',
  ],
  '/agenda': [],
  '/leads': [
    '/agenda',
  ],
  '/consultas': [
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
  const isMobile = useIsMobile();
  const isSlowConnection = useSlowConnection();

  useEffect(() => {
    // No prefetch en conexiones lentas
    if (isSlowConnection || !pathname) return;

    // Obtener rutas a prefetchear para la ruta actual
    const routesToPrefetch = PREFETCH_MAP[pathname] || [];
    if (routesToPrefetch.length === 0) return;

    // Configurar según dispositivo
    const delay = isMobile ? 500 : 100;
    const routesToLoad = isMobile 
      ? routesToPrefetch.slice(0, 2) // Limitar en móviles
      : routesToPrefetch;

    // Prefetchear después de un delay para no bloquear el render inicial
    const timeoutId = setTimeout(() => {
      routesToLoad.forEach((route) => {
        router.prefetch(route);
      });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [pathname, router, isMobile, isSlowConnection]);
}
