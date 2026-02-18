/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook optimizado con SWR para pacientes
 * ✅ v3: RPC get_pacientes_with_stats — stats y métricas en PostgreSQL
 * ✅ Elimina SELECT * y useMemo client-side
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { type Paciente, type PacienteEstado, isPacienteEstado } from '@/types/pacientes'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface PacienteStats {
  total: number
  activos: number
  inactivos: number
  recientes: number
  requierenAtencion: number
  conConsultas: number
  sinConsultas: number
}

interface PacienteMetricas {
  tasaRetencion: number
  pacientesFrecuentes: number
  conDatosCompletos: number
  sinEmail: number
  enRiesgo: number
  porFuente: {
    whatsapp: number
    referido: number
    web: number
    otros: number
  }
  nuevosMes: number
  recurrentesMes: number
}

interface UsePacientesReturn {
  pacientes: Paciente[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
  stats: PacienteStats
  metricas: PacienteMetricas
}

const DEFAULT_STATS: PacienteStats = {
  total: 0, activos: 0, inactivos: 0, recientes: 0,
  requierenAtencion: 0, conConsultas: 0, sinConsultas: 0,
}

const DEFAULT_METRICAS: PacienteMetricas = {
  tasaRetencion: 0, pacientesFrecuentes: 0, conDatosCompletos: 0,
  sinEmail: 0, enRiesgo: 0,
  porFuente: { whatsapp: 0, referido: 0, web: 0, otros: 0 },
  nuevosMes: 0, recurrentesMes: 0,
}

interface RPCResult {
  pacientes: Record<string, unknown>[]
  stats: Record<string, number>
  metricas: Record<string, unknown>
  count: number
}

/**
 * Fetcher v3: RPC get_pacientes_with_stats
 * ✅ Stats y métricas calculadas en PostgreSQL (0 cómputo client-side)
 * ✅ Solo campos necesarios (no SELECT *)
 */
const fetchPacientes = async (): Promise<{ pacientes: Paciente[], stats: PacienteStats, metricas: PacienteMetricas, count: number }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_pacientes_with_stats')

  if (error) throw error

  const d = data as RPCResult | null
  if (!d) return { pacientes: [], stats: DEFAULT_STATS, metricas: DEFAULT_METRICAS, count: 0 }

  // Mapear pacientes desde la RPC
  const pacientes: Paciente[] = (d.pacientes || []).map((p: Record<string, unknown>) => {
    const nombre = (p.nombre as string) || ''
    const apellido = (p.apellido as string) || null
    const telefono = (p.telefono as string) || ''
    const estadoRaw = (p.estado as string) || 'activo'
    const estado: PacienteEstado = isPacienteEstado(estadoRaw) ? estadoRaw : 'activo'

    return {
      id: p.id as string,
      nombre,
      apellido,
      telefono,
      email: (p.email as string) || null,
      fechaNacimiento: (p.fecha_nacimiento as string) || null,
      genero: (p.sexo as string) || null,
      fuente: null,
      origenLead: (p.origen_lead as string) || null,
      estado,
      esActivo: estado === 'activo',
      observaciones: (p.notas as string) || null,
      leadId: null,
      createdAt: (p.created_at as string) || null,
      updatedAt: (p.updated_at as string) || null,
      nombreDisplay: nombre || telefono,
      totalConsultas: (p.total_consultas as number) ?? undefined,
      ultimaConsulta: (p.ultima_consulta as string) || null,
    }
  })

  // Stats pre-calculadas del servidor
  const s = d.stats || {}
  const stats: PacienteStats = {
    total: Number(s.total) || 0,
    activos: Number(s.activos) || 0,
    inactivos: Number(s.inactivos) || 0,
    recientes: Number(s.recientes) || 0,
    requierenAtencion: Number(s.requierenAtencion) || 0,
    conConsultas: Number(s.conConsultas) || 0,
    sinConsultas: Number(s.sinConsultas) || 0,
  }

  // Métricas pre-calculadas del servidor
  const m = d.metricas || {} as Record<string, unknown>
  const pf = (m.porFuente || {}) as Record<string, number>
  const metricas: PacienteMetricas = {
    tasaRetencion: Number(m.tasaRetencion) || 0,
    pacientesFrecuentes: Number(m.pacientesFrecuentes) || 0,
    conDatosCompletos: Number(m.conDatosCompletos) || 0,
    sinEmail: Number(m.sinEmail) || 0,
    enRiesgo: Number(m.enRiesgo) || 0,
    porFuente: {
      whatsapp: Number(pf.whatsapp) || 0,
      referido: Number(pf.referido) || 0,
      web: Number(pf.web) || 0,
      otros: Number(pf.otros) || 0,
    },
    nuevosMes: Number(m.nuevosMes) || 0,
    recurrentesMes: Number(m.recurrentesMes) || 0,
  }

  return { pacientes, stats, metricas, count: d.count || pacientes.length }
}

/**
 * Hook para gestionar pacientes
 * ✅ v3: Stats y métricas server-side via RPC (eliminó useMemo pesado)
 */
export function usePacientes(): UsePacientesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'pacientes',
    fetchPacientes,
    SWR_CONFIG_STANDARD
  )

  return {
    pacientes: data?.pacientes || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats: data?.stats || DEFAULT_STATS,
    metricas: data?.metricas || DEFAULT_METRICAS,
  }
}
