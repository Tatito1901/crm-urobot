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
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 */
export function usePacientes(): UsePacientesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'pacientes',
    fetchPacientes,
    {
      // ✅ Revalidar cuando el usuario vuelve a la pestaña
      revalidateOnFocus: true,

      // ✅ Revalidar si pierde conexión y vuelve (útil en mobile)
      revalidateOnReconnect: true,

      // ✅ Caché compartido por 5 minutos (evita requests duplicados)
      dedupingInterval: 5 * 60 * 1000,

      // ✅ NO revalidar automáticamente datos en caché
      revalidateIfStale: false,

      // ❌ NO polling automático (no necesario con 2 usuarios)
      refreshInterval: 0,

      // ✅ Mantener datos previos mientras recarga (mejor UX, sin parpadeos)
      keepPreviousData: true,

      // ✅ Retry automático en caso de error
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
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
