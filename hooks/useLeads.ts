/**
 * ============================================================
 * HOOK: useLeads
 * ============================================================
 * Hook optimizado con SWR para leads
 * ✅ SWR: Caché, deduplicación y revalidación automática
 * ❌ Realtime: DESHABILITADO (optimización de rendimiento BD)
 */

import { useMemo } from 'react'
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

// Usamos datos directos de la tabla leads (columna nombre)

/**
 * Fetcher para leads
 * ✅ Campos sincronizados con BD real
 */
const fetchLeads = async (): Promise<{ leads: Lead[], count: number }> => {
  const { data, error, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    throw error
  }

  if (!data) {
    return { leads: [], count: 0 }
  }

  // Mapear y validar cada lead
  const leads = data.map(row => {
    const leadBase = mapLeadFromDB(row as LeadRow);
    return enrichLead(leadBase);
  })
  
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
  
  // ✅ OPTIMIZACIÓN: Single-pass memoizado para todas las estadísticas
  const stats = useMemo(() => {
    let nuevos = 0, enSeguimiento = 0, convertidos = 0, descartados = 0
    let clientes = 0, calientes = 0, inactivos = 0
    
    for (const l of leads) {
      // Estado
      switch (l.estado) {
        case 'nuevo': nuevos++; break
        case 'contactado':
        case 'interesado':
        case 'calificado':
        case 'escalado': enSeguimiento++; break
        case 'convertido':
        case 'cita_agendada': convertidos++; break
        case 'no_interesado':
        case 'descartado': descartados++; break
      }
      
      // Flags
      if (l.esCliente) clientes++
      if (l.esCaliente) calientes++
      if (l.esInactivo) inactivos++
    }
    
    return {
      total: leads.length,
      nuevos,
      enSeguimiento,
      convertidos,
      descartados,
      clientes,
      calientes,
      inactivos,
    }
  }, [leads])

  return {
    leads,
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats,
  }
}
