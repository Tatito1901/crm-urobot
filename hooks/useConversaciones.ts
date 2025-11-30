/**
 * ============================================================
 * HOOK: useConversaciones
 * ============================================================
 * Hook para gestionar conversaciones de WhatsApp estilo WhatsApp Web
 * ✅ SWR: Caché y revalidación
 * ✅ Realtime: Actualizaciones en vivo
 */

import { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Mensaje, Conversacion, MensajeRow } from '@/types/mensajes'
import { mapMensajeFromDB } from '@/types/mensajes'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface UseConversacionesReturn {
  // Lista de conversaciones (sidebar)
  conversaciones: Conversacion[]
  
  // Mensajes de la conversación activa
  mensajesActivos: Mensaje[]
  
  // Teléfono seleccionado
  telefonoActivo: string | null
  setTelefonoActivo: (telefono: string | null) => void
  
  // Estados
  isLoading: boolean
  isLoadingMensajes: boolean
  error: Error | null
  
  // Acciones
  marcarComoLeido: (telefono: string) => Promise<void>
  enviarMensaje: (telefono: string, contenido: string) => Promise<void>
  refetch: () => Promise<void>
  
  // Métricas
  totalNoLeidos: number
}

// Tipo para el resultado del JOIN
interface MensajeConContacto {
  telefono: string
  contenido: string
  created_at: string
  leido_por_doctor: boolean
  paciente_id: string | null
  lead_id: string | null
  pacientes: { nombre_completo: string } | null
  leads: { nombre_completo: string } | null
}

/**
 * Fetcher para lista de conversaciones agrupadas
 * Nota: Usamos casting porque types/supabase.ts no tiene la tabla 'mensajes' todavía
 */
const fetchConversaciones = async (): Promise<Conversacion[]> => {
  // Query para obtener últimos mensajes por teléfono con info del contacto
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('mensajes')
    .select(`
      telefono,
      contenido,
      created_at,
      leido_por_doctor,
      paciente_id,
      lead_id,
      pacientes:paciente_id ( nombre_completo ),
      leads:lead_id ( nombre_completo )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Agrupar por teléfono y tomar el último mensaje
  const conversacionesMap = new Map<string, Conversacion>()
  
  for (const msg of (data || []) as MensajeConContacto[]) {
    if (!conversacionesMap.has(msg.telefono)) {
      // Determinar nombre del contacto
      const nombreContacto = msg.pacientes?.nombre_completo || msg.leads?.nombre_completo || null
      
      // Determinar tipo de contacto
      let tipoContacto: 'paciente' | 'lead' | 'desconocido' = 'desconocido'
      if (msg.paciente_id) tipoContacto = 'paciente'
      else if (msg.lead_id) tipoContacto = 'lead'

      conversacionesMap.set(msg.telefono, {
        telefono: msg.telefono,
        nombreContacto,
        ultimoMensaje: msg.contenido,
        ultimaFecha: new Date(msg.created_at),
        mensajesNoLeidos: 0,
        pacienteId: msg.paciente_id,
        leadId: msg.lead_id,
        tipoContacto,
      })
    }
    
    // Contar no leídos
    if (!msg.leido_por_doctor) {
      const conv = conversacionesMap.get(msg.telefono)!
      conv.mensajesNoLeidos++
    }
  }

  return Array.from(conversacionesMap.values())
}

/**
 * Fetcher para mensajes de un teléfono específico
 */
const fetchMensajesPorTelefono = async (telefono: string): Promise<Mensaje[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('mensajes')
    .select('*')
    .eq('telefono', telefono)
    .order('created_at', { ascending: true })

  if (error) throw error
  
  return ((data || []) as MensajeRow[]).map(mapMensajeFromDB)
}

export function useConversaciones(): UseConversacionesReturn {
  const [telefonoActivo, setTelefonoActivo] = useState<string | null>(null)
  
  // SWR para lista de conversaciones
  const { 
    data: conversaciones, 
    error: errorConversaciones, 
    isLoading: isLoadingConversaciones,
    mutate: mutateConversaciones 
  } = useSWR('conversaciones', fetchConversaciones, SWR_CONFIG_STANDARD)

  // SWR para mensajes del teléfono activo
  const {
    data: mensajesActivos,
    error: errorMensajes,
    isLoading: isLoadingMensajes,
    mutate: mutateMensajes
  } = useSWR(
    telefonoActivo ? `mensajes-${telefonoActivo}` : null,
    () => fetchMensajesPorTelefono(telefonoActivo!),
    SWR_CONFIG_STANDARD
  )

  // ✅ Suscripción Realtime a tabla 'mensajes'
  useEffect(() => {
    const channel = supabase
      .channel('mensajes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensajes',
        },
        (payload) => {
          console.log('💬 Nuevo mensaje detectado:', payload.eventType)
          mutateConversaciones()
          
          // Si el mensaje es del teléfono activo, actualizar también esos mensajes
          const newRecord = payload.new as MensajeRow | undefined
          if (newRecord && newRecord.telefono === telefonoActivo) {
            mutateMensajes()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutateConversaciones, mutateMensajes, telefonoActivo])

  // Marcar mensajes como leídos
  const marcarComoLeido = useCallback(async (telefono: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('mensajes')
      .update({ 
        leido_por_doctor: true, 
        leido_at: new Date().toISOString() 
      })
      .eq('telefono', telefono)
      .eq('leido_por_doctor', false)

    if (error) {
      console.error('Error marcando como leído:', error)
      return
    }

    // Actualizar caché local
    mutateConversaciones()
  }, [mutateConversaciones])

  // Enviar mensaje (para cuando el doctor responde manualmente)
  const enviarMensaje = useCallback(async (telefono: string, contenido: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('mensajes')
      .insert({
        telefono,
        contenido,
        direccion: 'saliente',
        tipo_contenido: 'texto',
        respondido_por: 'humano',
        leido_por_doctor: true,
      })

    if (error) throw error

    // Actualizar cachés
    mutateConversaciones()
    if (telefono === telefonoActivo) {
      mutateMensajes()
    }
  }, [mutateConversaciones, mutateMensajes, telefonoActivo])

  // Calcular total de no leídos
  const totalNoLeidos = (conversaciones || []).reduce(
    (sum, c) => sum + c.mensajesNoLeidos, 
    0
  )

  return {
    conversaciones: conversaciones || [],
    mensajesActivos: mensajesActivos || [],
    telefonoActivo,
    setTelefonoActivo,
    isLoading: isLoadingConversaciones,
    isLoadingMensajes,
    error: errorConversaciones || errorMensajes || null,
    marcarComoLeido,
    enviarMensaje,
    refetch: async () => {
      await mutateConversaciones()
      if (telefonoActivo) await mutateMensajes()
    },
    totalNoLeidos,
  }
}
