/**
 * ============================================================
 * HOOK: useDashboardMetrics
 * ============================================================
 * Hook para obtener métricas del dashboard usando RPC optimizado
 * ✅ OPTIMIZACIÓN: Usa función RPC (1 query vs 9 queries)
 * ✅ OPTIMIZACIÓN: Realtime en lugar de polling
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils/debounce'
import {
  DEFAULT_DASHBOARD_METRICS,
  type DashboardMetrics,
} from '@/types/dashboard'

// ✅ OPTIMIZACIÓN: Usar singleton del cliente
const supabase = getSupabaseClient()

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMetrics = useCallback(async (opts: { silent?: boolean } = {}) => {
    const { silent = false } = opts
    try {
      if (!silent) setLoading(true)
      setError(null)

      // ✅ OPTIMIZACIÓN: Usar función RPC (1 query en lugar de 9)
      const { data, error: fetchError } = await supabase.rpc('get_dashboard_metrics')

      if (fetchError) {
        // Fallback: intentar con la view
        console.warn('RPC no disponible, intentando con view...')
        const viewResult = await supabase
          .from('dashboard_metricas')
          .select('*')
          .limit(1)
          .single()

        if (viewResult.error) {
          // Último fallback: calcular manualmente
          console.warn('View tampoco disponible, calculando manualmente')
          const calculated = await calculateMetricsManually()
          setMetrics(calculated)
          return
        }

        // Transformar datos de la view
        const viewData = viewResult.data
        const transformedMetrics: DashboardMetrics = {
          leadsTotal: viewData.leads_totales || 0,
          leadsMes: viewData.leads_mes || 0,
          leadsConvertidos: viewData.leads_convertidos || 0,
          tasaConversion: viewData.tasa_conversion_pct || 0,
          pacientesActivos: viewData.pacientes_activos || 0,
          totalPacientes: viewData.total_pacientes || 0,
          consultasFuturas: viewData.consultas_futuras || 0,
          consultasHoy: viewData.consultas_hoy || 0,
          pendientesConfirmacion: viewData.pendientes_confirmacion || 0,
          polancoFuturas: viewData.polanco_futuras || 0,
          sateliteFuturas: viewData.satelite_futuras || 0,
        }
        setMetrics(transformedMetrics)
        return
      }

      // Transformar datos del RPC
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
      setMetrics(DEFAULT_DASHBOARD_METRICS)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // ✅ OPTIMIZACIÓN: Debounced fetch para realtime
  const debouncedFetch = useMemo(
    () => debounce(() => fetchMetrics({ silent: true }), 500),
    [fetchMetrics]
  )

  useEffect(() => {
    fetchMetrics()

    // ✅ OPTIMIZACIÓN: Realtime en lugar de polling
    // Suscribirse a las 3 tablas que afectan las métricas
    const leadsChannel = supabase
      .channel('metrics:leads')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads'
      }, () => {
        debouncedFetch()
      })
      .subscribe()

    const pacientesChannel = supabase
      .channel('metrics:pacientes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pacientes'
      }, () => {
        debouncedFetch()
      })
      .subscribe()

    const consultasChannel = supabase
      .channel('metrics:consultas')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultas'
      }, () => {
        debouncedFetch()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(leadsChannel)
      supabase.removeChannel(pacientesChannel)
      supabase.removeChannel(consultasChannel)
    }
  }, [fetchMetrics, debouncedFetch])

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
    return DEFAULT_DASHBOARD_METRICS
  }
}
