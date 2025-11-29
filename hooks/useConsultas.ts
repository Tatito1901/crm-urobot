/**
 * ============================================================
 * HOOK: useConsultas
 * ============================================================
 * Hook optimizado con SWR para consultas
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import { useEffect } from 'react'
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
 * ✅ Campos sincronizados con BD real (types/supabase.ts)
 */
const fetchConsultas = async (): Promise<{ consultas: Consulta[], count: number }> => {
  const { data, error, count } = await supabase
    .from('consultas')
    .select(`
      *,
      paciente:pacientes ( id, nombre_completo )
    `, { count: 'exact' })
    .order('fecha_hora_inicio', { ascending: false })

  if (error) throw error

  // Casting necesario para el JOIN
  const rawData = (data || []) as unknown as ConsultaRowWithPaciente[];
  const consultas = rawData.map(mapConsulta)
  
  return { consultas, count: count || consultas.length }
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
  const { data, error, isLoading, mutate } = useSWR(
    'consultas',
    fetchConsultas,
    SWR_CONFIG_STANDARD
  )

  // ✅ Suscripción Realtime a tabla 'consultas'
  useEffect(() => {
    const channel = supabase
      .channel('consultas-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'consultas',
        },
        (payload) => {
          console.log('🔔 Cambio detectado en consultas:', payload.eventType)
          mutate() // Revalida los datos sin recargar página
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const consultas = data?.consultas || []

  const now = new Date()
  const hoyStr = now.toISOString().split('T')[0]
  const semanaDespues = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Calcular estadísticas básicas (usa estadoCita, no estado)
  const stats = {
    total: consultas.length,
    programadas: consultas.filter(c => c.estadoCita === 'Programada').length,
    confirmadas: consultas.filter(c => c.estadoCita === 'Confirmada').length,
    completadas: consultas.filter(c => c.estadoCita === 'Completada').length,
    canceladas: consultas.filter(c => c.estadoCita === 'Cancelada').length,
    reagendadas: consultas.filter(c => c.estadoCita === 'Reagendada').length,
    noAsistio: consultas.filter(c => c.estadoCita === 'No Asistió').length,
    hoy: consultas.filter(c => c.fechaConsulta === hoyStr).length,
    semana: consultas.filter(c => {
      const fecha = new Date(c.fechaConsulta)
      return fecha >= now && fecha <= semanaDespues
    }).length,
  }
  
  // Calcular métricas avanzadas
  const consultasFinalizadas = stats.completadas + stats.noAsistio
  const tasaConfirmacion = stats.total > 0
    ? Math.round((stats.confirmadas / stats.total) * 100)
    : 0
  
  const tasaCancelacion = stats.total > 0
    ? Math.round((stats.canceladas / stats.total) * 100)
    : 0
  
  const tasaAsistencia = consultasFinalizadas > 0
    ? Math.round((stats.completadas / consultasFinalizadas) * 100)
    : 0
  
  // Distribución por sede
  const porSede = {
    polanco: consultas.filter(c => c.sede === 'POLANCO').length,
    satelite: consultas.filter(c => c.sede === 'SATELITE').length,
  }
  
  // Duración promedio
  const promedioDuracion = consultas.length > 0
    ? Math.round(consultas.reduce((sum, c) => sum + c.duracionMinutos, 0) / consultas.length)
    : 30
  
  // Tipo de consulta (usa tipoCita, no tipo)
  const primeraVez = consultas.filter(c => c.tipoCita === 'Primera Vez').length
  const seguimiento = consultas.filter(c => c.tipoCita === 'Seguimiento').length
  
  // Métricas de confirmación
  const consultasFuturas = consultas.filter(c => 
    (c.horasHastaConsulta || 0) > 0
  )
  
  // Calcular vencidas: consultas no confirmadas a menos de 3 horas
  const confirmaciones = {
    pendientes: consultasFuturas.filter(c => c.estadoConfirmacion === 'Pendiente').length,
    confirmadas: consultasFuturas.filter(c => c.estadoConfirmacion === 'Confirmada' || c.confirmadoPaciente).length,
    vencidas: consultasFuturas.filter(c => 
      c.estadoConfirmacion === 'Pendiente' && 
      !c.confirmadoPaciente && 
      (c.horasHastaConsulta ?? 0) < 3
    ).length,
  }
  
  const metricas = {
    tasaConfirmacion,
    tasaCancelacion,
    tasaAsistencia,
    confirmaciones,
    porSede,
    promedioDuracion,
    primeraVez,
    seguimiento,
  }

  return {
    consultas,
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats,
    metricas,
  }
}
