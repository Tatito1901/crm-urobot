/**
 * ============================================================
 * HOOK: useEscalamientos
 * ============================================================
 * Hook optimizado con SWR para escalamientos
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

const supabase = createClient()

export type Escalamiento = Tables<'escalamientos'> & {
  paciente?: {
    id: string
    nombre_completo: string
  } | null
  lead?: {
    id: string
    nombre_completo: string
  } | null
}

interface UseEscalamientosReturn {
  escalamientos: Escalamiento[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Fetcher para escalamientos con JOIN a pacientes y leads
 */
const fetchEscalamientos = async (): Promise<Escalamiento[]> => {
  const { data, error } = await supabase
    .from('escalamientos')
    .select(`
      *,
      paciente:pacientes (
        id,
        nombre_completo
      ),
      lead:leads (
        id,
        nombre_completo
      )
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('❌ Error fetching escalamientos:', error)
    throw error
  }

  return (data || []) as Escalamiento[]
}

/**
 * Hook para obtener escalamientos
 */
export function useEscalamientos(): UseEscalamientosReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'escalamientos',
    fetchEscalamientos,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
    }
  )

  return {
    escalamientos: data || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
  }
}
