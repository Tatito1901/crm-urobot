/**
 * ============================================================
 * HOOK: useLeadsPaginated
 * ============================================================
 * Hook OPTIMIZADO para +3000 leads
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
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
}

const fetchStats = async (): Promise<LeadsStats> => {
  const { data, error } = await supabase.rpc('get_leads_stats' as never);
  if (error) return { total: 0, nuevos: 0, interesados: 0, enSeguimiento: 0, convertidos: 0, descartados: 0, ultimaSemana: 0, ultimoMes: 0 };
  // La función ahora retorna JSON directamente
  const stats = data as unknown as LeadsStats;
  return {
    total: stats.total || 0,
    nuevos: stats.nuevos || 0,
    interesados: stats.interesados || 0,
    enSeguimiento: stats.enSeguimiento || 0,
    convertidos: stats.convertidos || 0,
    descartados: stats.descartados || 0,
    ultimaSemana: stats.ultimaSemana || 0,
    ultimoMes: stats.ultimoMes || 0,
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
  
  const leads: Lead[] = (result.data || []).map((l: Record<string, unknown>) => {
    const telefono = l.telefonoWhatsapp as string;
    const nombreCompleto = l.nombreCompleto as string | null;
    const ultimaInteraccion = l.ultimaInteraccion as string | null;
    const totalInteracciones = (l.totalInteracciones as number) || 0;
    
    // Calcular días desde última interacción
    const diasDesdeUltimaInteraccion = ultimaInteraccion 
      ? Math.floor((Date.now() - new Date(ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    // Lead inactivo si no hay interacción en más de 7 días
    const esInactivo = diasDesdeUltimaInteraccion > 7;
    
    // Lead caliente si tiene interacción reciente (<2 días) y muchos mensajes (>5)
    const esCaliente = diasDesdeUltimaInteraccion <= 2 && totalInteracciones >= 5;
    
    return {
      id: l.id as string,
      pacienteId: l.pacienteId as string | null,
      telefono,
      nombreCompleto,
      estado: ((l.estado as string) || 'Nuevo') as Lead['estado'],
      fuente: ((l.fuenteLead as string) || 'Otro') as Lead['fuente'],
      canalMarketing: null,
      notas: null,
      sessionId: null,
      primerContacto: l.createdAt as string | null,
      ultimaInteraccion,
      fechaConversion: null,
      totalInteracciones,
      createdAt: l.createdAt as string | null,
      updatedAt: null,
      // Campos calculados
      nombre: nombreCompleto || telefono,
      temperatura: esCaliente ? 'Caliente' : (esInactivo ? 'Frío' : 'Tibio') as Lead['temperatura'],
      diasDesdeContacto: 0,
      diasDesdeUltimaInteraccion,
      esCliente: !!l.pacienteId,
      esCaliente,
      esInactivo,
    };
  });
  
  return { data: leads, totalCount: Number(result.total_count) || 0 };
};

export function useLeadsPaginated(config: { pageSize?: number; searchDebounce?: number } = {}) {
  const { pageSize = 50, searchDebounce = 300 } = config;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearchInternal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState('');
  
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
      setIsSearching(false);
    }, searchDebounce);
    return () => clearTimeout(timer);
  }, [search, searchDebounce]);
  
  useEffect(() => { setCurrentPage(1); }, [estadoFilter]);
  
  const { data: stats } = useSWR<LeadsStats>(`${CACHE_KEYS.LEADS}-stats`, fetchStats, SWR_CONFIG_DASHBOARD);
  
  // v2: incluye cálculo de días, esCaliente, esInactivo
  const swrKey = useMemo(() => `${CACHE_KEYS.LEADS}-v2-p${currentPage}-s${pageSize}-q${debouncedSearch}-e${estadoFilter}`, [currentPage, pageSize, debouncedSearch, estadoFilter]);
  
  const { data, error, isLoading, mutate } = useSWR(swrKey, () => fetchLeadsPaginated(currentPage, pageSize, debouncedSearch, estadoFilter), { ...SWR_CONFIG_STANDARD, keepPreviousData: true });
  
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  return {
    leads: data?.data ?? [],
    stats: stats ?? { total: 0, nuevos: 0, interesados: 0, enSeguimiento: 0, convertidos: 0, descartados: 0, ultimaSemana: 0, ultimoMes: 0 },
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
