/**
 * ============================================================
 * HOOK: useDashboardMetrics
 * ============================================================
 * Hook para obtener métricas del dashboard desde la view
 */

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Crear instancia del cliente para hooks
const supabase = createClient()

interface DashboardMetrics {
  leadsTotal: number
  leadsMes: number
  leadsConvertidos: number
  tasaConversion: number
  pacientesActivos: number
  totalPacientes: number
  consultasFuturas: number
  consultasHoy: number
  pendientesConfirmacion: number
  polancoFuturas: number
  sateliteFuturas: number
}

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const defaultMetrics: DashboardMetrics = {
  leadsTotal: 0,
  leadsMes: 0,
  leadsConvertidos: 0,
  tasaConversion: 0,
  pacientesActivos: 0,
  totalPacientes: 0,
  consultasFuturas: 0,
  consultasHoy: 0,
  pendientesConfirmacion: 0,
  polancoFuturas: 0,
  sateliteFuturas: 0,
}

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener de la view dashboard_metricas
      const { data, error: fetchError } = await supabase
        .from('dashboard_metricas')
        .select('*')
        .limit(1)
        .single()

      if (fetchError) {
        // Si la view no existe, calcular manualmente
        console.warn('View dashboard_metricas no encontrada, calculando manualmente')
        const calculated = await calculateMetricsManually()
        setMetrics(calculated)
        return
      }

      // Transformar de BD a formato UI
      const transformedMetrics: DashboardMetrics = {
        leadsTotal: data.leads_totales || 0,
        leadsMes: data.leads_mes || 0,
        leadsConvertidos: data.leads_convertidos || 0,
        tasaConversion: data.tasa_conversion_pct || 0,
        pacientesActivos: data.pacientes_activos || 0,
        totalPacientes: data.total_pacientes || 0,
        consultasFuturas: data.consultas_futuras || 0,
        consultasHoy: data.consultas_hoy || 0,
        pendientesConfirmacion: data.pendientes_confirmacion || 0,
        polancoFuturas: data.polanco_futuras || 0,
        sateliteFuturas: data.satelite_futuras || 0,
      }

      setMetrics(transformedMetrics)
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err)
      setError(err as Error)
      setMetrics(defaultMetrics)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()

    // Refrescar cada 60 segundos
    const interval = setInterval(fetchMetrics, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  }
}

/**
 * Calcula métricas manualmente si la view no existe
 */
async function calculateMetricsManually(): Promise<DashboardMetrics> {
  try {
    // Leads
    const { count: leadsTotal } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })

    const { count: leadsMes } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const { count: leadsConvertidos } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'Convertido')

    // Pacientes
    const { count: totalPacientes } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })

    const { count: pacientesActivos } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'Activo')

    // Consultas
    const today = new Date().toISOString().split('T')[0]
    
    const { count: consultasFuturas } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_consulta', today)

    const { count: consultasHoy } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .eq('fecha_consulta', today)

    const { count: pendientesConfirmacion } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .eq('confirmado_paciente', false)
      .gte('fecha_consulta', today)

    const { count: polancoFuturas } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .eq('sede', 'POLANCO')
      .gte('fecha_consulta', today)

    const { count: sateliteFuturas } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .eq('sede', 'SATELITE')
      .gte('fecha_consulta', today)

    const safeLeadsTotal = leadsTotal ?? 0
    const safeLeadsMes = leadsMes ?? 0
    const safeLeadsConvertidos = leadsConvertidos ?? 0
    const safePacientesActivos = pacientesActivos ?? 0
    const safeTotalPacientes = totalPacientes ?? 0
    const safeConsultasFuturas = consultasFuturas ?? 0
    const safeConsultasHoy = consultasHoy ?? 0
    const safePendientesConfirmacion = pendientesConfirmacion ?? 0
    const safePolancoFuturas = polancoFuturas ?? 0
    const safeSateliteFuturas = sateliteFuturas ?? 0

    const tasaConversion = safeLeadsTotal
      ? Math.round((safeLeadsConvertidos / safeLeadsTotal) * 100)
      : 0

    return {
      leadsTotal: safeLeadsTotal,
      leadsMes: safeLeadsMes,
      leadsConvertidos: safeLeadsConvertidos,
      tasaConversion,
      pacientesActivos: safePacientesActivos,
      totalPacientes: safeTotalPacientes,
      consultasFuturas: safeConsultasFuturas,
      consultasHoy: safeConsultasHoy,
      pendientesConfirmacion: safePendientesConfirmacion,
      polancoFuturas: safePolancoFuturas,
      sateliteFuturas: safeSateliteFuturas,
    }
  } catch (err) {
    console.error('Error calculating metrics manually:', err)
    return defaultMetrics
  }
}
