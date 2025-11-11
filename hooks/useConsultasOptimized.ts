import { useEffect } from 'react'
import useSWR from 'swr'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Consulta = Database['public']['Tables']['consultas']['Row'] & {
  pacientes?: Database['public']['Tables']['pacientes']['Row']
  sedes?: Database['public']['Tables']['sedes']['Row']
}

// ✅ OPTIMIZACIÓN: Usar singleton del cliente (fuera del hook)
const supabase = getSupabaseClient()

interface UseConsultasOptions {
  startDate?: string
  endDate?: string
  sede?: string
  estado?: string
  realtime?: boolean
}

export function useConsultasOptimized(options: UseConsultasOptions = {}) {
  
  // Calcular fechas por defecto (mes actual)
  const today = new Date()
  const defaultStartDate = options.startDate || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const defaultEndDate = options.endDate || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
  
  // Fetcher function
  const fetcher = async (key: string) => {
    let query = supabase
      .from('consultas')
      .select(`
        *,
        pacientes!inner(
          id,
          nombre_completo,
          telefono,
          email
        ),
        sedes!inner(
          sede,
          display_name,
          direccion,
          telefono
        )
      `)
      .gte('fecha_consulta', defaultStartDate)
      .lte('fecha_consulta', defaultEndDate)
      .order('fecha_hora_utc', { ascending: true })
    
    // Aplicar filtros adicionales
    if (options.sede && options.sede !== 'all') {
      query = query.eq('sede', options.sede)
    }
    
    if (options.estado && options.estado !== 'all') {
      query = query.eq('estado_cita', options.estado)
    } else {
      // Por defecto, solo consultas activas
      query = query.in('estado_cita', ['Programada', 'Confirmada', 'Reagendada'])
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as Consulta[]
  }
  
  // SWR hook
  const { data, error, isLoading, mutate } = useSWR(
    `consultas-${defaultStartDate}-${defaultEndDate}-${options.sede}-${options.estado}`,
    fetcher,
    {
      refreshInterval: options.realtime ? 10000 : 0, // Polling cada 10s si realtime
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )
  
  // ✅ OPTIMIZACIÓN: Suscripción en tiempo real con canal consistente (opcional)
  useEffect(() => {
    if (!options.realtime) return

    const channel = supabase
      .channel('realtime:consultas')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultas'
      }, () => {
        // Refrescar datos cuando hay cambios
        mutate()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [options.realtime, mutate])
  
  // Agrupar consultas por fecha (útil para calendario)
  const consultasByDate = data?.reduce((acc, consulta) => {
    const fecha = consulta.fecha_consulta
    if (!acc[fecha]) acc[fecha] = []
    acc[fecha].push(consulta)
    return acc
  }, {} as Record<string, Consulta[]>) || {}
  
  // Consultas de hoy
  const todayStr = new Date().toISOString().split('T')[0]
  const consultasHoy = consultasByDate[todayStr] || []
  
  // Estadísticas
  const stats = {
    total: data?.length || 0,
    confirmadas: data?.filter(c => c.confirmado_paciente).length || 0,
    sinConfirmar: data?.filter(c => !c.confirmado_paciente && c.estado_cita === 'Programada').length || 0,
    hoy: consultasHoy.length
  }
  
  return {
    consultas: data || [],
    consultasByDate,
    consultasHoy,
    stats,
    loading: isLoading,
    error,
    refresh: mutate
  }
}
