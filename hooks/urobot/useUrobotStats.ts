/**
 * ============================================================
 * HOOK: useUrobotStats
 * ============================================================
 * Estadísticas y monitoreo del sistema UroBot
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_REALTIME } from '@/lib/swr-config';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export interface UrobotKPI {
  totalMensajes: number;
  totalErrores: number;
  tasaExito: number;
  tiempoPromedioMs: number;
  usuariosUnicos: number;
  mensajesHoy: number;
  erroresHoy: number;
  alertasPendientes: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface TimeSeriesData {
  hora?: string;
  fecha?: string;
  mensajes: number;
  errores: number;
  usuarios?: number;
}

export interface ErrorLog {
  id: string;
  created_at: string;
  telefono: string;
  tipo_error: string | null;
  detalle_error: string | null;
  mensaje_usuario: string | null;
  razones_fallo: string[] | null;
}

export interface Alerta {
  id: string;
  created_at: string;
  tipo_alerta: string;
  severidad: string;
  mensaje: string | null;
  telefono: string | null;
}

interface UrobotStats {
  kpi: UrobotKPI;
  erroresPorTipo: ChartData[];
  interaccionesPorTipo: ChartData[];
  evolucionHoras: TimeSeriesData[];
  evolucionDiaria: TimeSeriesData[];
  herramientasUsadas: ChartData[];
  ultimosErrores: ErrorLog[];
  alertasPendientes: Alerta[];
  sentimentDistribucion: ChartData[];
}

// ============================================================
// DEFAULTS
// ============================================================

const defaultKPI: UrobotKPI = {
  totalMensajes: 0,
  totalErrores: 0,
  tasaExito: 100,
  tiempoPromedioMs: 0,
  usuariosUnicos: 0,
  mensajesHoy: 0,
  erroresHoy: 0,
  alertasPendientes: 0,
};

const defaultStats: UrobotStats = {
  kpi: defaultKPI,
  erroresPorTipo: [],
  interaccionesPorTipo: [],
  evolucionHoras: [],
  evolucionDiaria: [],
  herramientasUsadas: [],
  ultimosErrores: [],
  alertasPendientes: [],
  sentimentDistribucion: [],
};

// ============================================================
// FETCHER
// ============================================================

const fetchUrobotStats = async (dias: number): Promise<UrobotStats> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_urobot_stats', {
    p_dias: dias,
  });

  if (error) throw error;

  return {
    kpi: data?.kpi || defaultKPI,
    erroresPorTipo: data?.erroresPorTipo || [],
    interaccionesPorTipo: data?.interaccionesPorTipo || [],
    evolucionHoras: data?.evolucionHoras || [],
    evolucionDiaria: data?.evolucionDiaria || [],
    herramientasUsadas: data?.herramientasUsadas || [],
    ultimosErrores: data?.ultimosErrores || [],
    alertasPendientes: data?.alertasPendientes || [],
    sentimentDistribucion: data?.sentimentDistribucion || [],
  };
};

// ============================================================
// HOOK
// ============================================================

export function useUrobotStats(dias: number = 7) {
  const { data, error, isLoading, mutate } = useSWR(
    `urobot-stats-${dias}`,
    () => fetchUrobotStats(dias),
    {
      ...SWR_CONFIG_REALTIME,
      refreshInterval: 60 * 1000, // Actualizar cada minuto
    }
  );

  return {
    stats: data || defaultStats,
    kpi: data?.kpi || defaultKPI,
    isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}

// ============================================================
// ACCIONES
// ============================================================

export async function marcarAlertaRevisada(alertaId: string, notas?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('escalamientos')
    .update({
      resultado: 'revisado',
      notas: notas || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', alertaId);

  if (error) throw error;
  return true;
}
