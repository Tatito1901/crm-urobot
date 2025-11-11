/**
 * ============================================================
 * HOOK REFACTORIZADO: useConsultas
 * ============================================================
 * Simplificado usando el hook genérico useRealtimeTable.
 * Reducido de ~145 líneas a ~90 líneas (38% menos código).
 */

import {
  DEFAULT_CONSULTA_ESTADO,
  DEFAULT_CONSULTA_SEDE,
  type Consulta,
  isConsultaEstado,
  isConsultaSede,
} from '@/types/consultas'
import type { Tables } from '@/types/database'
import { useRealtimeTable } from './useRealtimeTable'

interface UseConsultasReturn {
  consultas: Consulta[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
}

type ConsultaRow = Tables<'consultas'> & {
  paciente: {
    id: string
    nombre_completo: string
  } | null
}

const mapConsulta = (row: ConsultaRow): Consulta => {
  const fallbackDate = new Date().toISOString();
  const resolvedTimezone: Consulta['timezone'] = 'America/Mexico_City';

  // Validar sede
  const sede = isConsultaSede(row.sede) ? row.sede : DEFAULT_CONSULTA_SEDE

  // Validar estado de cita
  const estado = isConsultaEstado(row.estado_cita)
    ? row.estado_cita
    : DEFAULT_CONSULTA_ESTADO

  const fechaLocal = row.fecha_consulta && row.hora_consulta
    ? `${row.fecha_consulta}T${row.hora_consulta}`
    : row.fecha_consulta ?? fallbackDate;

  const horaDesdeUtc = row.fecha_hora_utc ? row.fecha_hora_utc.split('T')[1]?.slice(0, 8) : null;

  return {
    id: row.consulta_id,
    uuid: row.id,
    paciente: row.paciente?.nombre_completo ?? 'Paciente sin nombre',
    pacienteId: row.paciente_id,
    sede,
    tipo: row.tipo_cita ?? 'primera_vez',
    estado,
    estadoConfirmacion: row.estado_confirmacion ?? 'Pendiente',
    confirmadoPaciente: row.confirmado_paciente ?? false,
    fecha: row.fecha_hora_utc ?? fechaLocal,
    fechaConsulta: row.fecha_consulta ?? (row.fecha_hora_utc ? row.fecha_hora_utc.split('T')[0] : fallbackDate.split('T')[0]),
    horaConsulta: row.hora_consulta ?? horaDesdeUtc ?? '00:00:00',
    timezone: resolvedTimezone,
    motivoConsulta: row.motivo_consulta,
    duracionMinutos: row.duracion_minutos ?? 30,
    calendarEventId: row.calendar_event_id,
    calendarLink: row.calendar_link,
    canalOrigen: row.canal_origen,
    canceladoPor: row.cancelado_por,
    motivoCancelacion: row.motivo_cancelacion,
    createdAt: row.created_at ?? fallbackDate,
    updatedAt: row.updated_at ?? row.created_at ?? fallbackDate,
  };
}

/**
 * Hook para gestionar consultas con subscripción en tiempo real
 */
export function useConsultas(): UseConsultasReturn {
  const { data: consultas, loading, error, refetch, totalCount } = useRealtimeTable<ConsultaRow, Consulta>({
    table: 'consultas',
    queryBuilder: (query) =>
      query
        .select('*, paciente:pacientes ( id, nombre_completo )')
        .order('fecha_consulta', { ascending: false }),
    mapFn: mapConsulta,
  })

  return {
    consultas,
    loading,
    error,
    refetch,
    totalCount,
  }
}
