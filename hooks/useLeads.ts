/**
 * ============================================================
 * HOOK: useLeads
 * ============================================================
 * Hook optimizado con SWR para leads
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import useSWR from 'swr'
import { getSupabaseClient } from '@/lib/supabase/client'
import { DEFAULT_LEAD_ESTADO, type Lead, isLeadEstado } from '@/types/leads'
import type { Tables } from '@/types/database'

const supabase = getSupabaseClient()

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
}

type LeadRow = Tables<'leads'>

/**
 * Mapea una fila de la tabla 'leads' al tipo Lead
 */
const mapLead = (row: LeadRow): Lead => {
  // Validar el estado del lead
  const estado = isLeadEstado(row.estado) ? row.estado : DEFAULT_LEAD_ESTADO

  return {
    id: row.id,
    leadId: row.lead_id,
    nombre: row.nombre_completo,
    telefono: row.telefono_whatsapp,
    estado,
    primerContacto: row.fecha_primer_contacto ?? row.created_at ?? new Date().toISOString(),
    fuente: row.fuente_lead ?? 'WhatsApp',
    ultimaInteraccion: row.ultima_interaccion,
  }
}

/**
 * Fetcher para leads
 */
const fetchLeads = async (): Promise<{ leads: Lead[], count: number }> => {
  const { data, error, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) throw error

  const leads = (data || []).map(mapLead)
  return { leads, count: count || leads.length }
}

/**
 * Hook para gestionar leads
 */
export function useLeads(): UseLeadsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'leads',
    fetchLeads,
    {
      refreshInterval: 0, // ❌ DESHABILITADO - Solo carga inicial y refresh manual
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  )

  return {
    leads: data?.leads || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
  }
}
