/**
 * ============================================================
 * HOOK: useDashboardActivity
 * ============================================================
 * Hook LIGERO para el dashboard que solo trae:
 * - 5 leads más recientes
 * - 5 consultas próximas
 * 
 * ✅ Reemplaza useLeads + useConsultas en el dashboard
 * ✅ Reduce payload de ~200KB+ a ~2KB
 * ✅ Queries con LIMIT 5 en vez de SELECT * completo
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface RecentLead {
  id: string
  nombre: string
  telefono: string
  estado: string
  fuente: string
  primerContacto: string | null
}

interface UpcomingConsulta {
  id: string
  paciente: string
  fechaHoraInicio: string
  sede: string
  estadoCita: string
}

interface DashboardActivity {
  recentLeads: RecentLead[]
  upcomingConsultas: UpcomingConsulta[]
}

const fetchDashboardActivity = async (): Promise<DashboardActivity> => {
  const now = new Date().toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [leadsResult, consultasResult] = await Promise.all([
    // Solo 5 leads más recientes (no ALL leads)
    sb
      .from('leads')
      .select('id, nombre, telefono, estado, fuente, created_at')
      .order('created_at', { ascending: false })
      .limit(5),

    // Solo 5 consultas futuras más próximas con nombre de paciente via JOIN
    sb
      .from('consultas')
      .select('id, fecha_hora_inicio, sede_id, estado_cita, pacientes(nombre)')
      .gte('fecha_hora_inicio', now)
      .order('fecha_hora_inicio', { ascending: true })
      .limit(5),
  ])

  const recentLeads: RecentLead[] = (leadsResult.data || []).map((l: Record<string, unknown>) => ({
    id: l.id as string,
    nombre: (l.nombre as string) || (l.telefono as string) || 'Sin nombre',
    telefono: (l.telefono as string) || '',
    estado: (l.estado as string) || 'nuevo',
    fuente: (l.fuente as string) || 'Otro',
    primerContacto: (l.created_at as string) || null,
  }))

  const upcomingConsultas: UpcomingConsulta[] = (consultasResult.data || []).map((c: Record<string, unknown>) => {
    const paciente = c.pacientes as { nombre?: string } | null
    return {
      id: c.id as string,
      paciente: paciente?.nombre || 'Paciente',
      fechaHoraInicio: c.fecha_hora_inicio as string,
      sede: (c.sede_id as string) || '',
      estadoCita: (c.estado_cita as string) || 'Programada',
    }
  })

  return { recentLeads, upcomingConsultas }
}

export function useDashboardActivity() {
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard-activity',
    fetchDashboardActivity,
    SWR_CONFIG_STANDARD
  )

  return {
    recentLeads: data?.recentLeads ?? [],
    upcomingConsultas: data?.upcomingConsultas ?? [],
    loading: isLoading,
    error: error ?? null,
    refresh: async () => { await mutate() },
  }
}
