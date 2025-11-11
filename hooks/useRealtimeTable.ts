/**
 * ============================================================
 * HOOK GENÉRICO: useRealtimeTable
 * ============================================================
 * Hook reutilizable para manejar consultas a tablas de Supabase.
 * Elimina código duplicado y centraliza la lógica de fetching.
 *
 * @template T - Tipo de datos que retorna el hook
 * @template TRow - Tipo de fila de la base de datos (antes del mapeo)
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils/debounce'
import type { Database } from '@/types/database'

// ✅ OPTIMIZACIÓN: Usar singleton del cliente
const supabase = getSupabaseClient()

interface UseRealtimeTableOptions<TRow, T> {
  /** Nombre de la tabla en Supabase */
  table: string

  /** Función para construir el query (select, filtros, joins, etc.) */
  queryBuilder: (query: any) => any

  /** Función para mapear cada fila de la BD al tipo final */
  mapFn: (row: TRow) => T
}

interface UseRealtimeTableReturn<T> {
  data: T[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
}

/**
 * Hook genérico para consultas a tablas de Supabase
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

  useEffect(() => {
    // Carga inicial
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    refetch: loadData,
    totalCount,
  }
}
