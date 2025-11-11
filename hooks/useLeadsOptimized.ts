import useSWRInfinite from 'swr/infinite'
import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect } from 'react'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

const PAGE_SIZE = 20

interface UseLeadsOptions {
  estado?: string
  temperatura?: string
  fuente?: string
  searchQuery?: string
}

export function useLeadsOptimized(options: UseLeadsOptions = {}) {
  const supabase = createClient()
  
  // Función para obtener la key de SWR
  const getKey = (pageIndex: number, previousPageData: Lead[] | null) => {
    // Si no hay más datos, no hacer más requests
    if (previousPageData && previousPageData.length < PAGE_SIZE) return null
    
    // Crear key con parámetros
    return ['leads', pageIndex, options]
  }
  
  // Fetcher function
  const fetcher = async ([_, pageIndex, filters]: [string, number, UseLeadsOptions]) => {
    let query = supabase
      .from('leads')
      .select('*, pacientes(*)', { count: 'exact' })
      .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)
      .order('created_at', { ascending: false })
    
    // Aplicar filtros si existen
    if (filters.estado && filters.estado !== 'all') {
      query = query.eq('estado', filters.estado)
    }
    
    if (filters.temperatura && filters.temperatura !== 'all') {
      query = query.eq('temperatura', filters.temperatura)
    }
    
    if (filters.fuente && filters.fuente !== 'all') {
      query = query.eq('fuente_lead', filters.fuente)
    }
    
    if (filters.searchQuery) {
      query = query.or(`nombre_completo.ilike.%${filters.searchQuery}%,telefono_whatsapp.ilike.%${filters.searchQuery}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return { data: data || [], count: count || 0 }
  }
  
  // Hook de SWR Infinite
  const { data, error, size, setSize, isLoading, mutate, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
      revalidateOnFocus: false, // Para evitar llamadas innecesarias
      parallel: false,
    }
  )
  
  // Procesar datos
  const leads = data?.flatMap(page => page.data) || []
  const totalCount = data?.[0]?.count || 0
  const hasMore = leads.length < totalCount
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined'
  
  // Función para cargar más
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isValidating) {
      setSize(size + 1)
    }
  }, [size, isLoadingMore, hasMore, isValidating, setSize])
  
  // Suscripción a cambios en tiempo real (opcional)
  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'leads'
      }, () => {
        // Revalidar solo la primera página
        mutate()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'leads'
      }, () => {
        // Revalidar todo para reflejar cambios
        mutate()
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])
  
  return {
    leads,
    totalCount,
    hasMore,
    loadMore,
    loading: isLoading,
    loadingMore: isLoadingMore,
    error,
    refresh: mutate,
    pageSize: PAGE_SIZE
  }
}
