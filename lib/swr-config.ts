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
 */
export function localStorageProvider(): Cache<unknown> {
  if (typeof window === 'undefined') {
    // SSR: retornar Map vacío
    return new Map();
  }

  // Cargar datos existentes del localStorage
  const map = new Map<string, State<unknown>>(
    JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}`) || '[]')
  );

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
 * DATOS EN TIEMPO REAL (conversaciones activas)
 * - Actualiza al volver a la pestaña
 * - Polling cada 30 segundos cuando está activo
 * - Cache de 1 minuto para deduplicación
 */
export const SWR_CONFIG_REALTIME: SWRConfiguration = {
  revalidateOnFocus: true,         // ✅ Actualizar al volver a la pestaña
  revalidateOnReconnect: true,     // ✅ Actualizar al reconectar
  revalidateIfStale: true,         // ✅ Actualizar si datos están stale
  dedupingInterval: 60 * 1000,     // 1 minuto de deduplicación
  refreshInterval: 30 * 1000,      // ✅ Polling cada 30 segundos
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  errorRetryInterval: 3000,
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
