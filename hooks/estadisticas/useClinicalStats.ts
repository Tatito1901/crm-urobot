/**
 * ============================================================
 * HOOK: useClinicalStats - Métricas Clínicas Avanzadas
 * ============================================================
 * ✅ Usa RPC get_clinical_insights()
 * ✅ Incluye: diagnósticos, procedimientos, sedes, patrones
 * ✅ Datos para análisis de práctica médica
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD, CACHE_KEYS } from '@/lib/swr-config';

// Tipos para KPIs clínicos
export interface KPIClinico {
  pacientesUnicos: number;
  totalConsultas: number;
  completadas: number;
  canceladas: number;
  primeraVez: number;
  seguimiento: number;
  tasaAsistenciaGlobal: number;
  consultasPorPaciente: number;
  ratioSeguimientoPrimera: number;
}

// Tipos para diagnósticos y procedimientos
export interface DiagnosticoData {
  name: string;
  value: number;
  fill: string;
}

export interface ProcedimientoData {
  name: string;
  value: number;
  fill: string;
}

// Tipo para rendimiento por sede
export interface SedeRendimiento {
  name: string;
  totalConsultas: number;
  completadas: number;
  canceladas: number;
  tasaAsistencia: number;
  fill: string;
}

// Tipo para demanda por día
export interface DemandaDia {
  name: string;
  consultas: number;
  tasaAsistencia: number;
  orden: number;
}

// Tipo para pacientes fieles
export interface PacienteFiel {
  nombre: string;
  totalConsultas: number;
  completadas: number;
  primeraVisita: string;
  ultimaVisita: string;
}

// Tipo para motivos de consulta
export interface MotivoConsulta {
  name: string;
  value: number;
  tasaAsistencia: number;
}

// Tipo para tendencia mensual
export interface TendenciaMensual {
  mes: string;
  polanco: number;
  satelite: number;
  total: number;
}

// Interface completa de datos
interface ClinicalStatsData {
  kpiClinico: KPIClinico;
  topDiagnosticos: DiagnosticoData[];
  topProcedimientos: ProcedimientoData[];
  rendimientoSedes: SedeRendimiento[];
  demandaPorDia: DemandaDia[];
  pacientesFieles: PacienteFiel[];
  motivosConsulta: MotivoConsulta[];
  tendenciaMensual: TendenciaMensual[];
}

// Valores por defecto
const defaultKPIClinico: KPIClinico = {
  pacientesUnicos: 0,
  totalConsultas: 0,
  completadas: 0,
  canceladas: 0,
  primeraVez: 0,
  seguimiento: 0,
  tasaAsistenciaGlobal: 0,
  consultasPorPaciente: 0,
  ratioSeguimientoPrimera: 0,
};

const supabase = createClient();

/**
 * Fetcher para métricas clínicas
 */
const fetchClinicalStats = async (): Promise<ClinicalStatsData> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_clinical_insights');

  if (error) throw error;

  return {
    kpiClinico: data?.kpiClinico || defaultKPIClinico,
    topDiagnosticos: data?.topDiagnosticos || [],
    topProcedimientos: data?.topProcedimientos || [],
    rendimientoSedes: data?.rendimientoSedes || [],
    demandaPorDia: data?.demandaPorDia || [],
    pacientesFieles: data?.pacientesFieles || [],
    motivosConsulta: data?.motivosConsulta || [],
    tendenciaMensual: data?.tendenciaMensual || [],
  };
};

/**
 * Hook useClinicalStats con SWR
 * ✅ Cache de 5 minutos
 * ✅ Mantiene datos previos mientras recarga
 */
export function useClinicalStats() {
  const { data, error, isLoading, mutate } = useSWR<ClinicalStatsData>(
    CACHE_KEYS.STATS + '_clinical',
    fetchClinicalStats,
    SWR_CONFIG_DASHBOARD
  );

  return {
    loading: isLoading,
    error: error || null,
    refresh: () => mutate(),
    kpiClinico: data?.kpiClinico || defaultKPIClinico,
    topDiagnosticos: data?.topDiagnosticos || [],
    topProcedimientos: data?.topProcedimientos || [],
    rendimientoSedes: data?.rendimientoSedes || [],
    demandaPorDia: data?.demandaPorDia || [],
    pacientesFieles: data?.pacientesFieles || [],
    motivosConsulta: data?.motivosConsulta || [],
    tendenciaMensual: data?.tendenciaMensual || [],
  };
}
