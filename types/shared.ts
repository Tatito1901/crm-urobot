/**
 * ============================================================
 * TIPOS COMPARTIDOS - Tipos comunes y métricas del dashboard
 * ============================================================
 * Consolidación de tipos pequeños usados en toda la aplicación
 */

// ============================================================
// NAVEGACIÓN Y TABS
// ============================================================

export const TAB_KEYS = ['leads', 'pacientes', 'consultas', 'confirmaciones', 'metricas'] as const;

export type TabKey = (typeof TAB_KEYS)[number];

// ============================================================
// MÉTRICAS DEL DASHBOARD
// ============================================================

export interface DashboardMetrics {
  leadsTotal: number;
  leadsMes: number;
  leadsConvertidos: number;
  tasaConversion: number;
  pacientesActivos: number;
  totalPacientes: number;
  consultasFuturas: number;
  consultasHoy: number;
  pendientesConfirmacion: number;
  polancoFuturas: number;
  sateliteFuturas: number;
}

export const DEFAULT_DASHBOARD_METRICS: DashboardMetrics = {
  leadsTotal: 0,
  leadsMes: 0,
  leadsConvertidos: 0,
  tasaConversion: 0,
  pacientesActivos: 0,
  totalPacientes: 0,
  consultasFuturas: 0,
  consultasHoy: 0,
  pendientesConfirmacion: 0,
  polancoFuturas: 0,
  sateliteFuturas: 0,
};

// ============================================================
// UTILIDADES DE PAGINACIÓN
// ============================================================

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationState;
  hasMore: boolean;
}
