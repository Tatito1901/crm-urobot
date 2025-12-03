/**
 * ============================================================
 * HOOK: useLeads
 * ============================================================
 * Hook optimizado con SWR para leads
 * ✅ SWR: Caché, deduplicación y revalidación automática
 * ❌ Realtime: DESHABILITADO (optimización de rendimiento BD)
 */

import { useMemo } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { type Lead, type LeadRow } from '@/types/leads'
import { mapLeadFromDB, enrichLead } from '@/lib/mappers'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
  stats: {
    total: number
    nuevos: number
    enSeguimiento: number
    convertidos: number
    descartados: number
    clientes: number
    calientes: number
    inactivos: number
  }
}

// Tipo para el JOIN
type LeadRowWithPaciente = LeadRow & {
  paciente: {
    id: string
    nombre_completo: string | null
    telefono: string
    email: string | null
  } | null
}

/**
 * Mapea una fila de la tabla 'leads' al tipo Lead con datos enriquecidos
 * Usa mapper centralizado + enriquece con datos de paciente
 */
const mapLead = (row: LeadRowWithPaciente): Lead => {
  // Obtener nombre del paciente si existe
  const pacienteNombre = row.paciente?.nombre_completo || undefined;
  
  // Usar mapper centralizado (convierte snake_case → camelCase)
  const leadBase = mapLeadFromDB(row, pacienteNombre);
  
  // Enriquecer con cálculos (días, esCaliente, esInactivo)
  const leadEnriquecido = enrichLead(leadBase);
  
  // Retornar lead enriquecido
  return leadEnriquecido;
}

/**
 * Fetcher para leads con JOIN a pacientes
 * ✅ Campos sincronizados con BD real (types/supabase.ts)
 */
const fetchLeads = async (): Promise<{ leads: Lead[], count: number }> => {
  const { data, error, count } = await supabase
    .from('leads')
    .select(`
      id,
      paciente_id,
      telefono_whatsapp,
      estado,
      fuente_lead,
      canal_marketing,
      notas_iniciales,
      session_id,
      fecha_primer_contacto,
      ultima_interaccion,
      fecha_conversion,
      total_interacciones,
      created_at,
      updated_at,
      paciente:pacientes (
        id,
        nombre_completo,
        telefono,
        email
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  if (!data) {
    return { leads: [], count: 0 }
  }

  // Mapear y validar cada lead
  const leads = (data as unknown as LeadRowWithPaciente[]).map(mapLead)
  
  return { leads, count: count || leads.length }
}

/**
 * Hook para gestionar leads
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 */
export function useLeads(): UseLeadsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'leads',
    fetchLeads,
    SWR_CONFIG_STANDARD
  )

  const leads = data?.leads || []
  
  // ✅ OPTIMIZACIÓN: Single-pass memoizado para todas las estadísticas
  const stats = useMemo(() => {
    let nuevos = 0, enSeguimiento = 0, convertidos = 0, descartados = 0
    let clientes = 0, calientes = 0, inactivos = 0
    
    for (const l of leads) {
      // Estado
      switch (l.estado) {
        case 'Nuevo': nuevos++; break
        case 'Contactado':
        case 'Interesado':
        case 'Calificado': enSeguimiento++; break
        case 'Convertido': convertidos++; break
        case 'No_Interesado':
        case 'Perdido': descartados++; break
      }
      
      // Flags
      if (l.esCliente) clientes++
      if (l.esCaliente) calientes++
      if (l.esInactivo) inactivos++
    }
    
    return {
      total: leads.length,
      nuevos,
      enSeguimiento,
      convertidos,
      descartados,
      clientes,
      calientes,
      inactivos,
    }
  }, [leads])

  return {
    leads,
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats,
  }
}
