/**
 * ============================================================
 * SWR CONFIG - Configuración compartida para hooks de data
 * ============================================================
 * ESTRATEGIA DE AHORRO DE LLAMADAS A API:
 * 
 * 1. Cache agresivo (15-30 min) para datos que cambian poco
 * 2. NO revalidar automáticamente (solo manual o por Realtime)
 * 3. Persistencia en localStorage para datos entre sesiones
 * 4. Deduplicación extendida para evitar requests duplicados
 */

import type { SWRConfiguration, Cache, State } from 'swr';

// ============================================================
// CACHE PERSISTENTE EN LOCALSTORAGE
// ============================================================
const CACHE_PREFIX = 'swr-cache-';
const CACHE_VERSION = 'v1';

/**
 * Provider de caché que persiste en localStorage
 * Reduce llamadas iniciales al cargar datos guardados
 * 
 * ⚠️ IMPORTANTE: NO cargamos datos de localStorage en el primer render
 * para evitar hydration mismatch. Los datos se cargan después de que
 * React haya completado la hidratación.
 */
export function localStorageProvider(): Cache<unknown> {
  if (typeof window === 'undefined') {
    // SSR: retornar Map vacío
    return new Map();
  }

  // Empezar con Map vacío para evitar hydration mismatch
  // Los datos del localStorage se cargarán después de la hidratación
  const map = new Map<string, State<unknown>>();
  
  // Cargar datos del localStorage DESPUÉS de que React hidrate
  // Usamos requestIdleCallback o setTimeout para diferir la carga
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}`);
      if (stored) {
        const entries = JSON.parse(stored) as [string, State<unknown>][];
        entries.forEach(([key, value]) => {
          // Solo cargar si no hay datos ya en el cache (evita sobrescribir datos frescos)
          if (!map.has(key)) {
            map.set(key, value);
          }
        });
      }
    } catch {
      // Ignorar errores de parsing
    }
  };
  
  // Diferir la carga para después de la hidratación
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(loadFromStorage);
  } else {
    setTimeout(loadFromStorage, 100);
  }

  // Guardar en localStorage antes de cerrar
  window.addEventListener('beforeunload', () => {
    const entries: [string, State<unknown>][] = [];
    map.forEach((value, key) => {
      // Solo guardar datos válidos (no errores)
      if (value.data && !value.error) {
        entries.push([key, value]);
      }
    });
    // Limitar a 50 entries para no llenar localStorage
    const limitedEntries = entries.slice(-50);
    localStorage.setItem(`${CACHE_PREFIX}${CACHE_VERSION}`, JSON.stringify(limitedEntries));
  });

  return map as Cache<unknown>;
}

// ============================================================
// CONFIGURACIONES POR TIPO DE DATO
// ============================================================

/**
 * DATOS PRINCIPALES (leads, pacientes, consultas)
 * - Cache: 15 minutos
 * - Sin revalidación automática
 * - Actualización solo por Realtime o manual
 */
export const SWR_CONFIG_STANDARD: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  dedupingInterval: 15 * 60 * 1000, // 15 minutos (aumentado de 5)
  refreshInterval: 0,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 1,              // Reducido a 1
  errorRetryInterval: 5000,
};

/**
 * DATOS DE SOLO LECTURA (recordatorios, historial)
 * - Cache: 30 minutos  
 * - Datos que cambian muy poco
 */
export const SWR_CONFIG_READONLY: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  dedupingInterval: 30 * 60 * 1000, // 30 minutos (aumentado de 1)
  refreshInterval: 0,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 1,
  errorRetryInterval: 5000,
};

/**
 * DATOS DEL DASHBOARD (stats, KPIs)
 * - Cache: 30 minutos
 * - Estadísticas no necesitan actualización frecuente
 */
export const SWR_CONFIG_DASHBOARD: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  dedupingInterval: 30 * 60 * 1000, // 30 minutos (aumentado de 5)
  refreshInterval: 0,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 1,
  errorRetryInterval: 5000,
};

/**
 * DATOS DE CONVERSACIONES (sin Realtime)
 * - Actualiza al volver a la pestaña (mejor UX)
 * - SIN polling automático (ahorra llamadas API)
 * - Cache de 5 minutos
 */
export const SWR_CONFIG_REALTIME: SWRConfiguration = {
  revalidateOnFocus: true,         // ✅ Actualizar al volver a la pestaña
  revalidateOnReconnect: true,     // ✅ Actualizar al reconectar
  revalidateIfStale: false,        // ❌ No auto-revalidar
  dedupingInterval: 5 * 60 * 1000, // 5 minutos de deduplicación
  refreshInterval: 0,              // ❌ SIN polling (ahorra 83% de carga)
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 1,
  errorRetryInterval: 5000,
};

// ============================================================
// UTILIDADES PARA INVALIDACIÓN INTELIGENTE
// ============================================================

/**
 * Claves de caché por módulo para invalidación selectiva
 */
export const CACHE_KEYS = {
  LEADS: 'leads-list',
  PACIENTES: 'pacientes-list',
  CONSULTAS: 'consultas-list',
  CONVERSACIONES: 'conversaciones-list',
  STATS: 'stats-dashboard',
  RECORDATORIOS: 'recordatorios-list',
} as const;

/**
 * Limpiar caché específico (útil después de mutaciones)
 */
export function clearCacheKey(key: string): void {
  if (typeof window !== 'undefined') {
    try {
      const cache = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}`) || '[]');
      const filtered = cache.filter(([k]: [string]) => !k.includes(key));
      localStorage.setItem(`${CACHE_PREFIX}${CACHE_VERSION}`, JSON.stringify(filtered));
    } catch {
      // Ignorar errores de localStorage
    }
  }
}

/**
 * Limpiar todo el caché (útil en logout o problemas)
 */
export function clearAllCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}`);
  }
}
