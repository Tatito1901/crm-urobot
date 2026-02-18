/**
 * ============================================================
 * HOOK: useHasMounted
 * ============================================================
 * Hook reutilizable para evitar hydration mismatch.
 * Reemplaza el patrón repetido de useState(false) + useEffect(setMounted(true))
 * 
 * ✅ BEST PRACTICE: rerender-lazy-state-init
 * Se usa useSyncExternalStore para ser compatible con SSR sin useEffect
 */

'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Devuelve `false` en el servidor y en el primer render del cliente,
 * `true` después de la hidratación. No causa re-render extra.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}
