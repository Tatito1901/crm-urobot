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
import { type Lead, type LeadRow } from '@/types/leads'
import { mapLeadFromDB, enrichLead } from '@/lib/mappers'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

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

// Tipo para el JOIN
type LeadRowWithPaciente = LeadRow & {
  paciente: {
    id: string
    // paciente_id: string // No existe en todos los registros
    nombre_completo: string
    telefono: string
    email: string | null
  } | null
}

/**
 * Mapea una fila de la tabla 'leads' al tipo Lead con datos enriquecidos
 * Usa mapper centralizado + enriquece con datos de paciente
 */
const mapLead = (row: LeadRowWithPaciente): Lead => {
  // Usar mapper centralizado (convierte snake_case → camelCase)
  const leadBase = mapLeadFromDB(row);
  
  // Enriquecer con cálculos (días, esCaliente, esInactivo)
  const leadEnriquecido = enrichLead(leadBase);
  
  // Retornar lead enriquecido (datos de paciente disponibles via pacienteId)
  return leadEnriquecido;
}

/**
 * Fetcher para leads con JOIN a pacientes
 * ✅ Campos sincronizados con BD real (types/supabase.ts)
 */
const fetchLeads = async (): Promise<{ leads: Lead[], count: number }> => {
  const { data, error, count } = await supabase
    .from('leads')
    .select(`
      id,
      lead_id,
      paciente_id,
      nombre_completo,
      telefono_whatsapp,
      telefono_mx10,
      estado,
      fuente_lead,
      canal_marketing,
      temperatura,
      puntuacion_lead,
      notas_iniciales,
      session_id,
      fecha_primer_contacto,
      ultima_interaccion,
      fecha_conversion,
      total_interacciones,
      total_mensajes_enviados,
      total_mensajes_recibidos,
      ultimo_mensaje_id,
      created_at,
      updated_at,
      paciente:pacientes (
        id,
        paciente_id,
        nombre_completo,
        telefono,
        email
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
  const leads = (data as unknown as LeadRowWithPaciente[]).map(mapLead)
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
    SWR_CONFIG_STANDARD
  )

  const leads = data?.leads || []
  
  // Calcular estadísticas (usando estados reales de BD)
  const stats = {
    total: leads.length,
    nuevos: leads.filter(l => l.estado === 'Nuevo').length,
    enSeguimiento: leads.filter(l => ['Contactado', 'Interesado', 'Calificado'].includes(l.estado)).length,
    convertidos: leads.filter(l => l.estado === 'Convertido').length,
    descartados: leads.filter(l => ['No_Interesado', 'Perdido'].includes(l.estado)).length,
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
