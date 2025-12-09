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
  ultimaSemana: number;
  ultimoMes: number;
  // Nuevas métricas de clasificación
  prospectos: number;
  pacientesExistentes: number;
  reenganche: number;
  referidos: number;
  prioridadAlta: number;
  pendientesSeguimiento: number;
  scorePromedio: number;
}

const DEFAULT_STATS: LeadsStats = {
  total: 0, nuevos: 0, interesados: 0, enSeguimiento: 0, 
  convertidos: 0, descartados: 0, ultimaSemana: 0, ultimoMes: 0,
  prospectos: 0, pacientesExistentes: 0, reenganche: 0, referidos: 0,
  prioridadAlta: 0, pendientesSeguimiento: 0, scorePromedio: 0,
};

const fetchStats = async (): Promise<LeadsStats> => {
  const { data, error } = await supabase.rpc('get_leads_stats' as never);
  if (error) return DEFAULT_STATS;
  
  // Mapear campos de la RPC a la interfaz del hook
  const s = data as Record<string, number>;
  return {
    total: s.total || 0,
    nuevos: s.nuevo || 0,
    interesados: s.interesado || 0,
    enSeguimiento: (s.contactado || 0) + (s.calificado || 0),
    convertidos: s.convertido || 0,
    descartados: s.descartado || 0,
    ultimaSemana: 0, // No calculado en RPC actual
    ultimoMes: 0,    // No calculado en RPC actual
    prospectos: s.activos || 0,
    pacientesExistentes: 0,
    reenganche: 0,
    referidos: 0,
    prioridadAlta: s.calientes || 0,
    pendientesSeguimiento: s.inactivos || 0,
    scorePromedio: 0,
  };
};

const fetchLeadsPaginated = async (
  page: number,
  pageSize: number,
  search: string,
  estado: string
): Promise<{ data: Lead[]; totalCount: number }> => {
  const offset = (page - 1) * pageSize;
  
  const { data, error } = await supabase.rpc('search_leads' as never, {
    p_search: search || null,
    p_estado: estado || null,
    p_limit: pageSize,
    p_offset: offset,
  } as never);
  
  if (error) throw error;
  
  const results = data as unknown as Array<{ data: Record<string, unknown>[]; total_count: number }>;
  const result = results?.[0];
  
  if (!result) return { data: [], totalCount: 0 };
  
  // IMPORTANTE: Filtrar leads que ya son pacientes (tienen paciente_id)
  // Si alguien ya es paciente, NO es lead
  const leadsActivos = (result.data || []).filter(
    (l: Record<string, unknown>) => !l.pacienteId
  );
  
  const leads: Lead[] = leadsActivos.map((l: Record<string, unknown>) => {
    const telefono = l.telefonoWhatsapp as string;
    const nombreCompleto = l.nombreCompleto as string | null;
    const ultimaInteraccion = l.ultimaInteraccion as string | null;
    const totalInteracciones = (l.totalInteracciones as number) || 0;
    const tipoContacto = (l.tipoContacto as string) || 'prospecto';
    const proximoSeguimiento = l.proximoSeguimiento as string | null;
    const estadoLead = ((l.estado as string) || 'Nuevo') as Lead['estado'];
    
    // Calcular días desde última interacción
    const diasDesdeUltimaInteraccion = ultimaInteraccion 
      ? Math.floor((Date.now() - new Date(ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    // Lead inactivo si no hay interacción en más de 7 días
    const esInactivo = diasDesdeUltimaInteraccion > 7;
    
    // Lead caliente si tiene interacción reciente (<2 días) y muchos mensajes (>5)
    const esCaliente = diasDesdeUltimaInteraccion <= 2 && totalInteracciones >= 5;
    
    // Requiere seguimiento si la fecha ya pasó
    const requiereSeguimiento = proximoSeguimiento 
      ? new Date(proximoSeguimiento).getTime() <= Date.now()
      : false;
    
    // Score y prioridad vienen de la BD (si existen)
    const scoreDB = (l.score as number) || 0;
    const prioridadDB = ((l.prioridad as string) || 'media') as Lead['prioridad'];
    
    return {
      id: l.id as string,
      pacienteId: null, // Ya filtramos los que tienen pacienteId
      telefono,
      nombreCompleto,
      estado: estadoLead,
      fuente: ((l.fuenteLead as string) || 'Otro') as Lead['fuente'],
      canalMarketing: l.canalMarketing as string | null,
      notas: null,
      sessionId: null,
      primerContacto: l.createdAt as string | null,
      ultimaInteraccion,
      fechaConversion: null,
      totalInteracciones,
      createdAt: l.createdAt as string | null,
      updatedAt: null,
      // Campos de clasificación (de BD)
      tipoContacto: tipoContacto as Lead['tipoContacto'],
      motivoContacto: ((l.motivoContacto as string) || 'consulta_nueva') as Lead['motivoContacto'],
      prioridad: prioridadDB,
      score: scoreDB,
      etiquetas: (l.etiquetas as string[]) || [],
      ultimoSeguimiento: l.ultimoSeguimiento as string | null,
      proximoSeguimiento,
      asignadoA: l.asignadoA as string | null,
      notasSeguimiento: l.notasSeguimiento as string | null,
      // Campos calculados
      nombre: nombreCompleto || telefono,
      temperatura: esCaliente ? 'Caliente' : (esInactivo ? 'Frio' : 'Tibio') as Lead['temperatura'],
      diasDesdeContacto: 0,
      diasDesdeUltimaInteraccion,
      esCliente: false, // Ya filtramos los que son clientes
      esPacienteExistente: tipoContacto === 'paciente_existente',
      esCaliente,
      esInactivo,
      requiereSeguimiento,
    };
  });
  
  // Ajustar totalCount porque filtramos los que ya son pacientes
  const totalFiltrado = leads.length < (result.data || []).length 
    ? Math.max(0, Number(result.total_count) - ((result.data || []).length - leads.length))
    : Number(result.total_count) || 0;
  
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
