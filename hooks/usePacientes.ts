/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook optimizado con SWR para pacientes
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import { useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { type Paciente, type PacienteRow, type PacienteStatsRow, mapPacienteFromDB } from '@/types/pacientes'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface UsePacientesReturn {
  pacientes: Paciente[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
  stats: {
    total: number
    activos: number
    inactivos: number
    recientes: number
    requierenAtencion: number
    conConsultas: number
    sinConsultas: number
  }
  metricas: {
    // Métricas de retención
    tasaRetencion: number          // % pacientes con 2+ consultas
    pacientesFrecuentes: number    // 5+ consultas
    
    // Métricas de datos
    conDatosCompletos: number      // Email + teléfono
    sinEmail: number               // Falta email
    
    // Métricas de riesgo
    enRiesgo: number              // 180+ días sin consulta
    
    // Distribución
    porFuente: {
      whatsapp: number
      referido: number
      web: number
      otros: number
    }
    
    // Temporales
    nuevosMes: number             // Últimos 30 días
    recurrentesMes: number        // Con consulta en últimos 30d
  }
}

/**
 * Fetcher para pacientes
 * ✅ Campos sincronizados con BD real (types/supabase.ts)
 * ✅ Usa vista paciente_stats para estadísticas calculadas
 */
const fetchPacientes = async (): Promise<{ pacientes: Paciente[], count: number }> => {
  // Query principal de pacientes
  const { data, error, count } = await supabase
    .from('pacientes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  if (!data) {
    return { pacientes: [], count: 0 }
  }

  // Obtener estadísticas de la vista paciente_stats
  const { data: statsData } = await supabase
    .from('paciente_stats')
    .select('*')

  const statsMap = new Map(
    (statsData || []).map(s => [s.paciente_id, s])
  )

  // Mapear los pacientes con sus estadísticas
  const pacientes = (data as PacienteRow[]).map(row => {
    const stats = statsMap.get(row.id) || null
    return mapPacienteFromDB(row, stats)
  })
  
  return { pacientes, count: pacientes.length }
}

/**
 * Hook para gestionar pacientes
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 */
export function usePacientes(): UsePacientesReturn {
  const { data, error, isLoading, mutate } = useSWR<{ pacientes: Paciente[], count: number }>(
    'pacientes',
    fetchPacientes,
    SWR_CONFIG_STANDARD
  )

  const pacientes = data?.pacientes || []
  
  // ✅ OPTIMIZACIÓN: Single-pass memoizado para todos los cálculos
  const { stats, metricas } = useMemo(() => {
    const now = Date.now()
    const hace30Dias = now - 30 * 24 * 60 * 60 * 1000
    const hace180Dias = now - 180 * 24 * 60 * 60 * 1000
    
    // Contadores
    let activos = 0, inactivos = 0, recientes = 0, requierenAtencion = 0
    let conConsultas = 0, sinConsultas = 0
    let retenidos = 0, frecuentes = 0, conDatosCompletos = 0, sinEmail = 0, enRiesgo = 0
    let whatsapp = 0, referido = 0, web = 0
    let nuevosMes = 0, recurrentesMes = 0
    
    for (const p of pacientes) {
      const totalConsultas = p.totalConsultas ?? 0
      const createdAtTime = p.createdAt ? new Date(p.createdAt).getTime() : 0
      const ultimaConsultaTime = p.ultimaConsulta ? new Date(p.ultimaConsulta).getTime() : 0
      const esActivo = p.estado === 'Activo'
      
      // Estado
      if (esActivo) activos++
      else if (p.estado === 'Inactivo') inactivos++
      
      // Recientes
      if (createdAtTime >= hace30Dias) {
        recientes++
        nuevosMes++
      }
      
      // Requieren atención
      if (esActivo && ultimaConsultaTime > 0 && ultimaConsultaTime < hace180Dias) {
        requierenAtencion++
        enRiesgo++
      }
      
      // Consultas
      if (totalConsultas > 0) {
        conConsultas++
        if (totalConsultas >= 2) retenidos++
        if (totalConsultas >= 5) frecuentes++
      } else {
        sinConsultas++
      }
      
      // Datos completos
      const tieneEmail = p.email && p.email.trim() !== ''
      const tieneTelefono = p.telefono && p.telefono.trim() !== ''
      if (tieneEmail && tieneTelefono) conDatosCompletos++
      if (!tieneEmail) sinEmail++
      
      // Fuente
      const origen = (p.origenLead || '').toLowerCase()
      if (origen.includes('whatsapp')) whatsapp++
      else if (origen.includes('referido') || origen.includes('recomendación')) referido++
      else if (origen.includes('web') || origen.includes('sitio')) web++
      
      // Recurrentes mes
      if (ultimaConsultaTime >= hace30Dias) recurrentesMes++
    }
    
    const total = pacientes.length
    const otros = Math.max(0, total - (whatsapp + referido + web))
    
    return {
      stats: {
        total,
        activos,
        inactivos,
        recientes,
        requierenAtencion,
        conConsultas,
        sinConsultas,
      },
      metricas: {
        tasaRetencion: conConsultas > 0 ? Math.round((retenidos / conConsultas) * 100) : 0,
        pacientesFrecuentes: frecuentes,
        conDatosCompletos,
        sinEmail,
        enRiesgo,
        porFuente: { whatsapp, referido, web, otros },
        nuevosMes,
        recurrentesMes,
      }
    }
  }, [pacientes])

  return {
    pacientes,
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats,
    metricas,
  }
}
