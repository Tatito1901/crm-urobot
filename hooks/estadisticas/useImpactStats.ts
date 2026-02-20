/**
 * ============================================================
 * HOOK: useImpactStats - Métricas de Impacto y ROI
 * ============================================================
 * Consume la RPC get_impact_stats() para mostrar:
 * - Rendimiento por canal de marketing
 * - Impacto de Urobot
 * - Comparativas temporales
 * - Métricas de eficiencia
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD, CACHE_KEYS } from '@/lib/swr-config';

// ============================================================
// TIPOS
// ============================================================

export interface CanalRendimiento {
  canal: string;
  leads_total: number;
  leads_convertidos: number;
  pacientes_generados: number;
  tasa_conversion: number;
  consultas_completadas: number;
}

interface ImpactoUrobot {
  citasAgendadasBot: number;
  mensajesAtendidos: number;
  mensajesFueraHorario: number;
  tiempoPromedioRespuestaMs: number;
  tasaExito: number;
  usuariosUnicos: number;
}

interface DatosMes {
  periodo: string;
  consultasProgramadas: number;
  consultasCompletadas: number;
  pacientesNuevos: number;
  leadsNuevos: number;
  leadsConvertidos: number;
}

interface Variaciones {
  consultas: number;
  pacientes: number;
  leads: number;
}

interface ComparativaMensual {
  mesActual: DatosMes;
  mesAnterior: DatosMes;
  variaciones: Variaciones;
}

interface Eficiencia {
  tasaConfirmacion: number;
  tasaAsistencia: number;
  tasaCancelacion: number;
  pacientesRecurrentes: number;
  promedioConsultasPorPaciente: number;
  tiempoPromedioConversion: number | null;
}

export interface EvolucionMes {
  mes: string;
  mes_corto: string;
  consultas: number;
  completadas: number;
  pacientes_unicos: number;
}

interface OrigenTop {
  origen: string;
  total: number;
  activos: number;
}

interface ImpactStats {
  rendimientoCanales: CanalRendimiento[];
  impactoUrobot: ImpactoUrobot;
  comparativaMensual: ComparativaMensual;
  eficiencia: Eficiencia;
  evolucion6Meses: EvolucionMes[];
  topOrigenes: OrigenTop[];
}

// ============================================================
// VALORES POR DEFECTO
// ============================================================

const defaultImpactoUrobot: ImpactoUrobot = {
  citasAgendadasBot: 0,
  mensajesAtendidos: 0,
  mensajesFueraHorario: 0,
  tiempoPromedioRespuestaMs: 0,
  tasaExito: 100,
  usuariosUnicos: 0,
};

const defaultDatosMes: DatosMes = {
  periodo: '',
  consultasProgramadas: 0,
  consultasCompletadas: 0,
  pacientesNuevos: 0,
  leadsNuevos: 0,
  leadsConvertidos: 0,
};

const defaultComparativa: ComparativaMensual = {
  mesActual: defaultDatosMes,
  mesAnterior: defaultDatosMes,
  variaciones: { consultas: 0, pacientes: 0, leads: 0 },
};

const defaultEficiencia: Eficiencia = {
  tasaConfirmacion: 0,
  tasaAsistencia: 0,
  tasaCancelacion: 0,
  pacientesRecurrentes: 0,
  promedioConsultasPorPaciente: 0,
  tiempoPromedioConversion: null,
};

const defaultStats: ImpactStats = {
  rendimientoCanales: [],
  impactoUrobot: defaultImpactoUrobot,
  comparativaMensual: defaultComparativa,
  eficiencia: defaultEficiencia,
  evolucion6Meses: [],
  topOrigenes: [],
};

// ============================================================
// FETCHER
// ============================================================

const supabase = createClient();

const fetchImpactStats = async (): Promise<ImpactStats> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_impact_stats');

  if (error) {
    console.error('Error fetching impact stats:', error);
    throw error;
  }

  return {
    rendimientoCanales: data?.rendimientoCanales || [],
    impactoUrobot: data?.impactoUrobot || defaultImpactoUrobot,
    comparativaMensual: data?.comparativaMensual || defaultComparativa,
    eficiencia: data?.eficiencia || defaultEficiencia,
    evolucion6Meses: data?.evolucion6Meses || [],
    topOrigenes: data?.topOrigenes || [],
  };
};

// ============================================================
// HOOK
// ============================================================

export function useImpactStats() {
  const { data, error, isLoading, mutate } = useSWR<ImpactStats>(
    CACHE_KEYS.STATS + '_impact',
    fetchImpactStats,
    SWR_CONFIG_DASHBOARD
  );

  return {
    loading: isLoading,
    error: error || null,
    refresh: () => mutate(),
    
    // Datos desestructurados
    rendimientoCanales: data?.rendimientoCanales || [],
    impactoUrobot: data?.impactoUrobot || defaultImpactoUrobot,
    comparativaMensual: data?.comparativaMensual || defaultComparativa,
    eficiencia: data?.eficiencia || defaultEficiencia,
    evolucion6Meses: data?.evolucion6Meses || [],
    topOrigenes: data?.topOrigenes || [],
    
    // Stats completo
    stats: data || defaultStats,
  };
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Formatea el tiempo de respuesta en formato legible
 */
export function formatTiempoRespuesta(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Calcula el color según la variación (positivo=verde, negativo=rojo)
 */
export function getVariacionColor(valor: number): string {
  if (valor > 0) return 'text-emerald-600 dark:text-emerald-400';
  if (valor < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

/**
 * Formatea variación con signo
 */
export function formatVariacion(valor: number): string {
  if (valor > 0) return `+${valor}%`;
  return `${valor}%`;
}
