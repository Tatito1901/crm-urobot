/**
 * ============================================================
 * HOOK: useConsultas
 * ============================================================
 * Hook optimizado con SWR para consultas
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import {
  DEFAULT_CONSULTA_ESTADO,
  DEFAULT_CONSULTA_SEDE,
  type Consulta,
  isConsultaEstado,
  isConsultaSede,
} from '@/types/consultas'
import type { Tables } from '@/types/database'

const supabase = createClient()

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
 * Fetcher para consultas
 */
const fetchConsultas = async (): Promise<{ consultas: Consulta[], count: number }> => {
  const { data, error, count } = await supabase
    .from('consultas')
    .select('*, paciente:pacientes ( id, nombre_completo )', { count: 'exact' })
    .order('fecha_consulta', { ascending: false })

  if (error) throw error

  const consultas = (data || []).map(mapConsulta)
  return { consultas, count: count || consultas.length }
}

/**
 * Hook para gestionar consultas
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 */
export function useConsultas(): UseConsultasReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'consultas',
    fetchConsultas,
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
    consultas: data?.consultas || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
  }
}
