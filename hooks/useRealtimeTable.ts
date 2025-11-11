/**
 * ============================================================
 * HOOK GENÉRICO: useRealtimeTable
 * ============================================================
 * Hook reutilizable para manejar tablas con subscripciones en tiempo real.
 * Elimina código duplicado y centraliza la lógica de realtime + debouncing.
 *
 * @template T - Tipo de datos que retorna el hook
 * @template TRow - Tipo de fila de la base de datos (antes del mapeo)
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils/debounce'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import type { Database } from '@/types/database'

// ✅ OPTIMIZACIÓN: Usar singleton del cliente
const supabase = getSupabaseClient()

interface UseRealtimeTableOptions<TRow, T> {
  /** Nombre de la tabla en Supabase */
  table: string

  /** Función para construir el query (select, filtros, joins, etc.) */
  queryBuilder: (
    query: PostgrestFilterBuilder<Database['public'], TRow, TRow[], string>
  ) => PostgrestFilterBuilder<Database['public'], TRow, TRow[], string>

  /** Función para mapear cada fila de la BD al tipo final */
  mapFn: (row: TRow) => T

  /** Tiempo de debounce en ms (default: 300) */
  debounceMs?: number

  /** Habilitar realtime subscriptions (default: true) */
  enableRealtime?: boolean
}

interface UseRealtimeTableReturn<T> {
  data: T[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
}

/**
 * Hook genérico para consultas con realtime subscriptions
 *
 * @example
 * ```typescript
 * const { data: leads, loading, error, refetch } = useRealtimeTable({
 *   table: 'leads',
 *   queryBuilder: (query) => query.select('*', { count: 'exact' }).order('created_at', { ascending: false }),
 *   mapFn: (row) => mapLead(row),
 * })
 * ```
 */
export function useRealtimeTable<TRow = any, T = any>({
  table,
  queryBuilder,
  mapFn,
  debounceMs = 300,
  enableRealtime = true,
}: UseRealtimeTableOptions<TRow, T>): UseRealtimeTableReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  /**
   * Función principal de carga de datos
   * @param silent - Si es true, no muestra loading state (útil para recargas en background)
   */
  const loadData = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const { silent = false } = options

      try {
        if (!silent) {
          setLoading(true)
        }
        setError(null)

        // Construir el query usando la función personalizada
        const baseQuery = supabase.from(table).select('*', { count: 'exact' })
        const finalQuery = queryBuilder(baseQuery as any)

        const { data: rows, error: fetchError, count } = await finalQuery

        if (fetchError) throw fetchError

        // Mapear los datos al tipo final
        const mapped = (rows ?? []).map(mapFn)
        setData(mapped)
        setTotalCount(count ?? mapped.length)
      } catch (err) {
        console.error(`Error loading data from ${table}:`, err)
        setError(err as Error)
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [table, queryBuilder, mapFn]
  )

  // ✅ OPTIMIZACIÓN: Debounced load para realtime (evita múltiples fetches seguidos)
  const debouncedLoad = useMemo(
    () => debounce(() => loadData({ silent: true }), debounceMs),
    [loadData, debounceMs]
  )

  useEffect(() => {
    // Carga inicial
    loadData()

    // ✅ OPTIMIZACIÓN: Subscription en tiempo real
    if (enableRealtime) {
      const channel = supabase
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            // Usar versión debounced para evitar múltiples recargas
            debouncedLoad()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [table, loadData, debouncedLoad, enableRealtime])

  return {
    data,
    loading,
    error,
    refetch: loadData,
    totalCount,
  }
}
