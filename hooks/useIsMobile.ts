/**
 * ============================================================
 * HOOK: useIsMobile
 * ============================================================
 * Hook simple para detectar si el dispositivo es móvil
 * Usa matchMedia para mejor performance que resize listeners
 */

'use client';

import { useEffect, useState } from 'react';

/** Breakpoint lg de Tailwind (1024px) */
const MOBILE_BREAKPOINT = '(max-width: 1023px)';

/**
 * Detecta si el dispositivo es móvil (< 1024px)
 * @returns boolean - true si es móvil/tablet
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    
    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Create event listener
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

/**
 * Detecta si la conexión es lenta (2G) o tiene ahorro de datos
 * @returns boolean - true si debe reducir prefetching
 */
export function useSlowConnection(): boolean {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const conn = (navigator as Navigator & { 
      connection?: { 
        effectiveType: string; 
        saveData: boolean;
        addEventListener: (type: string, listener: () => void) => void;
        removeEventListener: (type: string, listener: () => void) => void;
      } 
    }).connection;
    
    if (!conn) return;

    const checkConnection = () => {
      setIsSlowConnection(
        conn.effectiveType === '2g' || 
        conn.effectiveType === 'slow-2g' || 
        conn.saveData === true
      );
    };

    checkConnection();
    conn.addEventListener('change', checkConnection);
    return () => conn.removeEventListener('change', checkConnection);
  }, []);

  return isSlowConnection;
}
