/**
 * ============================================================
 * HOOK: usePrefetchRoutes
 * ============================================================
 * Prefetch inteligente de rutas probables basado en la ruta actual
 * Mejora la navegación haciendo que las transiciones sean instantáneas
 */

'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!pathname) return;

    // Obtener rutas a prefetchear para la ruta actual
    const routesToPrefetch = PREFETCH_MAP[pathname] || [];

    // Prefetchear después de un pequeño delay para no bloquear el render inicial
    const timeoutId = setTimeout(() => {
      routesToPrefetch.forEach((route) => {
        router.prefetch(route);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname, router]);
}
