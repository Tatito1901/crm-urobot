/**
 * ============================================================
 * HOOK: useConsultas
 * ============================================================
 * Hook para gestionar consultas usando datos locales (sin real-time)
 */

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Consulta, ConsultaEstado } from '@/app/lib/crm-data'
import type { Tables } from '@/types/database'

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
  const fallbackDate = new Date().toISOString()
  const resolvedTimezone: Consulta['timezone'] = 'America/Mexico_City'

  const fechaLocal = row.fecha_consulta && row.hora_consulta
    ? `${row.fecha_consulta}T${row.hora_consulta}`
    : row.fecha_consulta ?? fallbackDate

  const horaDesdeUtc = row.fecha_hora_utc ? row.fecha_hora_utc.split('T')[1]?.slice(0, 8) : null

  return {
    id: row.consulta_id,
    uuid: row.id,
    paciente: row.paciente?.nombre_completo ?? 'Paciente sin nombre',
    pacienteId: row.paciente_id,
    sede: (row.sede as Consulta['sede']) ?? 'POLANCO',
    tipo: row.tipo_cita ?? 'primera_vez',
    estado: (row.estado_cita as ConsultaEstado) ?? 'Programada',
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
  }
}

export function useConsultas(): UseConsultasReturn {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchConsultas = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      const { data, error: fetchError, count } = await supabase
        .from('consultas')
        .select('*, paciente:pacientes ( id, nombre_completo )', { count: 'exact' })
        .order('fecha_consulta', { ascending: false })

      if (fetchError) throw fetchError

      const mapped = (data as ConsultaRow[] | null)?.map(mapConsulta) ?? []
      setConsultas(mapped)
      setTotalCount(count ?? mapped.length)
    } catch (err) {
      console.error('Error fetching consultas:', err)
      setError(err as Error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchConsultas()

    const channel = supabase
      .channel('public:consultas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultas' }, () => {
        fetchConsultas({ silent: true })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConsultas])

  return {
    consultas,
    loading,
    error,
    refetch: fetchConsultas,
    totalCount,
  }
}
