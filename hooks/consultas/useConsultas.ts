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
 * Fetcher combinado - consultas con JOIN a pacientes + stats calculados
 * ✅ Usa queries directas (no RPC)
 */
const fetchConsultasWithStats = async (): Promise<CombinedConsultasResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  
  // Fetch consultas con nombre de paciente via JOIN
  const { data: rawConsultas, error, count } = await sb
    .from('consultas')
    .select('*, pacientes!consultas_paciente_id_fkey(nombre, apellido), sedes!consultas_sede_id_fkey(sede)', { count: 'exact' })
    .order('fecha_hora_inicio', { ascending: false })
    .limit(500)
  
  if (error) throw error
  
  const rows = (rawConsultas || []) as Array<Record<string, unknown>>
  
  // Mapear consultas resolviendo paciente nombre y sede
  const consultas = rows.map((row) => {
    const pacienteJoin = row.pacientes as { nombre?: string; apellido?: string } | null
    const sedeJoin = row.sedes as { sede?: string } | null
    const pacienteNombre = pacienteJoin 
      ? [pacienteJoin.nombre, pacienteJoin.apellido].filter(Boolean).join(' ') || 'Paciente sin nombre'
      : 'Paciente sin nombre'
    
    // Destructure out JOIN fields, inject sede as text for the mapper
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pacientes: _p, sedes: _s, ...restRow } = row as Record<string, unknown>
    const rowWithSede = { ...restRow, sede: sedeJoin?.sede || null }
    
    return mapConsultaFromDB(rowWithSede as unknown as ConsultaRow, pacienteNombre)
  })
  
  // Calcular stats client-side
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const todayStr = now.toISOString().split('T')[0]
  
  let programadas = 0, confirmadas = 0, completadas = 0, canceladas = 0
  let reagendadas = 0, noAsistio = 0, hoy = 0, semana = 0
  let polanco = 0, satelite = 0, primeraVez = 0, seguimiento = 0
  let totalDuracion = 0, countDuracion = 0
  let confPendientes = 0, confConfirmadas = 0, confVencidas = 0
  
  for (const c of consultas) {
    // Estado
    switch (c.estadoCita) {
      case 'Programada': case 'Pendiente': programadas++; break
      case 'Confirmada': confirmadas++; break
      case 'Completada': completadas++; break
      case 'Cancelada': canceladas++; break
      case 'Reagendada': reagendadas++; break
      case 'No Asistió': noAsistio++; break
    }
    // Fecha
    if (c.fechaConsulta === todayStr) hoy++
    if (new Date(c.fechaHoraInicio) >= startOfWeek) semana++
    // Sede
    if (c.sede === 'POLANCO') polanco++
    else if (c.sede === 'SATELITE') satelite++
    // Tipo
    if (c.tipoCita === 'Primera Vez') primeraVez++
    else if (c.tipoCita === 'Seguimiento') seguimiento++
    // Duración
    if (c.duracionMinutos > 0) { totalDuracion += c.duracionMinutos; countDuracion++ }
    // Confirmación
    if (c.estadoConfirmacion === 'Pendiente') confPendientes++
    else if (c.estadoConfirmacion === 'Confirmada' || c.confirmadoPaciente) confConfirmadas++
    else if (c.estadoCita === 'No Asistió' || c.estadoCita === 'Cancelada') confVencidas++
  }
  
  const total = consultas.length
  const tasaConfirmacion = total > 0 ? Math.round((confirmadas / total) * 100) : 0
  const tasaCancelacion = total > 0 ? Math.round((canceladas / total) * 100) : 0
  const finalizadas = completadas + noAsistio
  const tasaAsistencia = finalizadas > 0 ? Math.round((completadas / finalizadas) * 100) : 0
  
  const stats: ConsultasStatsResponse = {
    total, programadas, confirmadas, completadas, canceladas, reagendadas, noAsistio, hoy, semana,
    metricas: {
      tasaConfirmacion, tasaCancelacion, tasaAsistencia,
      confirmaciones: { pendientes: confPendientes, confirmadas: confConfirmadas, vencidas: confVencidas },
      porSede: { polanco, satelite },
      promedioDuracion: countDuracion > 0 ? Math.round(totalDuracion / countDuracion) : 30,
      primeraVez, seguimiento,
    }
  }
  
  return { consultas, stats, totalCount: count || total }
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
