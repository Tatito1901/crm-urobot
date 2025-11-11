/**
 * ============================================================
 * HOOK REFACTORIZADO: useLeads
 * ============================================================
 * Simplificado usando el hook genérico useRealtimeTable.
 * Reducido de ~98 líneas a ~35 líneas (64% menos código).
 */

import { DEFAULT_LEAD_ESTADO, type Lead, isLeadEstado } from '@/types/leads'
import type { Tables } from '@/types/database'
import { useRealtimeTable } from './useRealtimeTable'

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
 * Hook para gestionar leads con subscripción en tiempo real
 */
export function useLeads(): UseLeadsReturn {
  const { data: leads, loading, error, refetch, totalCount } = useRealtimeTable<LeadRow, Lead>({
    table: 'leads',
    queryBuilder: (query) => query.order('created_at', { ascending: false }),
    mapFn: mapLead,
  })

  return {
    leads,
    loading,
    error,
    refetch,
    totalCount,
  }
}
