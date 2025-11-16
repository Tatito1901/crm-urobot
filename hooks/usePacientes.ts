/**
 * ============================================================
 * HOOK: usePacientes
 * ============================================================
 * Hook optimizado con SWR para pacientes
 * ✅ SWR: Caché, deduplicación y revalidación automática
 */

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import {
  DEFAULT_PACIENTE_ESTADO,
  type Paciente,
  isPacienteEstado,
} from '@/types/pacientes'
import type { Tables } from '@/types/database'

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

type PacienteRow = Tables<'pacientes'>

/**
 * Mapea una fila de la tabla 'pacientes' al tipo Paciente con métricas
 * Valida todos los campos para consistencia con DB
 */
const mapPaciente = (row: PacienteRow): Paciente => {
  // Validar estado (debe coincidir con DB)
  const estado = isPacienteEstado(row.estado) ? row.estado : DEFAULT_PACIENTE_ESTADO
  const now = new Date()
  
  // Calcular días desde última consulta
  const ultimaConsulta = row.ultima_consulta ? new Date(row.ultima_consulta) : null
  const diasDesdeUltimaConsulta = ultimaConsulta
    ? Math.floor((now.getTime() - ultimaConsulta.getTime()) / (1000 * 60 * 60 * 24))
    : null
  
  // Calcular días desde registro
  const fechaRegistro = row.fecha_registro ? new Date(row.fecha_registro) : row.created_at ? new Date(row.created_at) : null
  const diasDesdeRegistro = fechaRegistro
    ? Math.floor((now.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24))
    : null
  
  // Indicadores
  const totalConsultas = typeof row.total_consultas === 'number' ? row.total_consultas : 0
  const esReciente = diasDesdeRegistro !== null && diasDesdeRegistro <= 30
  const requiereAtencion = estado === 'Activo' && diasDesdeUltimaConsulta !== null && diasDesdeUltimaConsulta >= 90

  return {
    // Campos base (validados contra schema DB)
    id: row.id, // uuid PK
    pacienteId: row.paciente_id, // string UNIQUE
    nombre: row.nombre_completo, // string NOT NULL
    telefono: row.telefono, // string NOT NULL
    email: row.email, // string | null
    
    // Métricas de consultas
    totalConsultas,
    ultimaConsulta: row.ultima_consulta, // timestamptz | null
    diasDesdeUltimaConsulta,
    
    // Estado y metadata
    estado, // validado con isPacienteEstado()
    fechaRegistro: row.fecha_registro, // timestamptz | null
    fuenteOriginal: row.fuente_original ?? 'WhatsApp', // string DEFAULT 'WhatsApp'
    notas: row.notas, // string | null
    
    // Indicadores visuales
    esReciente,
    requiereAtencion,
  }
}

/**
 * Fetcher para pacientes
 * Campos explícitos según schema de Supabase
 */
const fetchPacientes = async (): Promise<{ pacientes: Paciente[], count: number }> => {
  const { data, error, count } = await supabase
    .from('pacientes')
    .select(`
      id,
      paciente_id,
      nombre_completo,
      telefono,
      email,
      fecha_registro,
      fuente_original,
      ultima_consulta,
      total_consultas,
      estado,
      notas,
      created_at,
      updated_at
    `, { count: 'exact' })
    .order('ultima_consulta', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('❌ Error fetching pacientes:', error)
    throw error
  }

  // Validar que data existe
  if (!data) {
    console.warn('⚠️ No data returned from pacientes query')
    return { pacientes: [], count: 0 }
  }

  // Mapear y validar cada paciente
  const pacientes = data.map(mapPaciente)
  return { pacientes, count: count || pacientes.length }
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
  const { data, error, isLoading, mutate } = useSWR(
    'pacientes',
    fetchPacientes,
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

  const pacientes = data?.pacientes || []
  
  // Calcular estadísticas básicas
  const stats = {
    total: pacientes.length,
    activos: pacientes.filter(p => p.estado === 'Activo').length,
    inactivos: pacientes.filter(p => p.estado === 'Inactivo').length,
    recientes: pacientes.filter(p => p.esReciente).length,
    requierenAtencion: pacientes.filter(p => p.requiereAtencion).length,
    conConsultas: pacientes.filter(p => p.totalConsultas > 0).length,
    sinConsultas: pacientes.filter(p => p.totalConsultas === 0).length,
  }
  
  // Calcular métricas avanzadas
  const tasaRetencion = pacientes.length > 0
    ? Math.round((pacientes.filter(p => p.totalConsultas >= 2).length / pacientes.length) * 100)
    : 0
  
  const pacientesFrecuentes = pacientes.filter(p => p.totalConsultas >= 5).length
  
  const conDatosCompletos = pacientes.filter(p => 
    p.email && p.email.trim() !== '' && p.telefono && p.telefono.trim() !== ''
  ).length
  
  const sinEmail = pacientes.filter(p => !p.email || p.email.trim() === '').length
  
  // Pacientes en riesgo: activos sin consulta en 180+ días
  const enRiesgo = pacientes.filter(p => 
    p.estado === 'Activo' && 
    p.diasDesdeUltimaConsulta !== null && 
    p.diasDesdeUltimaConsulta >= 180
  ).length
  
  // Distribución por fuente
  const porFuente = {
    whatsapp: pacientes.filter(p => 
      p.fuenteOriginal?.toLowerCase().includes('whatsapp')
    ).length,
    referido: pacientes.filter(p => 
      p.fuenteOriginal?.toLowerCase().includes('referido') ||
      p.fuenteOriginal?.toLowerCase().includes('recomendación')
    ).length,
    web: pacientes.filter(p => 
      p.fuenteOriginal?.toLowerCase().includes('web') ||
      p.fuenteOriginal?.toLowerCase().includes('sitio')
    ).length,
    otros: 0 // Se calcula después
  }
  porFuente.otros = pacientes.length - (porFuente.whatsapp + porFuente.referido + porFuente.web)
  
  // Nuevos vs recurrentes en el mes
  const nuevosMes = pacientes.filter(p => p.esReciente).length
  const recurrentesMes = pacientes.filter(p => 
    p.diasDesdeUltimaConsulta !== null && 
    p.diasDesdeUltimaConsulta <= 30
  ).length
  
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
