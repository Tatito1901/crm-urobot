/**
 * ============================================================
 * HOOK: useConversaciones
 * ============================================================
 * Hook para gestionar conversaciones usando tabla 'conversaciones'
 * ✅ SWR: Caché y revalidación
 * ✅ Realtime: Actualizaciones en vivo
 */

import { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'
import type { Tables } from '@/types/supabase'

const supabase = createClient()

type ConversacionRow = Tables<'conversaciones'>

// Tipos para la UI
interface Mensaje {
  id: string
  telefono: string
  contenido: string
  rol: 'usuario' | 'asistente'
  createdAt: Date
}

interface Conversacion {
  telefono: string
  nombreContacto: string | null
  ultimoMensaje: string
  ultimaFecha: Date
  mensajesNoLeidos: number
  tipoContacto: 'paciente' | 'lead' | 'desconocido'
}

interface UseConversacionesReturn {
  conversaciones: Conversacion[]
  mensajesActivos: Mensaje[]
  telefonoActivo: string | null
  setTelefonoActivo: (telefono: string | null) => void
  isLoading: boolean
  isLoadingMensajes: boolean
  error: Error | null
  marcarComoLeido: (telefono: string) => Promise<void>
  enviarMensaje: (telefono: string, contenido: string) => Promise<void>
  refetch: () => Promise<void>
  totalNoLeidos: number
}

/**
 * Fetcher para lista de conversaciones agrupadas por teléfono
 * Incluye JOIN con pacientes para obtener nombres
 */
const fetchConversaciones = async (): Promise<Conversacion[]> => {
  // 1. Obtener conversaciones
  const { data: convData, error: convError } = await supabase
    .from('conversaciones')
    .select('telefono, mensaje, rol, created_at')
    .order('created_at', { ascending: false })

  if (convError) throw convError

  // 2. Obtener pacientes para hacer match por teléfono
  const { data: pacientesData } = await supabase
    .from('pacientes')
    .select('telefono, nombre_completo')

  // Crear mapa de teléfonos a nombres (últimos 10 dígitos como key)
  const pacientesMap = new Map<string, string>()
  for (const p of pacientesData || []) {
    if (p.telefono && p.nombre_completo) {
      const tel10 = p.telefono.replace(/\D/g, '').slice(-10)
      pacientesMap.set(tel10, p.nombre_completo)
    }
  }

  // 3. Agrupar conversaciones por teléfono
  const conversacionesMap = new Map<string, Conversacion>()
  
  for (const msg of convData || []) {
    if (!conversacionesMap.has(msg.telefono)) {
      const tel10 = msg.telefono.replace(/\D/g, '').slice(-10)
      const nombrePaciente = pacientesMap.get(tel10)
      
      conversacionesMap.set(msg.telefono, {
        telefono: msg.telefono,
        nombreContacto: nombrePaciente || null,
        ultimoMensaje: msg.mensaje,
        ultimaFecha: new Date(msg.created_at),
        mensajesNoLeidos: 0,
        tipoContacto: nombrePaciente ? 'paciente' : 'desconocido',
      })
    }
  }

  return Array.from(conversacionesMap.values())
}

/**
 * Fetcher para mensajes de un teléfono específico
 */
const fetchMensajesPorTelefono = async (telefono: string): Promise<Mensaje[]> => {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('telefono', telefono)
    .order('created_at', { ascending: true })

  if (error) throw error
  
  return (data || []).map((row: ConversacionRow) => ({
    id: row.id,
    telefono: row.telefono,
    contenido: row.mensaje,
    rol: row.rol,
    createdAt: new Date(row.created_at),
  }))
}

export function useConversaciones(): UseConversacionesReturn {
  const [telefonoActivo, setTelefonoActivo] = useState<string | null>(null)
  
  // SWR para lista de conversaciones
  const { 
    data: conversaciones, 
    error: errorConversaciones, 
    isLoading: isLoadingConversaciones,
    mutate: mutateConversaciones 
  } = useSWR('conversaciones-list', fetchConversaciones, SWR_CONFIG_STANDARD)

  // SWR para mensajes del teléfono activo
  const {
    data: mensajesActivos,
    error: errorMensajes,
    isLoading: isLoadingMensajes,
    mutate: mutateMensajes
  } = useSWR(
    telefonoActivo ? `conv-mensajes-${telefonoActivo}` : null,
    () => fetchMensajesPorTelefono(telefonoActivo!),
    SWR_CONFIG_STANDARD
  )

  // ✅ Suscripción Realtime a tabla 'conversaciones'
  useEffect(() => {
    const channel = supabase
      .channel('conversaciones-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversaciones',
        },
        (payload) => {
          console.log('💬 Nuevo mensaje:', payload.new)
          mutateConversaciones()
          
          const newRecord = payload.new as ConversacionRow
          if (newRecord.telefono === telefonoActivo) {
            mutateMensajes()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutateConversaciones, mutateMensajes, telefonoActivo])

  // Marcar como leído (no-op por ahora, la tabla no tiene ese campo)
  const marcarComoLeido = useCallback(async (_telefono: string) => {
    // La tabla conversaciones no tiene campo leido_por_doctor
    // Se podría agregar si se necesita
  }, [])

  // Enviar mensaje usando RPC
  const enviarMensaje = useCallback(async (telefono: string, contenido: string) => {
    const { error } = await supabase.rpc('guardar_mensaje', {
      p_telefono: telefono,
      p_rol: 'asistente',
      p_mensaje: contenido,
    })

    if (error) throw error

    mutateConversaciones()
    if (telefono === telefonoActivo) {
      mutateMensajes()
    }
  }, [mutateConversaciones, mutateMensajes, telefonoActivo])

  // Total no leídos (siempre 0 por ahora)
  const totalNoLeidos = 0

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
