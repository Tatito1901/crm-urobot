import { useEffect } from 'react'
import useSWR from 'swr'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Recordatorio = Database['public']['Tables']['recordatorios']['Row'] & {
  consultas?: Database['public']['Tables']['consultas']['Row'] & {
    pacientes?: Database['public']['Tables']['pacientes']['Row']
  }
}

// ✅ OPTIMIZACIÓN: Usar singleton del cliente (fuera del hook)
const supabase = getSupabaseClient()

interface UseRecordatoriosOptions {
  estado?: 'pendiente' | 'enviado' | 'fallido' | 'cancelado'
  soloVencidos?: boolean
  limite?: number
  polling?: boolean
}

export function useRecordatoriosOptimized(options: UseRecordatoriosOptions = {}) {
  
  const fetcher = async () => {
    const now = new Date()
    const proximaHora = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    
    let query = supabase
      .from('recordatorios')
      .select(`
        *,
        consultas!inner (
          id,
          consulta_id,
          fecha_hora_utc,
          fecha_consulta,
          hora_consulta,
          sede,
          estado_cita,
          confirmado_paciente,
          pacientes!inner (
            id,
            nombre_completo,
            telefono,
            telefono_mx10,
            email
          )
        )
      `)
      .order('programado_para', { ascending: true })
    
    // Aplicar filtros
    if (options.estado) {
      query = query.eq('estado', options.estado)
    } else {
      // Por defecto, solo pendientes
      query = query.eq('estado', 'pendiente')
    }
    
    if (options.soloVencidos) {
      query = query.lte('programado_para', now.toISOString())
    } else {
      // Por defecto, pendientes en las próximas 24 horas
      query = query.lte('programado_para', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString())
    }
    
    if (options.limite) {
      query = query.limit(options.limite)
    } else {
      query = query.limit(50) // Límite por defecto
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Enriquecer con información adicional
    const enrichedData = (data || []).map(rec => {
      const programadoPara = new Date(rec.programado_para)
      const ahora = new Date()
      const horasHastaVencimiento = (programadoPara.getTime() - ahora.getTime()) / (1000 * 60 * 60)
      
      return {
        ...rec,
        is_due: programadoPara <= ahora,
        hours_until_due: horasHastaVencimiento,
        tiempo_restante: horasHastaVencimiento > 0 
          ? `En ${Math.floor(horasHastaVencimiento)}h ${Math.floor((horasHastaVencimiento % 1) * 60)}m`
          : `Vencido hace ${Math.floor(Math.abs(horasHastaVencimiento))}h`
      }
    })
    
    return enrichedData
  }
  
  // Configurar polling (si está habilitado)
  const { data, error, isLoading, mutate } = useSWR(
    `recordatorios-${options.estado}-${options.soloVencidos}`,
    fetcher,
    {
      refreshInterval: options.polling ? 60000 : 0, // Polling cada minuto si está habilitado
      revalidateOnFocus: true,
      dedupingInterval: 30000, // No duplicar llamadas en 30s
    }
  )
  
  // Estadísticas
  const stats = {
    total: data?.length || 0,
    vencidos: data?.filter(r => r.is_due).length || 0,
    proximaHora: data?.filter(r => r.hours_until_due > 0 && r.hours_until_due <= 1).length || 0,
    proximas3Horas: data?.filter(r => r.hours_until_due > 0 && r.hours_until_due <= 3).length || 0
  }
  
  // Función para marcar como enviado
  const marcarComoEnviado = async (recordatorioId: string, mensaje?: string) => {
    const { error } = await supabase
      .from('recordatorios')
      .update({
        estado: 'enviado',
        enviado_en: new Date().toISOString(),
        mensaje_enviado: mensaje,
        entregado: true
      })
      .eq('id', recordatorioId)
    
    if (!error) {
      await mutate() // Refrescar datos
    }
    
    return { error }
  }
  
  // Función para marcar como fallido
  const marcarComoFallido = async (recordatorioId: string, error: string) => {
    const { error: updateError } = await supabase
      .from('recordatorios')
      .update({
        estado: 'fallido',
        intentos: data?.find(r => r.id === recordatorioId)?.intentos || 0 + 1,
        ultimo_error: error
      })
      .eq('id', recordatorioId)
    
    if (!updateError) {
      await mutate() // Refrescar datos
    }
    
    return { error: updateError }
  }
  
  return {
    recordatorios: data || [],
    stats,
    loading: isLoading,
    error,
    refresh: mutate,
    marcarComoEnviado,
    marcarComoFallido
  }
}
