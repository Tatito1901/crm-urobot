/**
 * ============================================================
 * HOOK: useConsultas
 * ============================================================
 * Hook para gestionar consultas usando datos locales (sin real-time)
 */

import { useEffect, useState, useCallback } from 'react'
import type { Consulta } from '@/app/lib/crm-data'

interface UseConsultasReturn {
  consultas: Consulta[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  totalCount: number
}

const LOCAL_CONSULTAS: Consulta[] = []

export function useConsultas(): UseConsultasReturn {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchConsultas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setConsultas(LOCAL_CONSULTAS)
      setTotalCount(LOCAL_CONSULTAS.length)
    } catch (err) {
      console.error('Error fetching consultas:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConsultas()
  }, [fetchConsultas])

  return {
    consultas,
    loading,
    error,
    refetch: fetchConsultas,
    totalCount,
  }
}
