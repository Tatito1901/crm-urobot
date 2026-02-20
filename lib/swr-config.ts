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
 * DATOS DE CONVERSACIONES (con actualización automática)
 * - Actualiza al volver a la pestaña (mejor UX)
 * - Polling cada 30 segundos para mantener sincronizado
 * - Cache de 30 segundos para datos frescos
 */
export const SWR_CONFIG_REALTIME: SWRConfiguration = {
  revalidateOnFocus: true,         // ✅ Actualizar al volver a la pestaña
  revalidateOnReconnect: true,     // ✅ Actualizar al reconectar
  revalidateIfStale: true,         // ✅ Auto-revalidar datos antiguos
  dedupingInterval: 60 * 1000,     // 60 segundos de deduplicación (antes 30s)
  refreshInterval: 60 * 1000,      // ✅ Polling cada 60 segundos (antes 30s — reduce API calls 50%)
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

// ============================================================
// INVALIDACIÓN CENTRALIZADA POR DOMINIO
// ============================================================

/**
 * Dominios de datos y sus prefijos de cache key asociados.
 * Cuando mutas datos de un dominio, se invalidan TODAS las keys relacionadas.
 * 
 * Ejemplo: cambiar estado de un lead invalida:
 *   - leads (lista, paginado, stats, historial)
 *   - dashboard (stats generales, actividad reciente)
 */
type CacheDomain = 'leads' | 'pacientes' | 'consultas' | 'conversaciones' | 'dashboard' | 'urobot';

const DOMAIN_PREFIXES: Record<CacheDomain, string[]> = {
  leads: [
    'leads',            // leads-list, leads-list-stats
    'lead-',            // lead-by-telefono-*, lead-historial-*
  ],
  pacientes: [
    'pacientes',        // pacientes-list
  ],
  consultas: [
    'consultas',        // consultas-list, consultas-combined
  ],
  conversaciones: [
    'conversaciones',   // conversaciones-list, conversaciones-stats-*
    'conv-mensajes-',   // conv-mensajes-{telefono}
  ],
  dashboard: [
    'stats-dashboard',  // useStats
    'dashboard-',       // dashboard-activity
  ],
  urobot: [
    'urobot-',          // urobot-metricas-crm-*, urobot-stats-*
  ],
};

/**
 * Relaciones entre dominios: cuando mutas un dominio,
 * también se invalidan sus dominios relacionados.
 * 
 * leads → dashboard (stats cambian)
 * consultas → dashboard, pacientes (stats + contadores)
 * conversaciones → dashboard (actividad reciente)
 */
const DOMAIN_RELATIONS: Record<CacheDomain, CacheDomain[]> = {
  leads: ['dashboard'],
  pacientes: ['dashboard'],
  consultas: ['dashboard', 'pacientes'],
  conversaciones: ['dashboard'],
  dashboard: [],
  urobot: [],
};

/**
 * Referencia global al cache Map de SWR.
 * Se setea desde el provider en providers.tsx.
 * Necesario para poder invalidar keys sin acceso al hook.
 */
let _cacheRef: Map<string, unknown> | null = null;
let _globalMutate: ((key: string) => Promise<unknown>) | null = null;

/**
 * Registra la referencia al cache de SWR (llamar desde providers.tsx)
 */
export function registerSWRCache(cache: Map<string, unknown>, mutate: (key: string) => Promise<unknown>): void {
  _cacheRef = cache;
  _globalMutate = mutate;
}

/**
 * Invalida todas las cache keys que pertenecen a un dominio + sus relaciones.
 * 
 * @example
 * // Después de cambiar estado de un lead:
 * await invalidateDomain('leads')
 * // → Invalida: leads-list, lead-by-telefono-*, stats-dashboard, dashboard-activity
 * 
 * @example
 * // Después de crear una consulta:
 * await invalidateDomain('consultas')
 * // → Invalida: consultas-*, stats-dashboard, dashboard-*, pacientes-list
 */
export async function invalidateDomain(domain: CacheDomain): Promise<void> {
  if (!_cacheRef || !_globalMutate) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SWR] invalidateDomain llamado antes de registerSWRCache')
    }
    return;
  }

  // Recolectar todos los prefijos a invalidar (dominio + relacionados)
  const domainsToInvalidate = [domain, ...DOMAIN_RELATIONS[domain]];
  const prefixes = domainsToInvalidate.flatMap(d => DOMAIN_PREFIXES[d]);

  // Encontrar todas las keys activas que matchean los prefijos
  const keysToInvalidate: string[] = [];
  _cacheRef.forEach((_value, key) => {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      keysToInvalidate.push(key);
    }
  });

  // Invalidar todas las keys en paralelo
  await Promise.allSettled(
    keysToInvalidate.map(key => _globalMutate!(key))
  );

  if (process.env.NODE_ENV === 'development' && keysToInvalidate.length > 0) {
    console.log(`[SWR] invalidateDomain('${domain}') → ${keysToInvalidate.length} keys:`, keysToInvalidate);
  }
}

/**
 * Invalida múltiples dominios a la vez.
 * 
 * @example
 * await invalidateDomains(['leads', 'conversaciones'])
 */
async function invalidateDomains(domains: CacheDomain[]): Promise<void> {
  await Promise.allSettled(domains.map(d => invalidateDomain(d)));
}

// ============================================================
// UTILIDADES DE LIMPIEZA
// ============================================================

/**
 * Limpiar caché específico (útil después de mutaciones)
 */
function clearCacheKey(key: string): void {
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
function clearAllCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}`);
  }
}
