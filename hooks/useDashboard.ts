import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

export interface DashboardMetrics {
  leads_activos: number
  leads_hoy: number
  leads_calientes: number
  consultas_hoy: number
  consultas_semana: number
  consultas_sin_confirmar: number
  recordatorios_vencidos: number
  recordatorios_proxima_hora: number
  escalamientos_pendientes: number
  escalamientos_urgentes: number
  calculated_at: string
}

const fetcher = async () => {
  const supabase = createClient()
  
  // Por ahora usaremos queries individuales hasta crear las vistas
  // Una vez creadas las vistas en Supabase, cambiar a:
  // const { data, error } = await supabase.from('vw_dashboard_metrics').select('*').single()
  
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  // Queries paralelas para métricas
  const [leads, consultas, recordatorios, escalamientos] = await Promise.all([
    // Leads metrics
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: false })
      .neq('estado', 'Convertido'),
    
    // Consultas metrics
    supabase
      .from('consultas')
      .select('*', { count: 'exact', head: false })
      .gte('fecha_consulta', today)
      .lte('fecha_consulta', nextWeek)
      .in('estado_cita', ['Programada', 'Confirmada']),
    
    // Recordatorios metrics
    supabase
      .from('recordatorios')
      .select('*', { count: 'exact', head: false })
      .eq('estado', 'pendiente')
      .lte('programado_para', now.toISOString()),
    
    // Escalamientos metrics
    supabase
      .from('escalamientos')
      .select('*', { count: 'exact', head: false })
      .eq('estado', 'pendiente')
  ])
  
  // Contar leads de hoy
  const leadsHoy = leads.data?.filter(lead => 
    new Date(lead.created_at) > new Date(yesterday)
  ).length || 0
  
  // Contar leads calientes
  const leadsCalientes = leads.data?.filter(lead => 
    lead.temperatura === 'Caliente'
  ).length || 0
  
  // Consultas de hoy
  const consultasHoy = consultas.data?.filter(c => 
    c.fecha_consulta === today
  ).length || 0
  
  // Consultas sin confirmar
  const consultasSinConfirmar = consultas.data?.filter(c => 
    !c.confirmado_paciente
  ).length || 0
  
  // Recordatorios en la próxima hora
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
  const recordatoriosProximaHora = recordatorios.data?.filter(r => 
    r.programado_para <= nextHour
  ).length || 0
  
  // Escalamientos urgentes
  const escalamientosUrgentes = escalamientos.data?.filter(e => 
    e.prioridad === 'alta'
  ).length || 0
  
  return {
    leads_activos: leads.count || 0,
    leads_hoy: leadsHoy,
    leads_calientes: leadsCalientes,
    consultas_hoy: consultasHoy,
    consultas_semana: consultas.count || 0,
    consultas_sin_confirmar: consultasSinConfirmar,
    recordatorios_vencidos: recordatorios.count || 0,
    recordatorios_proxima_hora: recordatoriosProximaHora,
    escalamientos_pendientes: escalamientos.count || 0,
    escalamientos_urgentes: escalamientosUrgentes,
    calculated_at: now.toISOString()
  } as DashboardMetrics
}

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard-metrics',
    fetcher,
    {
      refreshInterval: 30000, // Refresh cada 30s
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // No duplicar llamadas en 10s
    }
  )
  
  return {
    metrics: data,
    error,
    loading: isLoading,
    refresh: mutate
  }
}
