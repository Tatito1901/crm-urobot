/**
 * ============================================================
 * HOOK: useConversacionesPaciente
 * ============================================================
 * Hook para obtener el historial de conversaciones de un paciente
 * usando las nuevas funciones RPC de Supabase.
 * 
 * ✅ SWR: Caché y revalidación
 * ✅ Realtime: Actualizaciones en vivo via postgres_changes
 * ✅ RPC: Usa obtener_contexto_urobot para datos enriquecidos
 */

import { useEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

// ============================================================
// TIPOS
// ============================================================

export type ConversacionRow = Tables<'conversaciones'>

export interface MensajeChat {
  id: string
  rol: 'usuario' | 'asistente'
  mensaje: string
  fecha: Date
}

export interface ContextoUrobot {
  historialConversacion: string
  tieneCitaPendiente: boolean
  infoCita: string
  nombrePaciente: string
  esPacienteConocido: boolean
}

export interface UseConversacionesPacienteReturn {
  // Mensajes individuales parseados
  mensajes: MensajeChat[]
  
  // Contexto completo del RPC
  contexto: ContextoUrobot | null
  
  // Estados
  isLoading: boolean
  error: Error | null
  
  // Acciones
  refetch: () => Promise<void>
  
  // Métricas
  totalMensajes: number
}

// ============================================================
// FETCHERS
// ============================================================

/**
 * Obtener contexto completo usando el RPC
 */
const fetchContextoUrobot = async (telefono: string): Promise<ContextoUrobot | null> => {
  const { data, error } = await supabase
    .rpc('obtener_contexto_urobot', { p_telefono: telefono })

  if (error) {
    console.error('Error obteniendo contexto UROBOT:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return null
  }

  const row = data[0]
  return {
    historialConversacion: row.historial_conversacion || '',
    tieneCitaPendiente: row.tiene_cita_pendiente || false,
    infoCita: row.info_cita || '',
    nombrePaciente: row.nombre_paciente || '',
    esPacienteConocido: row.es_paciente_conocido || false,
  }
}

/**
 * Obtener mensajes individuales para visualización tipo chat
 */
const fetchMensajesDirectos = async (telefono: string): Promise<MensajeChat[]> => {
  // Normalizar teléfono usando la función de Supabase
  const { data: normalizado } = await supabase.rpc('to_mx10', { input_phone: telefono })
  const telefonoNormalizado = normalizado || telefono

  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('telefono', telefonoNormalizado)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    console.error('Error obteniendo mensajes:', error)
    throw error
  }

  return (data || []).map((row: ConversacionRow) => ({
    id: row.id,
    rol: row.rol,
    mensaje: row.mensaje,
    fecha: new Date(row.created_at),
  }))
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function useConversacionesPaciente(telefono: string | null | undefined): UseConversacionesPacienteReturn {
  const telefonoValido = telefono?.trim() || null

  // SWR para contexto (RPC)
  const { 
    data: contexto, 
    error: errorContexto, 
    isLoading: isLoadingContexto,
    mutate: mutateContexto 
  } = useSWR(
    telefonoValido ? `contexto-urobot-${telefonoValido}` : null,
    () => fetchContextoUrobot(telefonoValido!),
    {
      ...SWR_CONFIG_STANDARD,
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30s cache
    }
  )

  // SWR para mensajes individuales
  const {
    data: mensajes,
    error: errorMensajes,
    isLoading: isLoadingMensajes,
    mutate: mutateMensajes
  } = useSWR(
    telefonoValido ? `mensajes-paciente-${telefonoValido}` : null,
    () => fetchMensajesDirectos(telefonoValido!),
    {
      ...SWR_CONFIG_STANDARD,
      revalidateOnFocus: false,
    }
  )

  // ✅ Suscripción Realtime a tabla 'conversaciones'
  useEffect(() => {
    if (!telefonoValido) return

    const channel = supabase
      .channel(`conversaciones-${telefonoValido}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversaciones',
        },
        (payload) => {
          // El trigger de la BD normaliza el teléfono, así que comparamos
          // el teléfono del nuevo registro con el que estamos observando
          const newRecord = payload.new as ConversacionRow
          
          // Revalidar si el mensaje es relevante
          // (La normalización se hace en el trigger, así que siempre refrescamos)
          console.log('📩 Nuevo mensaje en conversaciones:', newRecord.rol)
          mutateMensajes()
          mutateContexto()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [telefonoValido, mutateMensajes, mutateContexto])

  // Refetch manual
  const refetch = useCallback(async () => {
    await Promise.all([
      mutateContexto(),
      mutateMensajes()
    ])
  }, [mutateContexto, mutateMensajes])

  // Calcular total de mensajes
  const totalMensajes = useMemo(() => mensajes?.length || 0, [mensajes])

  return {
    mensajes: mensajes || [],
    contexto: contexto || null,
    isLoading: isLoadingContexto || isLoadingMensajes,
    error: errorContexto || errorMensajes || null,
    refetch,
    totalMensajes,
  }
}
