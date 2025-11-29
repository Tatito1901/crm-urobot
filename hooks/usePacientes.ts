/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook optimizado con SWR para pacientes
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import { createClient } from '@/lib/supabase/client'
import useSWR from 'swr'
import { type Paciente, type PacienteRow, type PacienteStatsRow, mapPacienteFromDB } from '@/types/pacientes'
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config'

const supabase = createClient()

interface UsePacientesReturn {
  pacientes: Paciente[]
  loading: boolean
  error: Error | null
  refetch: (options?: { silent?: boolean }) => Promise<void>
  totalCount: number
  stats: {
    total: number
    activos: number
    inactivos: number
    recientes: number
    requierenAtencion: number
    conConsultas: number
    sinConsultas: number
  }
  metricas: {
    // Métricas de retención
    tasaRetencion: number          // % pacientes con 2+ consultas
    pacientesFrecuentes: number    // 5+ consultas
    
    // Métricas de datos
    conDatosCompletos: number      // Email + teléfono
    sinEmail: number               // Falta email
    
    // Métricas de riesgo
    enRiesgo: number              // 180+ días sin consulta
    
    // Distribución
    porFuente: {
      whatsapp: number
      referido: number
      web: number
      otros: number
    }
    
    // Temporales
    nuevosMes: number             // Últimos 30 días
    recurrentesMes: number        // Con consulta en últimos 30d
  }
}

/**
 * Fetcher para pacientes
 * ✅ Campos sincronizados con BD real (types/supabase.ts)
 * ✅ Usa vista paciente_stats para estadísticas calculadas
 */
const fetchPacientes = async (): Promise<{ pacientes: Paciente[], count: number }> => {
  // Query principal de pacientes
  const { data, error, count } = await supabase
    .from('pacientes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching pacientes:', error)
    throw error
  }

  if (!data) {
    return { pacientes: [], count: 0 }
  }

  // Obtener estadísticas de la vista paciente_stats
  const { data: statsData } = await supabase
    .from('paciente_stats')
    .select('*')

  const statsMap = new Map(
    (statsData || []).map(s => [s.paciente_id, s])
  )

  // Mapear los pacientes con sus estadísticas
  const pacientes = (data as PacienteRow[]).map(row => {
    const stats = statsMap.get(row.id) || null
    return mapPacienteFromDB(row, stats)
  })
  
  return { pacientes, count: pacientes.length }
}

/**
 * Hook para gestionar pacientes
 *
 * ✅ QUICK WIN #3: Configuración SWR optimizada
 * - Revalida automáticamente cuando vuelves a la pestaña (mejor UX)
 * - Caché de 5 minutos (menos requests duplicados con 2 usuarios)
 * - Retry automático en caso de error de red
 * - Mantiene datos previos mientras recarga (sin parpadeos)
 */
export function usePacientes(): UsePacientesReturn {
  const { data, error, isLoading, mutate } = useSWR<{ pacientes: Paciente[], count: number }>(
    'pacientes',
    fetchPacientes,
    SWR_CONFIG_STANDARD
  )

  const pacientes = data?.pacientes || []
  
  // Helpers para cálculos
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  const hace180Dias = new Date();
  hace180Dias.setDate(hace180Dias.getDate() - 180);
  
  const esReciente = (p: Paciente) => 
    p.createdAt && new Date(p.createdAt) >= hace30Dias;
  
  const requiereAtencion = (p: Paciente) => 
    p.estado === 'Activo' && p.ultimaConsulta && new Date(p.ultimaConsulta) < hace180Dias;
  
  // Calcular estadísticas básicas (usando campos reales de BD)
  const stats = {
    total: pacientes.length,
    activos: pacientes.filter(p => p.estado === 'Activo').length,
    inactivos: pacientes.filter(p => p.estado === 'Inactivo').length,
    recientes: pacientes.filter(esReciente).length,
    requierenAtencion: pacientes.filter(requiereAtencion).length,
    conConsultas: pacientes.filter(p => (p.totalConsultas ?? 0) > 0).length,
    sinConsultas: pacientes.filter(p => (p.totalConsultas ?? 0) === 0).length,
  }
  
  // Calcular métricas avanzadas
  const pacientesConConsultas = pacientes.filter(p => (p.totalConsultas ?? 0) > 0);
  const pacientesRetenidos = pacientes.filter(p => (p.totalConsultas ?? 0) >= 2);
  const tasaRetencion = pacientesConConsultas.length > 0
    ? Math.round((pacientesRetenidos.length / pacientesConConsultas.length) * 100)
    : 0;
  
  const pacientesFrecuentes = pacientes.filter(p => (p.totalConsultas ?? 0) >= 5).length;
  
  const conDatosCompletos = pacientes.filter(p => 
    p.email && p.email.trim() !== '' && p.telefono && p.telefono.trim() !== ''
  ).length;
  
  const sinEmail = pacientes.filter(p => !p.email || p.email.trim() === '').length;
  
  // Pacientes en riesgo: activos sin consulta en 180+ días
  const enRiesgo = pacientes.filter(requiereAtencion).length;
  
  // Distribución por fuente (usa origenLead en lugar de fuenteOriginal)
  const fuenteLower = (f: string | null | undefined) => f?.toLowerCase() || '';
  const porFuente = {
    whatsapp: pacientes.filter(p => fuenteLower(p.origenLead).includes('whatsapp')).length,
    referido: pacientes.filter(p => 
      fuenteLower(p.origenLead).includes('referido') ||
      fuenteLower(p.origenLead).includes('recomendación')
    ).length,
    web: pacientes.filter(p => 
      fuenteLower(p.origenLead).includes('web') ||
      fuenteLower(p.origenLead).includes('sitio')
    ).length,
    otros: 0,
  };
  porFuente.otros = Math.max(0, pacientes.length - (porFuente.whatsapp + porFuente.referido + porFuente.web));
  
  // Nuevos vs recurrentes en el mes
  const nuevosMes = pacientes.filter(esReciente).length;
  const recurrentesMes = pacientes.filter(p => 
    p.ultimaConsulta && new Date(p.ultimaConsulta) >= hace30Dias
  ).length;
  
  const metricas = {
    tasaRetencion,
    pacientesFrecuentes,
    conDatosCompletos,
    sinEmail,
    enRiesgo,
    porFuente,
    nuevosMes,
    recurrentesMes,
  }

  return {
    pacientes,
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate() },
    totalCount: data?.count || 0,
    stats,
    metricas,
  }
}
