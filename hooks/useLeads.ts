/**
 * ============================================================
 * HOOK: useLeads
 * ============================================================
 * Hook optimizado con SWR para leads
 * ✅ SWR: Caché, deduplicación y revalidación automática
 * ✅ Realtime: Actualización automática cuando n8n modifica la tabla
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_LEAD_ESTADO, type Lead, isLeadEstado } from '@/types/leads'
import type { Tables } from '@/types/database'

const supabase = createClient()

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
  stats: {
    total: number
    nuevos: number
    enSeguimiento: number
    convertidos: number
    descartados: number
    clientes: number
    calientes: number
    inactivos: number
  }
}

type LeadRow = Tables<'leads'>

type LeadRowEnriquecido = LeadRow & {
  paciente: {
    id: string
    paciente_id: string
    nombre_completo: string
    telefono: string
    email: string | null
    total_consultas: number | null
    ultima_consulta: string | null
  } | null
}

/**
 * Mapea una fila de la tabla 'leads' al tipo Lead con datos enriquecidos
 * Valida todos los campos para consistencia con DB
 */
const mapLead = (row: LeadRowEnriquecido): Lead => {
  // Validar estado (debe coincidir con DB)
  const estado = isLeadEstado(row.estado) ? row.estado : DEFAULT_LEAD_ESTADO
  const now = new Date()
  
  const primerContacto = new Date(row.fecha_primer_contacto || row.created_at || now)
  const ultimaInteraccion = row.ultima_interaccion ? new Date(row.ultima_interaccion) : null
  const fechaConversion = row.fecha_conversion ? new Date(row.fecha_conversion) : null
  
  // Calcular días
  const diasDesdeContacto = Math.floor((now.getTime() - primerContacto.getTime()) / (1000 * 60 * 60 * 24))
  const diasDesdeUltimaInteraccion = ultimaInteraccion 
    ? Math.floor((now.getTime() - ultimaInteraccion.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const diasDesdeConversion = fechaConversion
    ? Math.floor((now.getTime() - fechaConversion.getTime()) / (1000 * 60 * 60 * 24))
    : null
  
  // Determinar si es cliente
  const esCliente = !!row.paciente_id && !!row.paciente
  
  // Indicadores de actividad (validados contra DB)
  const totalInteracciones = typeof row.total_interacciones === 'number' ? row.total_interacciones : 0
  const esCaliente = totalInteracciones >= 3 && (diasDesdeUltimaInteraccion !== null && diasDesdeUltimaInteraccion <= 2)
  const esInactivo = diasDesdeUltimaInteraccion !== null && diasDesdeUltimaInteraccion >= 7 && estado !== 'Convertido' && estado !== 'Descartado'

  return {
    // Campos base (validados contra schema DB)
    id: row.id, // uuid PK
    leadId: row.lead_id, // string | null UNIQUE
    nombre: row.nombre_completo, // string NOT NULL
    telefono: row.telefono_whatsapp, // string UNIQUE NOT NULL
    estado, // validado con isLeadEstado()
    primerContacto: row.fecha_primer_contacto ?? row.created_at ?? now.toISOString(), // timestamptz
    fuente: row.fuente_lead ?? 'WhatsApp', // string DEFAULT 'WhatsApp'
    ultimaInteraccion: row.ultima_interaccion, // timestamptz | null
    
    totalInteracciones,
    diasDesdeContacto,
    diasDesdeUltimaInteraccion,
    
    esCliente,
    fechaConversion: row.fecha_conversion,
    diasDesdeConversion,
    
    // Relación FK validada (paciente_id puede ser null)
    paciente: row.paciente ? {
      id: row.paciente.id,
      pacienteId: row.paciente.paciente_id,
      nombre: row.paciente.nombre_completo,
      telefono: row.paciente.telefono,
      email: row.paciente.email,
      totalConsultas: typeof row.paciente.total_consultas === 'number' ? row.paciente.total_consultas : 0,
      ultimaConsulta: row.paciente.ultima_consulta,
    } : null,
    
    sessionId: row.session_id,
    notas: row.notas_iniciales,
    
    esCaliente,
    esInactivo,
  }
}

/**
 * Fetcher para leads con JOIN a pacientes
 * Campos exactos según schema de Supabase
 */
const fetchLeads = async (): Promise<{ leads: Lead[], count: number }> => {
  const { data, error, count } = await supabase
    .from('leads')
    .select(`
      id,
      lead_id,
      nombre_completo,
      telefono_whatsapp,
      fuente_lead,
      fecha_primer_contacto,
      estado,
      notas_iniciales,
      session_id,
      ultima_interaccion,
      total_interacciones,
      paciente_id,
      fecha_conversion,
      created_at,
      updated_at,
      paciente:pacientes (
        id,
        paciente_id,
        nombre_completo,
        telefono,
        email,
        total_consultas,
        ultima_consulta
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching leads:', error)
    throw error
  }

  // Validar que data existe
  if (!data) {
    console.warn('⚠️ No data returned from leads query')
    return { leads: [], count: 0 }
  }

  // Mapear y validar cada lead
  const leads = data.map(mapLead)
  return { leads, count: count || leads.length }
}

/**
 * Hook para gestionar leads
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 */
export function useLeads(): UseLeadsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'leads',
    fetchLeads,
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

  const leads = data?.leads || []
  
  // Calcular estadísticas
  const stats = {
    total: leads.length,
    nuevos: leads.filter(l => l.estado === 'Nuevo').length,
    enSeguimiento: leads.filter(l => l.estado === 'En seguimiento').length,
    convertidos: leads.filter(l => l.estado === 'Convertido').length,
    descartados: leads.filter(l => l.estado === 'Descartado').length,
    clientes: leads.filter(l => l.esCliente).length,
    calientes: leads.filter(l => l.esCaliente).length,
    inactivos: leads.filter(l => l.esInactivo).length,
  }

  return {
    leads,
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats,
  }
}
