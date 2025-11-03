/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook para gestionar pacientes usando datos locales (sin real-time)
 */

import { useEffect, useState, useCallback } from 'react'
import type { Paciente } from '@/app/lib/crm-data'

interface UsePacientesReturn {
  pacientes: Paciente[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  totalCount: number
}

const LOCAL_PACIENTES: Paciente[] = []

export function usePacientes(): UsePacientesReturn {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPacientes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      setPacientes(LOCAL_PACIENTES)
      setTotalCount(LOCAL_PACIENTES.length)
    } catch (err) {
      console.error('Error fetching pacientes:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPacientes()
  }, [fetchPacientes])

  return {
    pacientes,
    loading,
    error,
    refetch: fetchPacientes,
    totalCount,
  }
}
