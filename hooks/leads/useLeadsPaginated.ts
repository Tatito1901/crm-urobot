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
import type { Lead, LeadSignals, LeadScores } from '@/types/leads';
import { LEAD_ESTADO_DISPLAY, LEAD_ESTADOS_ACTIVOS } from '@/types/leads';

const supabase = createClient();

interface LeadsStats {
  total: number;
  nuevos: number;
  interactuando: number;
  contactados: number;
  citaPropuesta: number;
  enSeguimiento: number;
  citaAgendada: number;
  convertidos: number;
  perdidos: number;
  calientes: number;
  inactivos: number;
}

const DEFAULT_STATS: LeadsStats = {
  total: 0, nuevos: 0, interactuando: 0, contactados: 0, citaPropuesta: 0,
  enSeguimiento: 0, citaAgendada: 0, convertidos: 0, perdidos: 0, calientes: 0, inactivos: 0,
};

const fetchStats = async (): Promise<LeadsStats> => {
  const { data, error } = await supabase.rpc('get_leads_stats_optimized' as never);
  if (error) return DEFAULT_STATS;
  
  // Mapear campos de la RPC real (get_leads_stats_optimized) — sincronizado con BD
  const s = data as Record<string, number>;
  return {
    total: s.total || 0,
    nuevos: s.nuevos || 0,
    interactuando: s.interactuando || 0,
    contactados: s.contactados || 0,
    citaPropuesta: s.cita_propuesta || 0,
    enSeguimiento: s.en_seguimiento || 0,
    citaAgendada: s.cita_agendada || 0,
    convertidos: s.convertidos || 0,
    perdidos: s.perdidos || 0,
    calientes: s.calientes || 0,
    inactivos: 0, // No disponible en esta RPC
  };
};

function parseSignals(raw: unknown): LeadSignals | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  if (!s.perfil_paciente && !s.prediccion_conversion && !s.nivel_compromiso) return null;
  return {
    perfil_paciente: (s.perfil_paciente as string) || null,
    emociones: Array.isArray(s.emociones) ? s.emociones : [],
    nivel_compromiso: typeof s.nivel_compromiso === 'number' ? s.nivel_compromiso : null,
    prediccion_conversion: (s.prediccion_conversion as string) || null,
    incentivo_sugerido: (s.incentivo_sugerido as string) || null,
    barrera_principal: (s.barrera_principal as string) || null,
    pregunto_precio: s.pregunto_precio === true,
  };
}

function parseScores(raw: unknown): LeadScores | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  if (s.clinical === undefined && s.intent === undefined) return null;
  return {
    clinical: Number(s.clinical) || 0,
    intent: Number(s.intent) || 0,
    bant: Number(s.bant) || 0,
    engagement: Number(s.engagement) || 0,
  };
}

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
    const esCaliente = temperatura === 'caliente' || temperatura === 'muy_caliente' || temperatura === 'urgente';
    
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
      subestado: (l.subestado as Lead['subestado']) || null,
      accionRecomendada: (l.accion_recomendada as string) || null,
      fechaSiguienteAccion,
      createdAt: (l.created_at as string) || '',
      updatedAt: (l.updated_at as string) || '',
      // Behavioral signals
      signals: parseSignals(l.signals),
      scores: parseScores(l.scores),
      // Meta Ads attribution
      campanaId: (l.campana_id as string) || null,
      campanaHeadline: (l.campana_headline as string) || null,
      campanaUrl: (l.campana_url as string) || null,
      ctwaClid: (l.ctwa_clid as string) || null,
      esMetaAds: !!(l.campana_id || l.ctwa_clid),
      // Calculados
      nombreDisplay: nombre,
      diasDesdeContacto: 0,
      diasDesdeUltimaInteraccion,
      estadoDisplay: LEAD_ESTADO_DISPLAY[estadoLead] || estadoLead,
      esCliente: false,
      esCaliente,
      esInactivo,
      esEnPipeline: (LEAD_ESTADOS_ACTIVOS as readonly string[]).includes(estadoLead),
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
