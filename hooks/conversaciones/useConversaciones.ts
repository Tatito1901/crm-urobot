/**
 * ============================================================
 * HOOK: useConversaciones
 * ============================================================
 * Hook para gestionar conversaciones usando tabla 'conversaciones'
 * ✅ SWR: Caché y revalidación
 * ❌ Realtime: DESHABILITADO (optimización de rendimiento BD)
 */

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { SWR_CONFIG_REALTIME, CACHE_KEYS, invalidateDomain } from '@/lib/swr-config'
import type { MensajeRow, Mensaje, ConversacionUI, TipoMensaje } from '@/types/chat'

const supabase = createClient()

interface UseConversacionesReturn {
  conversaciones: ConversacionUI[]
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
 * Fetcher para lista de conversaciones usando nueva estructura BD
 * conversaciones = metadata, mensajes = contenido individual
 * 
 * Clasificación:
 * - PACIENTE: paciente_id en conversacion O lead convertido
 * - LEAD: lead_id en conversacion
 * - DESCONOCIDO: sin lead ni paciente
 */
const fetchConversaciones = async (): Promise<ConversacionUI[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  // 1. Obtener conversaciones recientes con datos de lead y paciente
  const { data: convData, error: convError } = await sb
    .from('conversaciones')
    .select('id, telefono, nombre_contacto, estado, lead_id, paciente_id, ultimo_mensaje_at, ultimo_mensaje_preview, mensajes_no_leidos, total_mensajes_usuario, total_mensajes_bot, created_at')
    .order('ultimo_mensaje_at', { ascending: false })
    .limit(200)

  if (convError) throw convError

  const conversaciones: ConversacionUI[] = (convData || []).map((c: Record<string, unknown>) => {
    const hasPaciente = !!c.paciente_id
    const hasLead = !!c.lead_id
    const tipoContacto: 'paciente' | 'lead' | 'desconocido' = 
      hasPaciente ? 'paciente' : hasLead ? 'lead' : 'desconocido'

    const totalMsgs = ((c.total_mensajes_usuario as number) || 0) + ((c.total_mensajes_bot as number) || 0)

    return {
      telefono: c.telefono as string,
      nombreContacto: (c.nombre_contacto as string) || null,
      ultimoMensaje: (c.ultimo_mensaje_preview as string) || '',
      ultimaFecha: c.ultimo_mensaje_at ? new Date(c.ultimo_mensaje_at as string) : new Date(c.created_at as string),
      mensajesNoLeidos: (c.mensajes_no_leidos as number) || 0,
      tipoContacto,
      estadoLead: (c.estado as string) || null,
      citasValidas: 0,
      totalMensajes: totalMsgs,
    }
  })

  return conversaciones
}

/**
 * Inferir tipo de mensaje desde tipo_contenido (mime type)
 */
const inferirTipoMensaje = (tipo: string | null, tipoContenido: string | null, mediaUrl: string | null): TipoMensaje => {
  if (tipo && tipo !== 'text') return tipo as TipoMensaje
  if (!mediaUrl) return 'text'
  const mime = tipoContenido?.toLowerCase() || ''
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'document'
}

/**
 * ✅ BEST PRACTICE: async-parallel — Eliminado waterfall de 2 queries secuenciales
 * Antes: 1) SELECT id FROM conversaciones WHERE telefono = X  (waterfall)
 *        2) SELECT * FROM mensajes WHERE conversacion_id = id
 * Ahora: Una sola llamada RPC con JOIN interno en el servidor
 */
const fetchMensajesPorTelefono = async (telefono: string): Promise<Mensaje[]> => {
  const { data, error } = await supabase.rpc('get_mensajes_por_telefono' as never, {
    p_telefono: telefono,
    p_limit: 200,
  } as never)

  if (error) throw error

  const rows = (data || []) as Record<string, unknown>[]
  const mensajesInvalidos = ['undefined', 'Interacción registrada', 'null']

  return rows
    .filter((row) => {
      const contenido = ((row.contenido as string) || '').trim()
      const tieneMedia = !!row.media_url
      const esInvalido = mensajesInvalidos.includes(contenido) && !tieneMedia
      return !esInvalido && (contenido.length > 0 || tieneMedia)
    })
    .map((row): Mensaje => ({
      id: row.id as string,
      conversacionId: row.conversacion_id as string,
      contenido: (row.contenido as string) || '[Archivo adjunto]',
      remitente: (row.remitente as string) || 'usuario',
      tipo: (row.tipo as string) || 'text',
      createdAt: row.created_at ? new Date(row.created_at as string) : new Date(),
      tipoMensaje: inferirTipoMensaje(row.tipo as string | null, row.tipo_contenido as string | null, row.media_url as string | null),
      mediaUrl: row.media_url as string | null,
      tipoContenido: row.tipo_contenido as string | null,
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
  } = useSWR(CACHE_KEYS.CONVERSACIONES, fetchConversaciones, SWR_CONFIG_REALTIME)

  // SWR para mensajes del teléfono activo
  const {
    data: mensajesActivos,
    error: errorMensajes,
    isLoading: isLoadingMensajes,
    mutate: mutateMensajes
  } = useSWR(
    telefonoActivo ? `conv-mensajes-${telefonoActivo}` : null,
    () => fetchMensajesPorTelefono(telefonoActivo!),
    SWR_CONFIG_REALTIME
  )

  // ❌ Realtime DESHABILITADO - Consumía demasiados recursos
  // Los datos se actualizan vía SWR:
  // - revalidateOnFocus: al volver a la pestaña
  // - revalidateOnReconnect: al reconectar internet
  // - refreshInterval en SWR_CONFIG_REALTIME: polling cada 30s

  // Marcar como leído (no-op por ahora, la tabla no tiene ese campo)
  const marcarComoLeido = useCallback(async (_telefono: string) => {
    // La tabla conversaciones no tiene campo leido_por_doctor
    // Se podría agregar si se necesita
  }, [])

  // Enviar mensaje usando RPC
  const enviarMensaje = useCallback(async (telefono: string, contenido: string) => {
    const { error } = await supabase.rpc('guardar_mensaje_urobot' as never, {
      p_telefono: telefono,
      p_remitente: 'asistente',
      p_contenido: contenido,
      p_tipo: 'texto_manual',
    } as never)

    if (error) throw error

    // ✅ Invalidar dominio conversaciones + dashboard + caches locales
    await Promise.all([
      invalidateDomain('conversaciones'),
      mutateConversaciones(),
      telefono === telefonoActivo ? mutateMensajes() : Promise.resolve(),
    ])
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
