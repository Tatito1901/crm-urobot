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
import type { Consulta } from '@/types/consultas'
import type { Tables } from '@/types/database'
import { mapConsultaFromDB, enrichConsulta } from '@/lib/mappers'

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
    // Métricas operativas
    tasaConfirmacion: number       // % confirmadas
    tasaCancelacion: number        // % canceladas
    tasaAsistencia: number         // % completadas vs no asistió
    
    // Métricas de confirmación (NUEVO)
    confirmaciones: {
      pendientes: number           // Sin confirmar
      confirmadas: number          // Confirmadas
      noConfirmadas: number        // No confirmadas
      vencidas: number             // Pasó fecha límite
      requierenAtencion: number    // Próximas sin confirmar
    }
    
    // Métricas de recordatorios (NUEVO)
    recordatorios: {
      inicialEnviado: number
      rem48h: number
      rem24h: number
      rem3h: number
      sinEnviar: number
    }
    
    // Métricas de sedes
    porSede: {
      polanco: number
      satelite: number
    }
    
    // Métricas de tiempo
    promedioDuracion: number       // Minutos promedio
    
    // Métricas de canal
    porCanal: {
      whatsapp: number
      telefono: number
      web: number
      otros: number
    }
    
    // Métricas de tipo
    primeraVez: number
    seguimiento: number
  }
}

type ConsultaRow = Tables<'consultas'> & {
  paciente: {
    id: string
    nombre_completo: string
  } | null
}

const mapConsulta = (row: ConsultaRow): Consulta => {
  // 1. Mapeo base usando utilidades centralizadas
  // Hacemos cast a Tables<'consultas'> porque row tiene propiedades extra (paciente)
  // que mapConsultaFromDB ignorará
  const consultaBase = mapConsultaFromDB(row as unknown as Tables<'consultas'>);
  
  // 2. Enriquecimiento con lógica de negocio (confirmaciones, tiempos)
  const consultaEnriquecida = enrichConsulta(consultaBase);

  // 3. Inyección de datos relacionales (Paciente)
  return {
    ...consultaEnriquecida,
    paciente: row.paciente?.nombre_completo ?? 'Paciente sin nombre',
    pacienteId: row.paciente_id, // Asegurar que usamos el ID correcto
  };
}

/**
 * Fetcher para consultas
 */
const fetchConsultas = async (): Promise<{ consultas: Consulta[], count: number }> => {
  const { data, error, count } = await supabase
    .from('consultas')
    .select('*, paciente:pacientes ( id, nombre_completo )', { count: 'exact' })
    .order('fecha_consulta', { ascending: false })

  if (error) throw error

  const consultas = (data || []).map(mapConsulta)
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
    {
      // ✅ Revalidar cuando el usuario vuelve a la pestaña
      revalidateOnFocus: true,

      // ✅ Revalidar si pierde conexión y vuelve (útil en mobile)
      revalidateOnReconnect: true,

      // ✅ Caché compartido por 5 minutos (evita requests duplicados)
      dedupingInterval: 5 * 60 * 1000,

      // ✅ NO revalidar automáticamente datos en caché
      revalidateIfStale: false,

      // ❌ NO polling automático (no necesario con 2 usuarios)
      refreshInterval: 0,

      // ✅ Mantener datos previos mientras recarga (mejor UX, sin parpadeos)
      keepPreviousData: true,

      // ✅ Retry automático en caso de error
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
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
  
  // Calcular estadísticas básicas
  const stats = {
    total: consultas.length,
    programadas: consultas.filter(c => c.estado === 'Programada').length,
    confirmadas: consultas.filter(c => c.estado === 'Confirmada').length,
    completadas: consultas.filter(c => c.estado === 'Completada').length,
    canceladas: consultas.filter(c => c.estado === 'Cancelada').length,
    reagendadas: consultas.filter(c => c.estado === 'Reagendada').length,
    noAsistio: consultas.filter(c => c.estado === 'No Asistió').length,
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
  
  // Distribución por canal
  const porCanal = {
    whatsapp: consultas.filter(c => 
      !c.canalOrigen || c.canalOrigen.toLowerCase().includes('whatsapp')
    ).length,
    telefono: consultas.filter(c => 
      c.canalOrigen?.toLowerCase().includes('teléfono') ||
      c.canalOrigen?.toLowerCase().includes('llamada')
    ).length,
    web: consultas.filter(c => 
      c.canalOrigen?.toLowerCase().includes('web') ||
      c.canalOrigen?.toLowerCase().includes('online')
    ).length,
    otros: 0 // Se calcula después
  }
  porCanal.otros = consultas.length - (porCanal.whatsapp + porCanal.telefono + porCanal.web)
  
  // Tipo de consulta
  const primeraVez = consultas.filter(c => c.tipo === 'primera_vez').length
  const seguimiento = consultas.filter(c => c.tipo === 'subsecuente').length
  
  // Métricas de confirmación
  const consultasFuturas = consultas.filter(c => 
    c.horasHastaConsulta !== null && c.horasHastaConsulta > 0
  )
  
  const confirmaciones = {
    pendientes: consultasFuturas.filter(c => c.estadoConfirmacion === 'Pendiente').length,
    confirmadas: consultasFuturas.filter(c => c.estadoConfirmacion === 'Confirmada' || c.confirmadoPaciente).length,
    noConfirmadas: consultasFuturas.filter(c => c.estadoConfirmacion === 'No Confirmada').length,
    vencidas: consultasFuturas.filter(c => c.confirmacionVencida).length,
    requierenAtencion: consultasFuturas.filter(c => c.requiereConfirmacion && c.horasHastaConsulta !== null && c.horasHastaConsulta <= 48).length,
  }
  
  // Métricas de recordatorios
  const recordatorios = {
    inicialEnviado: consultasFuturas.filter(c => c.remConfirmacionInicialEnviado).length,
    rem48h: consultasFuturas.filter(c => c.rem48hEnviado).length,
    rem24h: consultasFuturas.filter(c => c.rem24hEnviado).length,
    rem3h: consultasFuturas.filter(c => c.rem3hEnviado).length,
    sinEnviar: consultasFuturas.filter(c => !c.remConfirmacionInicialEnviado).length,
  }
  
  const metricas = {
    tasaConfirmacion,
    tasaCancelacion,
    tasaAsistencia,
    confirmaciones,
    recordatorios,
    porSede,
    promedioDuracion,
    porCanal,
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
