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
import { SWR_CONFIG_REALTIME, CACHE_KEYS } from '@/lib/swr-config'
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
  // 1. Obtener conversaciones (solo último mensaje por teléfono para optimizar)
  const { data: convData, error: convError } = await supabase
    .from('conversaciones')
    .select('telefono, mensaje, rol, created_at')
    .order('created_at', { ascending: false })

  if (convError) throw convError

  // 2. Obtener pacientes con conteo de citas VÁLIDAS (excluyendo canceladas)
  const { data: pacientesData } = await supabase
    .from('pacientes')
    .select(`
      id,
      telefono, 
      nombre_completo,
      consultas:consultas(id, estado_cita)
    `)

  // 3. Obtener leads con estado y paciente_id para verificar conversiones
  const { data: leadsData } = await supabase
    .from('leads')
    .select('telefono_whatsapp, nombre_completo, paciente_id, estado, fecha_conversion')

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
      let tipoContacto: 'paciente' | 'lead' | 'desconocido' = 'desconocido'
      let nombreContacto: string | null = null
      
      // PACIENTE: Tiene al menos 1 cita válida (no cancelada)
      if (pacienteInfo?.citasValidas && pacienteInfo.citasValidas > 0) {
        tipoContacto = 'paciente'
        nombreContacto = pacienteInfo.nombre || leadInfo?.nombre || null
      }
      // LEAD: Existe en leads O en pacientes (sin citas válidas)
      else if (leadInfo || pacienteInfo) {
        tipoContacto = 'lead'
        // Priorizar nombre de paciente si existe, luego lead
        nombreContacto = pacienteInfo?.nombre || leadInfo?.nombre || null
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
        estadoLead: leadInfo?.estado || null,
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

const fetchMensajesPorTelefono = async (telefono: string): Promise<Mensaje[]> => {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('telefono', telefono)
    .order('created_at', { ascending: true })

  if (error) throw error
  
  return (data || [])
    // Filtrar mensajes basura/inválidos
    .filter((row: ConversacionRow) => {
      const mensaje = row.mensaje?.trim()
      return mensaje && !MENSAJES_INVALIDOS.includes(mensaje)
    })
    .map((row: ConversacionRow) => ({
      id: row.id,
      telefono: row.telefono,
      contenido: row.mensaje,
      rol: row.rol as 'usuario' | 'asistente',
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
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
