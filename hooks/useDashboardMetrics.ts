/**
 * ============================================================
 * HOOK: useDashboardMetrics
 * ============================================================
 * Hook para obtener métricas del dashboard usando SWR
 * ✅ OPTIMIZACIÓN: Usa función RPC (1 query vs 9 queries)
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import {
  DEFAULT_DASHBOARD_METRICS,
  type DashboardMetrics,
} from '@/types/dashboard'

// ✅ OPTIMIZACIÓN: Usar singleton del cliente
const supabase = createClient()

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isValidating: boolean
}

/**
 * Tipo para los datos retornados por el RPC get_dashboard_metrics
 */
interface DashboardMetricsRPC {
  leads_totales: number
  leads_mes: number
  leads_convertidos: number
  tasa_conversion_pct: number
  pacientes_activos: number
  total_pacientes: number
  consultas_futuras: number
  consultas_hoy: number
  pendientes_confirmacion: number
  polanco_futuras: number
  satelite_futuras: number
}

/**
 * Fetcher function para SWR
 */
const fetchMetrics = async (): Promise<DashboardMetrics> => {
  try {

    // ✅ OPTIMIZACIÓN: Intentar RPC primero (función RPC disponible en Supabase)
    const { data, error: rpcError } = await supabase.rpc('get_dashboard_metrics')

    if (!rpcError && data) {
      // Transformar datos del RPC
      const rpcData = data as unknown as DashboardMetricsRPC;
      return {
        leadsTotal: rpcData.leads_totales || 0,
        leadsMes: rpcData.leads_mes || 0,
        leadsConvertidos: rpcData.leads_convertidos || 0,
        tasaConversion: rpcData.tasa_conversion_pct || 0,
        pacientesActivos: rpcData.pacientes_activos || 0,
        totalPacientes: rpcData.total_pacientes || 0,
        consultasFuturas: rpcData.consultas_futuras || 0,
        consultasHoy: rpcData.consultas_hoy || 0,
        pendientesConfirmacion: rpcData.pendientes_confirmacion || 0,
        polancoFuturas: rpcData.polanco_futuras || 0,
        sateliteFuturas: rpcData.satelite_futuras || 0,
      }
    }

    // Fallback: intentar con la view
    console.warn('RPC no disponible, intentando con view...')
    const { data: viewData, error: viewError } = await supabase
      .from('dashboard_metricas')
      .select('*')
      .limit(1)
      .single()

    if (!viewError && viewData) {
      return {
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
    }

    // Último fallback: calcular manualmente
    console.warn('View tampoco disponible, calculando manualmente')
    return await calculateMetricsManually()
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err)
    return DEFAULT_DASHBOARD_METRICS
  }
}

/**
 * Hook principal del dashboard
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 */
export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardMetrics>(
    'dashboard-metrics',
    fetchMetrics,
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
    metrics: data || null,
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    isValidating,
  }
}

/**
 * Calcula métricas manualmente si la view no existe
 */
async function calculateMetricsManually(): Promise<DashboardMetrics> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // ✅ OPTIMIZACIÓN: Ejecutar queries en paralelo con Promise.all
    const [leadsResult, pacientesResult, consultasResult] = await Promise.all([
      // Leads - 3 queries en paralelo
      Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', primerDiaMes),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('estado', 'Convertido'),
      ]),
      // Pacientes - 2 queries en paralelo
      Promise.all([
        supabase.from('pacientes').select('*', { count: 'exact', head: true }),
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('estado', 'Activo'),
      ]),
      // Consultas - 6 queries en paralelo
      Promise.all([
        supabase.from('consultas').select('*', { count: 'exact', head: true }).gte('fecha_consulta', today),
        supabase.from('consultas').select('*', { count: 'exact', head: true }).eq('fecha_consulta', today),
        supabase.from('consultas').select('*', { count: 'exact', head: true }).eq('confirmado_paciente', false).gte('fecha_consulta', today),
        supabase.from('consultas').select('*', { count: 'exact', head: true }).eq('sede', 'POLANCO').gte('fecha_consulta', today),
        supabase.from('consultas').select('*', { count: 'exact', head: true }).eq('sede', 'SATELITE').gte('fecha_consulta', today),
      ]),
    ])

    const { count: leadsTotal } = leadsResult[0]
    const { count: leadsMes } = leadsResult[1]
    const { count: leadsConvertidos } = leadsResult[2]

    const { count: totalPacientes } = pacientesResult[0]
    const { count: pacientesActivos } = pacientesResult[1]

    const { count: consultasFuturas } = consultasResult[0]
    const { count: consultasHoy } = consultasResult[1]
    const { count: pendientesConfirmacion } = consultasResult[2]
    const { count: polancoFuturas } = consultasResult[3]
    const { count: sateliteFuturas } = consultasResult[4]

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
