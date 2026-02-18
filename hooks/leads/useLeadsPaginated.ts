/**
 * ============================================================
 * HOOK: useLeadsPaginated
 * ============================================================
 * Hook OPTIMIZADO para +3000 leads
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_STANDARD, SWR_CONFIG_DASHBOARD, CACHE_KEYS } from '@/lib/swr-config';
import type { Lead } from '@/types/leads';

const supabase = createClient();

interface LeadsStats {
  total: number;
  nuevos: number;
  interesados: number;
  enSeguimiento: number;
  convertidos: number;
  descartados: number;
  escalados: number;
  calientes: number;
  inactivos: number;
}

const DEFAULT_STATS: LeadsStats = {
  total: 0, nuevos: 0, interesados: 0, enSeguimiento: 0, 
  convertidos: 0, descartados: 0, escalados: 0, calientes: 0, inactivos: 0,
};

const fetchStats = async (): Promise<LeadsStats> => {
  const { data, error } = await supabase.rpc('get_leads_stats_optimized' as never);
  if (error) return DEFAULT_STATS;
  
  // Mapear campos de la RPC real (get_leads_stats_optimized) a la interfaz del hook
  const s = data as Record<string, number>;
  return {
    total: s.total || 0,
    nuevos: s.nuevos || 0,
    interesados: s.interactuando || 0,
    enSeguimiento: (s.cita_propuesta || 0),
    convertidos: s.convertidos || 0,
    descartados: s.perdidos || 0,
    escalados: s.cita_agendada || 0,
    calientes: s.calientes || 0,
    inactivos: 0, // No disponible en esta RPC
  };
};

const fetchLeadsPaginated = async (
  page: number,
  pageSize: number,
  search: string,
  estado: string
): Promise<{ data: Lead[]; totalCount: number }> => {
  const { data, error } = await supabase.rpc('search_leads_optimized' as never, {
    p_search: search || null,
    p_estado: estado || null,
    p_limit: pageSize,
    p_page: page,
  } as never);
  
  if (error) throw error;
  
  // search_leads_optimized returns jsonb: {data: [...], total: N, page: N, limit: N}
  const result = data as { data: Record<string, unknown>[]; total: number } | null;
  
  if (!result) return { data: [], totalCount: 0 };
  
  // Filtrar leads ya convertidos
  const leadsActivos = (result.data || []).filter(
    (l: Record<string, unknown>) => !l.convertido_a_paciente_id
  );
  
  const totalFromRPC = Number(result.total) || 0;
  
  const leads: Lead[] = leadsActivos.map((l: Record<string, unknown>) => {
    const telefono = (l.telefono as string) || '';
    const nombre = (l.nombre as string) || telefono;
    const ultimaInteraccion = l.ultima_interaccion as string | null;
    const totalMensajes = (l.total_mensajes as number) || 0;
    const temperatura = ((l.temperatura as string) || 'frio') as Lead['temperatura'];
    const fechaSiguienteAccion = l.fecha_siguiente_accion as string | null;
    const estadoLead = ((l.estado as string) || 'nuevo') as Lead['estado'];
    
    const diasDesdeUltimaInteraccion = ultimaInteraccion 
      ? Math.floor((Date.now() - new Date(ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const esInactivo = diasDesdeUltimaInteraccion > 7;
    const esCaliente = temperatura === 'caliente' || temperatura === 'muy_caliente';
    
    const requiereSeguimiento = fechaSiguienteAccion 
      ? new Date(fechaSiguienteAccion).getTime() <= Date.now()
      : false;
    
    return {
      id: l.id as string,
      nombre,
      telefono,
      estado: estadoLead,
      fuente: ((l.fuente as string) || 'Otro') as Lead['fuente'],
      canal: (l.canal as string) || null,
      temperatura,
      notas: (l.notas as string) || null,
      email: (l.email as string) || null,
      convertidoAPacienteId: null,
      totalMensajes,
      ultimaInteraccion,
      scoreTotal: (l.score_total as number) || 0,
      calificacion: (l.calificacion as string) || null,
      etapaFunnel: (l.etapa_funnel as string) || null,
      subestado: (l.subestado as string) || null,
      accionRecomendada: (l.accion_recomendada as string) || null,
      fechaSiguienteAccion,
      createdAt: (l.created_at as string) || '',
      updatedAt: (l.updated_at as string) || '',
      // Calculados
      nombreDisplay: nombre,
      diasDesdeContacto: 0,
      diasDesdeUltimaInteraccion,
      esCliente: false,
      esCaliente,
      esInactivo,
      requiereSeguimiento,
    };
  });
  
  const totalFiltrado = leads.length < (result.data || []).length 
    ? Math.max(0, totalFromRPC - ((result.data || []).length - leads.length))
    : totalFromRPC;
  
  return { data: leads, totalCount: totalFiltrado };
};

export function useLeadsPaginated(config: { pageSize?: number; searchDebounce?: number } = {}) {
  const { pageSize = 6, searchDebounce = 400 } = config; // Debounce más largo para menos llamadas
  
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearchInternal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce optimizado con ref para evitar memory leaks
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    
    if (search !== debouncedSearch) {
      setIsSearching(true);
      searchTimerRef.current = setTimeout(() => {
        setDebouncedSearch(search);
        setCurrentPage(1);
        setIsSearching(false);
      }, searchDebounce);
    }
    
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search, searchDebounce, debouncedSearch]);
  
  // Reset página al cambiar filtro (solo si realmente cambió)
  const prevEstadoRef = useRef(estadoFilter);
  useEffect(() => {
    if (prevEstadoRef.current !== estadoFilter) {
      prevEstadoRef.current = estadoFilter;
      setCurrentPage(1);
    }
  }, [estadoFilter]);
  
  // Stats con staleTime largo (cambian poco)
  const { data: stats } = useSWR<LeadsStats>(
    `${CACHE_KEYS.LEADS}-stats`,
    fetchStats,
    { ...SWR_CONFIG_DASHBOARD, dedupingInterval: 60 * 60 * 1000 } // 1 hora
  );
  
  // Key estable para SWR
  const swrKey = useMemo(
    () => `${CACHE_KEYS.LEADS}-v2-p${currentPage}-s${pageSize}-q${debouncedSearch}-e${estadoFilter}`,
    [currentPage, pageSize, debouncedSearch, estadoFilter]
  );
  
  // Fetcher memoizado
  const fetcher = useCallback(
    () => fetchLeadsPaginated(currentPage, pageSize, debouncedSearch, estadoFilter),
    [currentPage, pageSize, debouncedSearch, estadoFilter]
  );
  
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    ...SWR_CONFIG_STANDARD,
    keepPreviousData: true,
    revalidateOnMount: true, // Solo al montar
  });
  
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  return {
    leads: data?.data ?? [],
    stats: stats ?? DEFAULT_STATS,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage: useCallback((p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages))), [totalPages]),
    nextPage: useCallback(() => { if (currentPage < totalPages) setCurrentPage(p => p + 1); }, [currentPage, totalPages]),
    prevPage: useCallback(() => { if (currentPage > 1) setCurrentPage(p => p - 1); }, [currentPage]),
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    search,
    setSearch: useCallback((q: string) => setSearchInternal(q), []),
    estadoFilter,
    setEstadoFilter,
    isLoading,
    isSearching,
    error: error ?? null,
    refresh: useCallback(async () => { await mutate(); }, [mutate]),
  };
}
