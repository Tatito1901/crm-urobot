/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook para gestionar pacientes usando datos locales (sin real-time)
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils/debounce'
import {
  DEFAULT_PACIENTE_ESTADO,
  type Paciente,
  isPacienteEstado,
} from '@/types/pacientes'
import type { Tables } from '@/types/database'

// ✅ OPTIMIZACIÓN: Usar singleton del cliente
const supabase = getSupabaseClient()

interface UsePacientesReturn {
  pacientes: Paciente[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
}

type PacienteRow = Tables<'pacientes'>

const mapPaciente = (row: PacienteRow): Paciente => {
  // Validar estado del paciente
  const estado = isPacienteEstado(row.estado) ? row.estado : DEFAULT_PACIENTE_ESTADO

  return {
    id: row.id,
    nombre: row.nombre_completo,
    telefono: row.telefono,
    email: row.email ?? '',
    totalConsultas: row.total_consultas ?? 0,
    ultimaConsulta: row.ultima_consulta,
    estado,
  };
}

export function usePacientes(): UsePacientesReturn {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPacientes = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      const { data, error: fetchError, count } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact' })
        .order('ultima_consulta', { ascending: false, nullsFirst: false })

      if (fetchError) throw fetchError

      const mapped = (data ?? []).map(mapPaciente)
      setPacientes(mapped)
      setTotalCount(count ?? mapped.length)
    } catch (err) {
      console.error('Error fetching pacientes:', err)
      setError(err as Error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  // ✅ OPTIMIZACIÓN: Debounced fetch para realtime
  const debouncedFetch = useMemo(
    () => debounce(() => fetchPacientes({ silent: true }), 300),
    [fetchPacientes]
  )

  useEffect(() => {
    fetchPacientes()

    // ✅ OPTIMIZACIÓN: Nombre de canal consistente (sin timestamp)
    const channel = supabase
      .channel('realtime:pacientes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pacientes' }, () => {
        debouncedFetch()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPacientes, debouncedFetch])

  return {
    pacientes,
    loading,
    error,
    refetch: fetchPacientes,
    totalCount,
  }
}
