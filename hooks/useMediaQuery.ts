/**
 * ============================================================
 * HOOK: useMediaQuery
 * ============================================================
 * Hook optimizado para detectar breakpoints y adaptarse a móviles
 * Usa matchMedia para mejor performance que resize listeners
 */

'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Hook para detectar si el dispositivo es móvil
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 1023px)'); // lg breakpoint
}

/**
 * Hook para detectar si el dispositivo es tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook para detectar conexión lenta
 */
export function useSlowConnection(): boolean {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    interface NavigatorConnection {
      effectiveType: string;
      saveData: boolean;
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
    }

    const conn = (navigator as unknown as { connection: NavigatorConnection }).connection;
    if (!conn) return;

    const checkConnection = () => {
      const effectiveType = conn.effectiveType;
      const saveData = conn.saveData;
      setIsSlowConnection(
        effectiveType === '2g' || 
        effectiveType === 'slow-2g' || 
        saveData === true
      );
    };

    checkConnection();

    // Listen for connection changes
    conn.addEventListener('change', checkConnection);
    return () => conn.removeEventListener('change', checkConnection);
  }, []);

  return isSlowConnection;
}
