/**
 * ============================================================
 * HOOK: useLeads
 * ============================================================
 * Hook optimizado con SWR para leads
 * ✅ v3: RPC get_leads_with_stats — stats calculadas en PostgreSQL
 * ✅ Elimina SELECT * y useMemo client-side
 * ❌ Realtime: DESHABILITADO (optimización de rendimiento BD)
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { type Lead, type LeadSignals, type LeadScores, type LeadSubestado, LEAD_ESTADO_DISPLAY, LEAD_ESTADOS_ACTIVOS, LEAD_SUBESTADOS } from '@/types/leads'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface LeadStats {
  total: number
  nuevos: number
  enSeguimiento: number
  convertidos: number
  descartados: number
  clientes: number
  calientes: number
  inactivos: number
}

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
  stats: LeadStats
}

const DEFAULT_STATS: LeadStats = {
  total: 0, nuevos: 0, enSeguimiento: 0, convertidos: 0,
  descartados: 0, clientes: 0, calientes: 0, inactivos: 0,
}

function parseLeadSignals(raw: unknown): LeadSignals | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (!s.perfil_paciente && !s.prediccion_conversion && !s.nivel_compromiso) return null
  return {
    perfil_paciente: (s.perfil_paciente as string) || null,
    emociones: Array.isArray(s.emociones) ? s.emociones : [],
    nivel_compromiso: typeof s.nivel_compromiso === 'number' ? s.nivel_compromiso : null,
    prediccion_conversion: (s.prediccion_conversion as string) || null,
    incentivo_sugerido: (s.incentivo_sugerido as string) || null,
    barrera_principal: (s.barrera_principal as string) || null,
    pregunto_precio: s.pregunto_precio === true,
  }
}

function parseLeadScores(raw: unknown): LeadScores | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (s.clinical === undefined && s.intent === undefined) return null
  return {
    clinical: Number(s.clinical) || 0,
    intent: Number(s.intent) || 0,
    bant: Number(s.bant) || 0,
    engagement: Number(s.engagement) || 0,
  }
}

/**
 * Fetcher v3: RPC get_leads_with_stats
 * ✅ Stats calculadas en PostgreSQL (0 cómputo client-side)
 * ✅ Solo campos necesarios (no SELECT *)
 */
const fetchLeads = async (): Promise<{ leads: Lead[], stats: LeadStats, count: number }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_leads_with_stats')

  if (error) {
    console.error('Error fetching leads:', error)
    throw error
  }

  const d = data as { leads: Record<string, unknown>[]; stats: Record<string, number>; count: number } | null
  if (!d) return { leads: [], stats: DEFAULT_STATS, count: 0 }

  // Mapear leads desde la RPC (ya vienen con campos correctos)
  const leads: Lead[] = (d.leads || []).map((l: Record<string, unknown>) => {
    const telefono = (l.telefono as string) || ''
    const nombre = (l.nombre as string) || telefono
    const ultimaInteraccion = l.ultima_interaccion as string | null
    const totalMensajes = (l.total_mensajes as number) || 0
    const temperatura = ((l.temperatura as string) || 'frio') as Lead['temperatura']
    const fechaSiguienteAccion = l.fecha_siguiente_accion as string | null
    const estado = ((l.estado as string) || 'nuevo') as Lead['estado']

    const diasDesdeUltimaInteraccion = ultimaInteraccion
      ? Math.floor((Date.now() - new Date(ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    const subestadoRaw = l.subestado as string | null
    const subestado: LeadSubestado | null = subestadoRaw && (LEAD_SUBESTADOS as readonly string[]).includes(subestadoRaw)
      ? subestadoRaw as LeadSubestado
      : null

    return {
      id: l.id as string,
      nombre,
      telefono,
      estado,
      fuente: ((l.fuente as string) || 'Otro') as Lead['fuente'],
      canal: (l.canal as string) || null,
      temperatura,
      notas: (l.notas as string) || null,
      email: (l.email as string) || null,
      convertidoAPacienteId: (l.convertido_a_paciente_id as string) || null,
      totalMensajes,
      ultimaInteraccion,
      scoreTotal: (l.score_total as number) || 0,
      calificacion: (l.calificacion as string) || null,
      etapaFunnel: (l.etapa_funnel as string) || null,
      subestado,
      accionRecomendada: (l.accion_recomendada as string) || null,
      fechaSiguienteAccion,
      createdAt: (l.created_at as string) || '',
      updatedAt: (l.updated_at as string) || '',
      // Behavioral signals
      signals: parseLeadSignals(l.signals),
      scores: parseLeadScores(l.scores),
      // Meta Ads attribution
      campanaId: (l.campana_id as string) || null,
      campanaHeadline: (l.campana_headline as string) || null,
      campanaUrl: (l.campana_url as string) || null,
      ctwaClid: (l.ctwa_clid as string) || null,
      esMetaAds: !!(l.campana_id || l.ctwa_clid),
      // Calculados
      nombreDisplay: nombre,
      estadoDisplay: LEAD_ESTADO_DISPLAY[estado] || estado,
      diasDesdeContacto: 0,
      diasDesdeUltimaInteraccion,
      esCliente: !!(l.convertido_a_paciente_id),
      esCaliente: temperatura === 'caliente' || temperatura === 'muy_caliente' || temperatura === 'urgente',
      esInactivo: diasDesdeUltimaInteraccion > 7,
      esEnPipeline: (LEAD_ESTADOS_ACTIVOS as readonly string[]).includes(estado),
      requiereSeguimiento: fechaSiguienteAccion
        ? new Date(fechaSiguienteAccion).getTime() <= Date.now()
        : false,
    }
  })

  // Stats ya vienen pre-calculadas del servidor
  const s = d.stats || {}
  const stats: LeadStats = {
    total: Number(s.total) || 0,
    nuevos: Number(s.nuevos) || 0,
    enSeguimiento: Number(s.enSeguimiento) || 0,
    convertidos: Number(s.convertidos) || 0,
    descartados: Number(s.descartados) || 0,
    clientes: Number(s.clientes) || 0,
    calientes: Number(s.calientes) || 0,
    inactivos: Number(s.inactivos) || 0,
  }

  return { leads, stats, count: d.count || leads.length }
}

/**
 * Hook para gestionar leads
 * ✅ v3: Stats server-side via RPC (eliminó useMemo pesado)
 */
export function useLeads(): UseLeadsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'leads',
    fetchLeads,
    SWR_CONFIG_STANDARD
  )

  return {
    leads: data?.leads || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats: data?.stats || DEFAULT_STATS,
  }
}
