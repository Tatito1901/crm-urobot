/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook optimizado con SWR para pacientes
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import {
  DEFAULT_PACIENTE_ESTADO,
  type Paciente,
  isPacienteEstado,
} from '@/types/pacientes'
import type { Tables } from '@/types/database'

const supabase = createClient()

interface UsePacientesReturn {
  pacientes: Paciente[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
}

type PacienteRow = Tables<'pacientes'>

/**
 * Mapea una fila de la tabla 'pacientes' al tipo Paciente
 */
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
  }
}

/**
 * Fetcher para pacientes
 */
const fetchPacientes = async (): Promise<{ pacientes: Paciente[], count: number }> => {
  const { data, error, count } = await supabase
    .from('pacientes')
    .select('*', { count: 'exact' })
    .order('ultima_consulta', { ascending: false, nullsFirst: false })

  if (error) throw error

  const pacientes = (data || []).map(mapPaciente)
  return { pacientes, count: count || pacientes.length }
}

/**
 * Hook para gestionar pacientes
 */
export function usePacientes(): UsePacientesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'pacientes',
    fetchPacientes,
    {
      refreshInterval: 0, // ❌ DESHABILITADO - Solo carga inicial y refresh manual
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  )

  return {
    pacientes: data?.pacientes || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
  }
}
