/**
 * ============================================================
 * HOOK: useConversaciones
 * ============================================================
 * Hook optimizado con SWR para análisis de conversaciones
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

const supabase = createClient()

export type Conversacion = Tables<'conversaciones'>

interface UseConversacionesReturn {
  conversaciones: Conversacion[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Fetcher para conversaciones (últimos 60 días para rendimiento)
 */
const fetchConversaciones = async (): Promise<Conversacion[]> => {
  const hace60Dias = new Date()
  hace60Dias.setDate(hace60Dias.getDate() - 60)

  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .gte('timestamp_mensaje', hace60Dias.toISOString())
    .order('timestamp_mensaje', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('❌ Error fetching conversaciones:', error)
    throw error
  }

  return (data || []) as Conversacion[]
}

/**
 * Hook para obtener conversaciones para análisis
 */
export function useConversaciones(): UseConversacionesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'conversaciones',
    fetchConversaciones,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  )

  return {
    conversaciones: data || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
  }
}
