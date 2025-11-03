import { useEffect, useState, useCallback } from 'react'
import type { Lead } from '@/app/lib/crm-data'

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  totalCount: number
}

const LOCAL_LEADS: Lead[] = []

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setLeads(LOCAL_LEADS)
      setTotalCount(LOCAL_LEADS.length)
    } catch (err) {
      console.error('Error loading leads:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  return {
    leads,
    loading,
    error,
    refetch: loadLeads,
    totalCount,
  }
}
