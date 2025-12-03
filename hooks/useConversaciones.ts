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
import { SWR_CONFIG_REALTIME, CACHE_KEYS } from '@/lib/swr-config'
import type { Tables } from '@/types/supabase'

const supabase = createClient()

type ConversacionRow = Tables<'conversaciones'>

// Tipos para la UI
export type TipoMensaje = 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location'

export interface Mensaje {
  id: string
  telefono: string
  contenido: string
  rol: 'usuario' | 'asistente'
  createdAt: Date
  // Campos multimedia
  tipoMensaje: TipoMensaje
  mediaUrl?: string | null
  mediaMimeType?: string | null
  mediaFilename?: string | null
  mediaCaption?: string | null
  mediaDurationSeconds?: number | null
  mediaWidth?: number | null
  mediaHeight?: number | null
}

interface Conversacion {
  telefono: string
  nombreContacto: string | null
  ultimoMensaje: string
  ultimaFecha: Date
  mensajesNoLeidos: number
  tipoContacto: 'paciente' | 'lead' | 'desconocido'
  // Campos adicionales para UI enriquecida
  estadoLead: string | null // 'Nuevo', 'Convertido', etc.
  citasValidas: number
  totalMensajes: number
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
 * Incluye JOIN con pacientes, leads y consultas para determinar tipo correcto
 * 
 * Lógica de clasificación MEJORADA:
 * - PACIENTE: Tiene al menos 1 cita NO cancelada (Programada, Completada, Confirmada)
 * - LEAD: Existe en tabla leads O pacientes pero SIN citas válidas
 * - DESCONOCIDO: Teléfono no está en ninguna tabla (visitante anónimo)
 * 
 * Prioridad de nombre: pacientes.nombre_completo > leads.nombre_completo
 */
const fetchConversaciones = async (): Promise<Conversacion[]> => {
  // ✅ OPTIMIZACIÓN: Ejecutar las 3 queries en PARALELO (ahorra ~300-500ms)
  const [convResult, pacientesResult, leadsResult] = await Promise.all([
    // 1. Conversaciones recientes (limitadas a últimos 30 días para rendimiento)
    supabase
      .from('conversaciones')
      .select('telefono, mensaje, rol, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5000), // Límite de seguridad
    
    // 2. Pacientes con conteo de citas VÁLIDAS
    supabase
      .from('pacientes')
      .select('id, telefono, nombre_completo, consultas:consultas(id, estado_cita)'),
    
    // 3. Leads con estado
    supabase
      .from('leads')
      .select('telefono_whatsapp, nombre_completo, paciente_id, estado, fecha_conversion')
  ])

  if (convResult.error) throw convResult.error
  const convData = convResult.data
  const pacientesData = pacientesResult.data
  const leadsData = leadsResult.data

  // Crear mapa de pacientes con conteo de citas VÁLIDAS
  const pacientesMap = new Map<string, { 
    id: string;
    nombre: string; 
    citasValidas: number;
    citasTotales: number;
  }>()
  
  for (const p of pacientesData || []) {
    if (p.telefono) {
      const tel10 = p.telefono.replace(/\D/g, '').slice(-10)
      const citas = Array.isArray(p.consultas) ? p.consultas : []
      
      // Filtrar citas válidas (no canceladas)
      const citasValidas = citas.filter((c: { estado_cita: string | null }) => 
        c.estado_cita && !['Cancelada', 'No asistió'].includes(c.estado_cita)
      ).length
      
      pacientesMap.set(tel10, {
        id: p.id,
        nombre: p.nombre_completo || '',
        citasValidas,
        citasTotales: citas.length
      })
    }
  }

  // Crear mapa de leads con info completa
  const leadsMap = new Map<string, { 
    nombre: string | null;
    pacienteId: string | null;
    estado: string | null;
    fechaConversion: string | null;
  }>()
  
  for (const l of leadsData || []) {
    if (l.telefono_whatsapp) {
      const tel10 = l.telefono_whatsapp.replace(/\D/g, '').slice(-10)
      leadsMap.set(tel10, {
        nombre: l.nombre_completo || null,
        pacienteId: l.paciente_id || null,
        estado: l.estado || null,
        fechaConversion: l.fecha_conversion || null
      })
    }
  }

  // 4. Filtrar mensajes válidos y contar por teléfono
  const mensajesValidos = ['undefined', 'Interacción registrada', 'null', '']
  const convDataFiltrado = (convData || []).filter(msg => {
    const texto = msg.mensaje?.trim()
    return texto && !mensajesValidos.includes(texto)
  })
  
  const mensajesPorTelefono = new Map<string, number>()
  for (const msg of convDataFiltrado) {
    const count = mensajesPorTelefono.get(msg.telefono) || 0
    mensajesPorTelefono.set(msg.telefono, count + 1)
  }

  // 5. Agrupar conversaciones por teléfono (solo primer mensaje válido = más reciente)
  const conversacionesMap = new Map<string, Conversacion>()
  
  for (const msg of convDataFiltrado) {
    if (!conversacionesMap.has(msg.telefono)) {
      const tel10 = msg.telefono.replace(/\D/g, '').slice(-10)
      const pacienteInfo = pacientesMap.get(tel10)
      const leadInfo = leadsMap.get(tel10)
      
      // Determinar tipo y nombre con lógica mejorada
      // JERARQUÍA:
      // 1. PACIENTE: Tiene ≥1 cita válida (no cancelada) O lead tiene paciente_id
      // 2. LEAD: Existe en leads O en pacientes (sin citas válidas)
      // 3. DESCONOCIDO: No está en ninguna tabla
      let tipoContacto: 'paciente' | 'lead' | 'desconocido' = 'desconocido'
      let nombreContacto: string | null = null
      let estadoLeadFinal: string | null = null
      
      // PACIENTE: Tiene al menos 1 cita válida (no cancelada)
      // O el lead fue convertido (tiene paciente_id)
      const esPacienteConCita = pacienteInfo?.citasValidas && pacienteInfo.citasValidas > 0
      const esLeadConvertido = leadInfo?.pacienteId != null
      
      if (esPacienteConCita || esLeadConvertido) {
        tipoContacto = 'paciente'
        nombreContacto = pacienteInfo?.nombre || leadInfo?.nombre || null
        // Si lead fue convertido, mostrar "Convertido" como estado
        estadoLeadFinal = esLeadConvertido ? 'Convertido' : (leadInfo?.estado || null)
      }
      // LEAD: Existe en leads O en pacientes (sin citas válidas)
      else if (leadInfo || pacienteInfo) {
        tipoContacto = 'lead'
        // Priorizar nombre de paciente si existe, luego lead
        nombreContacto = pacienteInfo?.nombre || leadInfo?.nombre || null
        estadoLeadFinal = leadInfo?.estado || null
      }
      // DESCONOCIDO: No está en ninguna tabla
      // tipoContacto ya es 'desconocido' por defecto
      
      conversacionesMap.set(msg.telefono, {
        telefono: msg.telefono,
        nombreContacto,
        ultimoMensaje: msg.mensaje,
        ultimaFecha: msg.created_at ? new Date(msg.created_at) : new Date(),
        mensajesNoLeidos: 0,
        tipoContacto,
        // Campos adicionales
        estadoLead: estadoLeadFinal,
        citasValidas: pacienteInfo?.citasValidas || 0,
        totalMensajes: mensajesPorTelefono.get(msg.telefono) || 0,
      })
    }
  }

  return Array.from(conversacionesMap.values())
}

/**
 * Fetcher para mensajes de un teléfono específico
 * Filtra mensajes inválidos (undefined, logs de sistema, etc.)
 */
const MENSAJES_INVALIDOS = [
  'undefined',
  'Interacción registrada',
  'null',
  '',
]

/**
 * Inferir tipo de mensaje basándose en mime type o URL
 * cuando tipo_mensaje es null pero hay media
 */
const inferirTipoMensaje = (
  tipoMensaje: string | null,
  mimeType: string | null,
  mediaUrl: string | null,
  filename: string | null
): TipoMensaje => {
  // Si ya tenemos un tipo explícito, usarlo
  if (tipoMensaje) return tipoMensaje as TipoMensaje
  
  // Si no hay media, es texto
  if (!mediaUrl) return 'text'
  
  const mime = mimeType?.toLowerCase() || ''
  const url = mediaUrl?.toLowerCase() || ''
  const file = filename?.toLowerCase() || ''
  
  // Inferir por mime type
  if (mime.includes('pdf') || file.endsWith('.pdf') || url.includes('.pdf')) return 'document'
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/') || mime.includes('ogg')) return 'audio'
  if (mime.includes('document') || mime.includes('word') || mime.includes('excel') || mime.includes('spreadsheet')) return 'document'
  
  // Inferir por extensión en URL o filename
  if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i) || file.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return 'image'
  if (url.match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/i) || file.match(/\.(mp4|mov|avi|webm|mkv)$/i)) return 'video'
  if (url.match(/\.(mp3|wav|ogg|m4a|opus)(\?|$)/i) || file.match(/\.(mp3|wav|ogg|m4a|opus)$/i)) return 'audio'
  if (url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|$)/i) || file.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) return 'document'
  
  // Fallback: si hay URL de media pero no sabemos qué es, asumir documento
  return 'document'
}

const fetchMensajesPorTelefono = async (telefono: string): Promise<Mensaje[]> => {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('telefono', telefono)
    .order('created_at', { ascending: true })

  if (error) throw error
  
  return (data || [])
    // Filtrar mensajes basura/inválidos (pero permitir mensajes con media aunque el texto esté vacío)
    .filter((row: ConversacionRow) => {
      const mensaje = row.mensaje?.trim()
      const tieneMedia = !!(row as any).media_url
      // Mantener si tiene contenido de texto válido O si tiene media adjunta
      return (mensaje && !MENSAJES_INVALIDOS.includes(mensaje)) || tieneMedia
    })
    .map((row: ConversacionRow): Mensaje => {
      const mediaUrl = (row as any).media_url || null
      const mediaMimeType = (row as any).media_mime_type || null
      const mediaFilename = (row as any).media_filename || null
      
      return {
        id: row.id,
        telefono: row.telefono,
        contenido: row.mensaje || (row as any).media_caption || '[Archivo adjunto]',
        rol: row.rol as 'usuario' | 'asistente',
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        // Campos multimedia con inferencia de tipo
        tipoMensaje: inferirTipoMensaje((row as any).tipo_mensaje, mediaMimeType, mediaUrl, mediaFilename),
        mediaUrl,
        mediaMimeType,
        mediaFilename,
        mediaCaption: (row as any).media_caption || null,
        mediaDurationSeconds: (row as any).media_duration_seconds || null,
        mediaWidth: (row as any).media_width || null,
        mediaHeight: (row as any).media_height || null,
      }
    })
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
