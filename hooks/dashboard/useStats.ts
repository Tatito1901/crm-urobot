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

interface KPIData {
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
 * Fetcher optimizado v2 - usa RPC get_dashboard_stats_fast
 * ✅ Una sola llamada
 * ✅ Payload reducido
 * 
 * RPC retorna: {leads: {total, hoy, semana, por_estado, por_temperatura, por_fuente},
 *               conversaciones: {activas, total}, escalamientos: {pendientes, total_hoy},
 *               consultas: {programadas, hoy, completadas_mes}, pacientes: {total, nuevos_mes}}
 */
const fetchStats = async (): Promise<StatsData> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_dashboard_stats_fast');

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as Record<string, any> | null;
  if (!d) return { kpi: defaultKPI, consultasPorSede: [], estadoCitas: [], evolucionMensual: [], funnelLeads: [], fuentesCaptacion: [], metricasMensajeria: [], destinosPacientes: [] };

  const leads = d.leads || {};
  const consultas = d.consultas || {};
  const pacientes = d.pacientes || {};
  const tasas = d.tasas || {};
  const porEstado = (leads.por_estado || {}) as Record<string, number>;
  const porFuente = (leads.por_fuente || {}) as Record<string, number>;

  const kpi: KPIData = {
    totalPacientes: Number(pacientes.total) || 0,
    pacientesNuevosMes: Number(pacientes.nuevos_mes) || 0,
    consultasMes: Number(consultas.total_mes) || 0,
    consultasConfirmadasMes: Number(consultas.confirmadas_mes) + Number(consultas.programadas) || 0,
    tasaAsistencia: Number(tasas.asistencia) || 0,
    tasaConversion: Number(tasas.conversion) || 0,
    totalLeads: Number(leads.total) || 0,
    leadsNuevosMes: Number(leads.nuevos_mes) || 0,
  };

  // Funnel from por_estado with chart colors
  const stateColorMap: Record<string, string> = {
    nuevo: 'var(--chart-blue)',
    contactado: 'var(--chart-purple)',
    interesado: 'var(--chart-indigo)',
    calificado: 'var(--chart-cyan)',
    escalado: 'var(--chart-amber)',
    cita_agendada: 'var(--chart-teal)',
    convertido: 'var(--chart-emerald)',
    no_interesado: 'var(--chart-slate)',
    descartado: 'var(--chart-rose)',
  };
  const funnelLeads: ChartData[] = Object.entries(porEstado)
    .map(([name, value]) => ({ name, value: Number(value), fill: stateColorMap[name] || 'var(--chart-slate)' }))
    .sort((a, b) => b.value - a.value);

  // Sources from por_fuente with chart colors
  const sourceColors = ['var(--chart-blue)', 'var(--chart-emerald)', 'var(--chart-purple)', 'var(--chart-amber)', 'var(--chart-cyan)', 'var(--chart-rose)', 'var(--chart-indigo)', 'var(--chart-teal)'];
  const fuentesCaptacion: ChartData[] = Object.entries(porFuente)
    .map(([name, value], i) => ({ name, value: Number(value), fill: sourceColors[i % sourceColors.length] }))
    .sort((a, b) => b.value - a.value);

  // Chart data from RPC (already formatted as {name, value} arrays)
  const consultasPorSede: ChartData[] = (d.consultas_por_sede || []).map((item: ChartData, i: number) => ({
    ...item, fill: sourceColors[i % sourceColors.length]
  }));
  const estadoCitas: ChartData[] = (d.estado_citas || []).map((item: ChartData, i: number) => ({
    ...item, fill: sourceColors[i % sourceColors.length]
  }));
  const evolucionMensual: MonthlyData[] = d.evolucion_mensual || [];
  const destinosPacientes: ChartData[] = (d.destinos_pacientes || []).map((item: ChartData, i: number) => ({
    ...item, fill: sourceColors[i % sourceColors.length]
  }));
  const metricasMensajeria: ChartData[] = (d.metricas_mensajeria || []).map((item: ChartData, i: number) => ({
    ...item, fill: sourceColors[i % sourceColors.length]
  }));

  return {
    kpi,
    consultasPorSede,
    estadoCitas,
    evolucionMensual,
    funnelLeads,
    fuentesCaptacion,
    metricasMensajeria,
    destinosPacientes,
  };
};

/**
 * Hook useStats con SWR
 * ✅ Cache de 5 minutos
 * ✅ Mantiene datos previos mientras recarga
 * ✅ Deduplicación automática de requests
 */
/**
 * @param initialData - Datos pre-cargados desde Server Component (RSC pattern)
 *                      Se usa como fallbackData de SWR para render instantáneo sin flash de loading
 */
export function useStats(initialData?: StatsData) {
  const { data, error, isLoading, mutate } = useSWR<StatsData>(
    CACHE_KEYS.STATS,
    fetchStats,
    {
      ...SWR_CONFIG_DASHBOARD,
      ...(initialData ? { fallbackData: initialData } : {}),
    }
  );

  return {
    loading: isLoading && !initialData,
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
