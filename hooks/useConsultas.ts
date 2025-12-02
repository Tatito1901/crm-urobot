/**
 * ============================================================
 * HOOK: useConsultas
 * ============================================================
 * Hook optimizado con SWR para consultas
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import { useEffect, useMemo } from 'react'
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
        () => {
          mutate() // Revalida los datos sin recargar página
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const consultas = data?.consultas || []

  // ✅ OPTIMIZACIÓN: Memoizar todos los cálculos para evitar recálculos en cada render
  const { stats, metricas } = useMemo(() => {
    const now = new Date()
    const hoyStr = now.toISOString().split('T')[0]
    const semanaDespues = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    // Single-pass para contar todos los estados (más eficiente que múltiples .filter())
    let programadas = 0, confirmadas = 0, completadas = 0, canceladas = 0, reagendadas = 0, noAsistio = 0
    let hoy = 0, semana = 0
    let polanco = 0, satelite = 0
    let primeraVez = 0, seguimiento = 0
    let totalDuracion = 0
    let pendientesConf = 0, confirmadasConf = 0, vencidasConf = 0
    
    for (const c of consultas) {
      // Estados de cita
      switch (c.estadoCita) {
        case 'Programada': programadas++; break
        case 'Confirmada': confirmadas++; break
        case 'Completada': completadas++; break
        case 'Cancelada': canceladas++; break
        case 'Reagendada': reagendadas++; break
        case 'No Asistió': noAsistio++; break
      }
      
      // Temporales
      if (c.fechaConsulta === hoyStr) hoy++
      const fecha = new Date(c.fechaConsulta)
      if (fecha >= now && fecha <= semanaDespues) semana++
      
      // Sedes
      if (c.sede === 'POLANCO') polanco++
      else if (c.sede === 'SATELITE') satelite++
      
      // Tipos
      if (c.tipoCita === 'Primera Vez') primeraVez++
      else if (c.tipoCita === 'Seguimiento') seguimiento++
      
      // Duración
      totalDuracion += c.duracionMinutos
      
      // Confirmaciones futuras
      if ((c.horasHastaConsulta || 0) > 0) {
        if (c.estadoConfirmacion === 'Confirmada' || c.confirmadoPaciente) {
          confirmadasConf++
        } else if (c.estadoConfirmacion === 'Pendiente') {
          pendientesConf++
          if (!c.confirmadoPaciente && (c.horasHastaConsulta ?? 0) < 3) vencidasConf++
        }
      }
    }
    
    const total = consultas.length
    const consultasFinalizadas = completadas + noAsistio
    
    return {
      stats: {
        total,
        programadas,
        confirmadas,
        completadas,
        canceladas,
        reagendadas,
        noAsistio,
        hoy,
        semana,
      },
      metricas: {
        tasaConfirmacion: total > 0 ? Math.round((confirmadas / total) * 100) : 0,
        tasaCancelacion: total > 0 ? Math.round((canceladas / total) * 100) : 0,
        tasaAsistencia: consultasFinalizadas > 0 ? Math.round((completadas / consultasFinalizadas) * 100) : 0,
        confirmaciones: { pendientes: pendientesConf, confirmadas: confirmadasConf, vencidas: vencidasConf },
        porSede: { polanco, satelite },
        promedioDuracion: total > 0 ? Math.round(totalDuracion / total) : 30,
        primeraVez,
        seguimiento,
      }
    }
  }, [consultas])

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
