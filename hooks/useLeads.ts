import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/app/lib/crm-data'
import type { Tables } from '@/types/database'

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
}

type LeadRow = Tables<'leads'>

const mapLead = (row: LeadRow): Lead => {
  // Validar el estado del lead
  const estadosValidos: Lead['estado'][] = ['Nuevo', 'En seguimiento', 'Convertido', 'Descartado'];
  const estado = estadosValidos.includes(row.estado as Lead['estado'])
    ? (row.estado as Lead['estado'])
    : 'Nuevo';

  return {
    id: row.id,
    leadId: row.lead_id,
    nombre: row.nombre_completo,
    telefono: row.telefono_whatsapp,
    estado,
    primerContacto: row.fecha_primer_contacto ?? row.created_at ?? new Date().toISOString(),
    fuente: row.fuente_lead ?? 'WhatsApp',
    ultimaInteraccion: row.ultima_interaccion,
  };
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const loadLeads = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      const { data, error: fetchError, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const mapped = (data ?? []).map(mapLead)
      setLeads(mapped)
      setTotalCount(count ?? mapped.length)
    } catch (err) {
      console.error('Error loading leads:', err)
      setError(err as Error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadLeads()

    const channel = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        loadLeads({ silent: true })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadLeads])

  return {
    leads,
    loading,
    error,
    refetch: loadLeads,
    totalCount,
  }
}
