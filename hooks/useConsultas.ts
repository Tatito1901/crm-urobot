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
import { type Consulta, isConsultaEstado, isConsultaSede, isConsultaTipo, DEFAULT_CONSULTA_SEDE, DEFAULT_CONSULTA_ESTADO, DEFAULT_CONSULTA_TIPO } from '@/types/consultas'
import type { Tables } from '@/types/database'

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
  const fallbackDate = new Date().toISOString();
  const resolvedTimezone: Consulta['timezone'] = 'America/Mexico_City';
  const now = new Date();

  // Validar sede
  const sede = isConsultaSede(row.sede) ? row.sede : DEFAULT_CONSULTA_SEDE

  // Validar estado de cita
  const estado = isConsultaEstado(row.estado_cita)
    ? row.estado_cita
    : DEFAULT_CONSULTA_ESTADO

  const fechaLocal = row.fecha_consulta && row.hora_consulta
    ? `${row.fecha_consulta}T${row.hora_consulta}`
    : row.fecha_consulta ?? fallbackDate;

  const horaDesdeUtc = row.fecha_hora_utc ? row.fecha_hora_utc.split('T')[1]?.slice(0, 8) : null;
  
  // Calcular métricas de tiempo
  const fechaConsulta = new Date(`${row.fecha_consulta}T${row.hora_consulta}`);
  const msHastaConsulta = fechaConsulta.getTime() - now.getTime();
  const horasHastaConsulta = msHastaConsulta > 0 ? Math.floor(msHastaConsulta / (1000 * 60 * 60)) : null;
  const diasHastaConsulta = msHastaConsulta > 0 ? Math.floor(msHastaConsulta / (1000 * 60 * 60 * 24)) : null;
  
  // Estado de confirmación
  const estadoConfirmacion = (row.estado_confirmacion || 'Pendiente') as 'Pendiente' | 'Confirmada' | 'No Confirmada';
  const confirmadoPaciente = row.confirmado_paciente ?? false;
  
  // Requiere confirmación si está programada/confirmada y es futura
  const requiereConfirmacion = 
    (estado === 'Programada' || estado === 'Confirmada') && 
    msHastaConsulta > 0 && 
    !confirmadoPaciente;
  
  // Confirmación vencida si pasó la fecha límite y sigue pendiente
  const fechaLimite = row.fecha_limite_confirmacion ? new Date(row.fecha_limite_confirmacion) : null;
  const confirmacionVencida = 
    requiereConfirmacion && 
    fechaLimite !== null && 
    now > fechaLimite;

  return {
    id: row.consulta_id,
    uuid: row.id,
    paciente: row.paciente?.nombre_completo ?? 'Paciente sin nombre',
    pacienteId: row.paciente_id,
    sede,
    tipo: isConsultaTipo(row.tipo_cita) ? row.tipo_cita : DEFAULT_CONSULTA_TIPO,
    estado,
    
    // Sistema de confirmación completo
    estadoConfirmacion,
    confirmadoPaciente,
    fechaConfirmacion: row.fecha_confirmacion,
    fechaLimiteConfirmacion: row.fecha_limite_confirmacion,
    
    // Recordatorios enviados
    remConfirmacionInicialEnviado: row.rem_confirmacion_inicial_enviado ?? false,
    rem48hEnviado: row.rem_48h_enviado ?? false,
    rem24hEnviado: row.rem_24h_enviado ?? false,
    rem3hEnviado: row.rem_3h_enviado ?? false,
    
    // Métricas calculadas
    horasHastaConsulta,
    diasHastaConsulta,
    requiereConfirmacion,
    confirmacionVencida,
    
    fecha: row.fecha_hora_utc ?? fechaLocal,
    fechaConsulta: row.fecha_consulta ?? (row.fecha_hora_utc ? row.fecha_hora_utc.split('T')[0] : fallbackDate.split('T')[0]),
    horaConsulta: row.hora_consulta ?? horaDesdeUtc ?? '00:00:00',
    timezone: resolvedTimezone,
    motivoConsulta: row.motivo_consulta,
    duracionMinutos: row.duracion_minutos ?? 30,
    calendarEventId: row.calendar_event_id,
    calendarLink: row.calendar_link,
    canalOrigen: row.canal_origen,
    canceladoPor: row.cancelado_por,
    motivoCancelacion: row.motivo_cancelacion,
    createdAt: row.created_at ?? fallbackDate,
    updatedAt: row.updated_at ?? row.created_at ?? fallbackDate,
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
