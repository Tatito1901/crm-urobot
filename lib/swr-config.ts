/**
 * ============================================================
 * SWR CONFIG - Configuración compartida para hooks de data
 * ============================================================
 * Centraliza opciones de SWR para evitar duplicación
 * y facilitar ajustes globales de caché/revalidación
 */

import type { SWRConfiguration } from 'swr';

/**
 * Configuración estándar para hooks de datos principales
 * (useLeads, usePacientes, useConsultas)
 * 
 * OPTIMIZADA para reducir llamadas a BD:
 * - revalidateOnFocus: false → NO revalida al volver al tab (usar refresh manual)
 * - dedupingInterval: 5 min → Evita requests duplicados
 * - keepPreviousData: true → Sin parpadeos al recargar
 */
export const SWR_CONFIG_STANDARD: SWRConfiguration = {
  revalidateOnFocus: false,     // ❌ Cambio: evita revalidación automática
  revalidateOnReconnect: false, // ❌ Cambio: evita revalidación en reconexión
  dedupingInterval: 5 * 60 * 1000, // 5 minutos
  revalidateIfStale: false,
  refreshInterval: 0,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,           // Reducido de 3 a 2
  errorRetryInterval: 3000,     // Aumentado de 2s a 3s
};

/**
 * Configuración para datos de solo lectura (recordatorios, stats)
 * Menos agresiva en revalidación
 */
export const SWR_CONFIG_READONLY: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60 * 1000, // 1 minuto
  revalidateIfStale: false,
  refreshInterval: 0,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  errorRetryInterval: 3000,
};

/**
 * Configuración para datos del dashboard (stats, KPIs)
 * Caché más largo, menos revalidación
 */
export const SWR_CONFIG_DASHBOARD: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5 * 60 * 1000, // 5 minutos
  revalidateIfStale: false,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  errorRetryInterval: 5000,
};
