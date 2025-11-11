/**
 * ============================================================
 * HOOK REFACTORIZADO: usePacientes
 * ============================================================
 * Simplificado usando el hook genérico useRealtimeTable.
 * Reducido de ~109 líneas a ~57 líneas (48% menos código).
 */

import {
  DEFAULT_PACIENTE_ESTADO,
  type Paciente,
  isPacienteEstado,
} from '@/types/pacientes'
import type { Tables } from '@/types/database'
import { useRealtimeTable } from './useRealtimeTable'

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
 * Hook para gestionar pacientes con subscripción en tiempo real
 */
export function usePacientes(): UsePacientesReturn {
  const { data: pacientes, loading, error, refetch, totalCount } = useRealtimeTable<PacienteRow, Paciente>({
    table: 'pacientes',
    queryBuilder: (query) => query.order('ultima_consulta', { ascending: false, nullsFirst: false }),
    mapFn: mapPaciente,
  })

  return {
    pacientes,
    loading,
    error,
    refetch,
    totalCount,
  }
}
