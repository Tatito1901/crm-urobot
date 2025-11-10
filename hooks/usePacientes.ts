/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook para gestionar pacientes usando datos locales (sin real-time)
 */

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Paciente } from '@/app/lib/crm-data'
import type { Tables } from '@/types/database'

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
  const estadosValidos: Paciente['estado'][] = ['Activo', 'Inactivo'];
  const estado = estadosValidos.includes(row.estado as Paciente['estado'])
    ? (row.estado as Paciente['estado'])
    : 'Activo';

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

  useEffect(() => {
    fetchPacientes()

    const channel = supabase
      .channel('public:pacientes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pacientes' }, () => {
        fetchPacientes({ silent: true })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPacientes])

  return {
    pacientes,
    loading,
    error,
    refetch: fetchPacientes,
    totalCount,
  }
}
