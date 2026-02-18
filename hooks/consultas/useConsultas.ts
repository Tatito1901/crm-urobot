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
 * ✅ OPTIMIZADO: Stats vía RPC server-side + consultas lista en paralelo
 * Antes: 1 query de 500 rows con JOINs + cómputo pesado client-side
 * Ahora: 2 queries paralelas — 1 RPC ligera + 1 lista con solo campos necesarios
 */
const fetchConsultasWithStats = async (): Promise<CombinedConsultasResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  
  // ✅ Paralelo: stats RPC + lista consultas
  const [statsResult, consultasResult] = await Promise.all([
    // Stats calculadas en PostgreSQL (0 rows transferidas)
    sb.rpc('get_consultas_stats'),
    // Lista con solo campos necesarios para la UI
    sb
      .from('consultas')
      .select('*, pacientes!consultas_paciente_id_fkey(nombre, apellido), sedes!consultas_sede_id_fkey(sede)', { count: 'exact' })
      .order('fecha_hora_inicio', { ascending: false })
      .limit(200)
  ])
  
  if (consultasResult.error) throw consultasResult.error
  
  const rows = (consultasResult.data || []) as Array<Record<string, unknown>>
  
  // Mapear consultas resolviendo paciente nombre y sede
  const consultas = rows.map((row) => {
    const pacienteJoin = row.pacientes as { nombre?: string; apellido?: string } | null
    const sedeJoin = row.sedes as { sede?: string } | null
    const pacienteNombre = pacienteJoin 
      ? [pacienteJoin.nombre, pacienteJoin.apellido].filter(Boolean).join(' ') || 'Paciente sin nombre'
      : 'Paciente sin nombre'
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pacientes: _p, sedes: _s, ...restRow } = row as Record<string, unknown>
    const rowWithSede = { ...restRow, sede: sedeJoin?.sede || null }
    
    return mapConsultaFromDB(rowWithSede as unknown as ConsultaRow, pacienteNombre)
  })
  
  // Parse stats de la RPC (ya calculadas server-side)
  const rpcStats = statsResult.data as Record<string, unknown> | null
  const metricsRaw = (rpcStats?.metricas || {}) as Record<string, unknown>
  const porSedeRaw = (metricsRaw.porSede || {}) as Record<string, number>
  const confirmacionesRaw = (metricsRaw.confirmaciones || {}) as Record<string, number>
  
  const stats: ConsultasStatsResponse = {
    total: Number(rpcStats?.total) || consultas.length,
    programadas: Number(rpcStats?.programadas) || 0,
    confirmadas: Number(rpcStats?.confirmadas) || 0,
    completadas: Number(rpcStats?.completadas) || 0,
    canceladas: Number(rpcStats?.canceladas) || 0,
    reagendadas: Number(rpcStats?.reagendadas) || 0,
    noAsistio: Number(rpcStats?.noAsistio) || 0,
    hoy: Number(rpcStats?.hoy) || 0,
    semana: Number(rpcStats?.semana) || 0,
    metricas: {
      tasaConfirmacion: Number(metricsRaw.tasaConfirmacion) || 0,
      tasaCancelacion: Number(metricsRaw.tasaCancelacion) || 0,
      tasaAsistencia: Number(metricsRaw.tasaAsistencia) || 0,
      confirmaciones: {
        pendientes: Number(confirmacionesRaw.pendientes) || 0,
        confirmadas: Number(confirmacionesRaw.confirmadas) || 0,
        vencidas: Number(confirmacionesRaw.vencidas) || 0,
      },
      porSede: {
        polanco: Number(porSedeRaw.POLANCO || porSedeRaw.polanco) || 0,
        satelite: Number(porSedeRaw.SATELITE || porSedeRaw.satelite) || 0,
      },
      promedioDuracion: Number(metricsRaw.promedioDuracion) || 30,
      primeraVez: Number(metricsRaw.primeraVez) || 0,
      seguimiento: Number(metricsRaw.seguimiento) || 0,
    }
  }
  
  return { consultas, stats, totalCount: consultasResult.count || consultas.length }
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
