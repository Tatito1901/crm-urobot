/**
 * ============================================================
 * HOOK: useDebouncedCallback
 * ============================================================
 * Hook para crear callbacks debounced que persisten entre renders
 * Optimiza búsquedas y filtros evitando llamadas excesivas
 */

import { useCallback, useRef, useEffect } from 'react';

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Actualizar callback ref en cada render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
