/**
 * ============================================================
 * HOOK: useConsultas
 * ============================================================
 * Hook optimizado con SWR para consultas
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import { useMemo } from 'react'
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

// Tipo intermedio para el JOIN de Supabase
// Extiende ConsultaRow (sincronizado con BD) con datos del paciente relacionado
type ConsultaRowWithPaciente = ConsultaRow & {
  paciente: {
    id: string
    nombre_completo: string
  } | null
}

const mapConsulta = (row: ConsultaRowWithPaciente): Consulta => {
  // Mapeo usando utilidades centralizadas con nombre del paciente
  return mapConsultaFromDB(row, row.paciente?.nombre_completo ?? 'Paciente sin nombre');
}

/**
 * Fetcher para consultas
 * ✅ OPTIMIZACIÓN: Limitar a últimos 6 meses + solo campos necesarios
 * Para historial completo usar paginación
 */
const fetchConsultas = async (): Promise<{ consultas: Consulta[], count: number }> => {
  // Limitar a últimos 6 meses para rendimiento (cubre la mayoría de casos de uso)
  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);
  
  const { data, error, count } = await supabase
    .from('consultas')
    .select(`
      id,
      consulta_id,
      paciente_id,
      sede,
      fecha_hora_inicio,
      fecha_hora_fin,
      estado_cita,
      tipo_cita,
      motivo_consulta,
      calendar_event_id,
      calendar_link,
      confirmado_paciente,
      estado_confirmacion,
      recordatorio_24h_enviado,
      recordatorio_2h_enviado,
      recordatorio_48h_enviado,
      cancelado_por,
      created_at,
      updated_at,
      paciente:pacientes ( id, nombre_completo )
    `, { count: 'exact' })
    .gte('fecha_hora_inicio', hace6Meses.toISOString())
    .order('fecha_hora_inicio', { ascending: false })
    .limit(1000) // Límite de seguridad

  if (error) throw error

  // Casting necesario para el JOIN
  const rawData = (data || []) as unknown as ConsultaRowWithPaciente[];
  const consultas = rawData.map(mapConsulta)
  
  return { consultas, count: count || consultas.length }
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

/**
 * Fetcher para estadísticas de consultas (RPC)
 */
const fetchConsultasStats = async (): Promise<ConsultasStatsResponse | null> => {
  const { data, error } = await supabase.rpc('get_consultas_stats')
  if (error) throw error
  return data as unknown as ConsultasStatsResponse
}

/**
 * Hook para gestionar consultas
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 * - ✅ REALTIME: Se suscribe a cambios en la tabla 'consultas'
 */
export function useConsultas(): UseConsultasReturn {
  // 1. Fetch Consultas (Lista)
  const { data: dataConsultas, error: errorConsultas, isLoading: loadingConsultas, mutate: mutateConsultas } = useSWR(
    'consultas',
    fetchConsultas,
    SWR_CONFIG_STANDARD
  )

  // 2. Fetch Stats (Agregados Real-time)
  const { data: dataStats, error: errorStats, isLoading: loadingStats, mutate: mutateStats } = useSWR(
    'consultas_stats',
    fetchConsultasStats,
    SWR_CONFIG_STANDARD
  )

  // ❌ Realtime DESHABILITADO - Consumía demasiados recursos
  // Los datos se actualizan vía SWR con revalidateOnFocus

  const consultas = dataConsultas?.consultas || []

  // Valores por defecto si no hay datos
  const defaultStats = {
    total: 0, programadas: 0, confirmadas: 0, completadas: 0, canceladas: 0, reagendadas: 0, noAsistio: 0, hoy: 0, semana: 0
  }
  
  const defaultMetricas = {
    tasaConfirmacion: 0, tasaCancelacion: 0, tasaAsistencia: 0,
    confirmaciones: { pendientes: 0, confirmadas: 0, vencidas: 0 },
    porSede: { polanco: 0, satelite: 0 },
    promedioDuracion: 30, primeraVez: 0, seguimiento: 0
  }

  const stats = dataStats ? {
    total: dataStats.total,
    programadas: dataStats.programadas,
    confirmadas: dataStats.confirmadas,
    completadas: dataStats.completadas,
    canceladas: dataStats.canceladas,
    reagendadas: dataStats.reagendadas,
    noAsistio: dataStats.noAsistio,
    hoy: dataStats.hoy,
    semana: dataStats.semana
  } : defaultStats

  return {
    consultas,
    loading: loadingConsultas || loadingStats,
    error: errorConsultas || errorStats || null,
    refetch: async () => { await Promise.all([mutateConsultas(), mutateStats()]) },
    totalCount: dataConsultas?.count || 0,
    stats,
    metricas: dataStats?.metricas || defaultMetricas,
  }
}
