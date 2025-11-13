/**
 * ============================================================
 * HOOK: useLeads
 * ============================================================
 * Hook optimizado con SWR para leads
 * ✅ SWR: Caché, deduplicación y revalidación automática
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

  return {
    leads: data?.leads || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
  }
}
