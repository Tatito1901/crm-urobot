/**
 * ============================================================
 * HOOK: useConsultas
 * ============================================================
 * Hook optimizado con SWR para consultas
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Consulta, ConsultaRow } from '@/types/consultas'
import { mapConsultaFromDB } from '@/types/consultas'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface UseConsultasReturn {
  consultas: Consulta[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
  stats: {
    total: number
    programadas: number
    confirmadas: number
    completadas: number
    canceladas: number
    reagendadas: number
    noAsistio: number
    hoy: number
    semana: number
  }
  metricas: {
    tasaConfirmacion: number
    tasaCancelacion: number
    tasaAsistencia: number
    
    // Métricas de confirmación (Simplificadas)
    confirmaciones: {
      pendientes: number
      confirmadas: number
      vencidas: number
    }
    
    // Métricas de sedes
    porSede: {
      polanco: number
      satelite: number
    }
    
    // Métricas de tiempo
    promedioDuracion: number
    
    // Métricas de tipo (Estimadas)
    primeraVez: number
    seguimiento: number
  }
}

interface ConsultasStatsResponse {
  total: number
  programadas: number
  confirmadas: number
  completadas: number
  canceladas: number
  reagendadas: number
  noAsistio: number
  hoy: number
  semana: number
  metricas: {
    tasaConfirmacion: number
    tasaCancelacion: number
    tasaAsistencia: number
    confirmaciones: {
      pendientes: number
      confirmadas: number
      vencidas: number
    }
    porSede: {
      polanco: number
      satelite: number
    }
    promedioDuracion: number
    primeraVez: number
    seguimiento: number
  }
}

interface CombinedConsultasResponse {
  consultas: Consulta[]
  stats: ConsultasStatsResponse
  totalCount: number
}

/**
 * Fetcher combinado - UNA sola llamada para consultas + stats
 * ✅ OPTIMIZACIÓN: Reduce de 2 llamadas a 1
 */
const fetchConsultasWithStats = async (): Promise<CombinedConsultasResponse> => {
  const { data, error } = await supabase.rpc('get_consultas_with_stats' as never, {
    p_limit: 500,
    p_offset: 0
  } as never)
  
  if (error) throw error
  
  const result = data as { 
    consultas: Array<ConsultaRow & { paciente_nombre: string }>, 
    stats: ConsultasStatsResponse,
    totalCount: number
  }
  
  // Mapear consultas
  const consultas = (result.consultas || []).map(row => {
    return mapConsultaFromDB(row as unknown as ConsultaRow, row.paciente_nombre || 'Paciente sin nombre')
  })
  
  return {
    consultas,
    stats: result.stats,
    totalCount: result.totalCount || consultas.length
  }
}

/**
 * Hook para gestionar consultas
 *
 * ✅ OPTIMIZADO: Una sola llamada RPC para consultas + stats
 * - Cache de 15 minutos
 * - Sin revalidación automática
 * - Mantiene datos previos mientras recarga
 */
export function useConsultas(): UseConsultasReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'consultas-combined',
    fetchConsultasWithStats,
    SWR_CONFIG_STANDARD
  )

  // Valores por defecto
  const defaultStats = {
    total: 0, programadas: 0, confirmadas: 0, completadas: 0, 
    canceladas: 0, reagendadas: 0, noAsistio: 0, hoy: 0, semana: 0
  }
  
  const defaultMetricas = {
    tasaConfirmacion: 0, tasaCancelacion: 0, tasaAsistencia: 0,
    confirmaciones: { pendientes: 0, confirmadas: 0, vencidas: 0 },
    porSede: { polanco: 0, satelite: 0 },
    promedioDuracion: 30, primeraVez: 0, seguimiento: 0
  }

  return {
    consultas: data?.consultas || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.totalCount || 0,
    stats: data?.stats || defaultStats,
    metricas: data?.stats?.metricas || defaultMetricas,
  }
}
