/**
 * ============================================================
 * HOOK: useStats - Dashboard KPIs & Charts
 * ============================================================
 * ✅ OPTIMIZADO v2: Usa RPC get_dashboard_stats()
 * ✅ Reduce payload de ~400KB a ~2KB
 * ✅ Cálculos en servidor (más rápido)
 * ✅ Una sola llamada en lugar de 4
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD, CACHE_KEYS } from '@/lib/swr-config';

export interface KPIData {
  totalPacientes: number;
  pacientesNuevosMes: number;
  consultasMes: number;
  consultasConfirmadasMes: number;
  tasaAsistencia: number;
  tasaConversion: number;
  totalLeads: number;
  leadsNuevosMes: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}

export interface MonthlyData {
  name: string;
  consultas: number;
  pacientes: number;
  leads: number;
  [key: string]: string | number | undefined;
}

interface StatsData {
  kpi: KPIData;
  consultasPorSede: ChartData[];
  estadoCitas: ChartData[];
  evolucionMensual: MonthlyData[];
  funnelLeads: ChartData[];
  fuentesCaptacion: ChartData[];
  metricasMensajeria: ChartData[];
  destinosPacientes: ChartData[];
}

// Valores por defecto para carga inicial instantánea
const defaultKPI: KPIData = {
  totalPacientes: 0,
  pacientesNuevosMes: 0,
  consultasMes: 0,
  consultasConfirmadasMes: 0,
  tasaAsistencia: 0,
  tasaConversion: 0,
  totalLeads: 0,
  leadsNuevosMes: 0,
};

const supabase = createClient();

/**
 * Fetcher optimizado v2 - usa RPC para cálculos en servidor
 * ✅ Una sola llamada en lugar de 4
 * ✅ Payload reducido de ~400KB a ~2KB
 */
const fetchStats = async (): Promise<StatsData> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_dashboard_stats');

  if (error) throw error;

  // La RPC retorna exactamente la estructura que necesitamos
  return {
    kpi: data?.kpi || defaultKPI,
    consultasPorSede: data?.consultasPorSede || [],
    estadoCitas: data?.estadoCitas || [],
    evolucionMensual: data?.evolucionMensual || [],
    funnelLeads: data?.funnelLeads || [],
    fuentesCaptacion: data?.fuentesCaptacion || [],
    metricasMensajeria: data?.metricasMensajeria || [],
    destinosPacientes: data?.destinosPacientes || [],
  };
};

/**
 * Hook useStats con SWR
 * ✅ Cache de 5 minutos
 * ✅ Mantiene datos previos mientras recarga
 * ✅ Deduplicación automática de requests
 */
export function useStats() {
  const { data, error, isLoading, mutate } = useSWR<StatsData>(
    CACHE_KEYS.STATS,
    fetchStats,
    SWR_CONFIG_DASHBOARD
  );

  return {
    loading: isLoading,
    error: error || null,
    refresh: () => mutate(),
    kpi: data?.kpi || defaultKPI,
    consultasPorSede: data?.consultasPorSede || [],
    estadoCitas: data?.estadoCitas || [],
    evolucionMensual: data?.evolucionMensual || [],
    funnelLeads: data?.funnelLeads || [],
    fuentesCaptacion: data?.fuentesCaptacion || [],
    metricasMensajeria: data?.metricasMensajeria || [],
    destinosPacientes: data?.destinosPacientes || [],
  };
}
