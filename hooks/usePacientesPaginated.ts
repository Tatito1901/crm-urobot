/**
 * ============================================================
 * HOOK: usePacientesPaginated
 * ============================================================
 * Hook OPTIMIZADO para +3000 pacientes
 * 
 * MEJORAS vs usePacientes:
 * - Paginación del servidor (no carga todos)
 * - Estadísticas calculadas en BD (no en frontend)
 * - Búsqueda con debounce
 * - Cache por página
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_STANDARD, SWR_CONFIG_DASHBOARD, CACHE_KEYS } from '@/lib/swr-config';
import type { Paciente } from '@/types/pacientes';

const supabase = createClient();

interface PacientesStats {
  total: number;
  activos: number;
  inactivos: number;
  recientes: number;
  conConsultas: number;
  sinConsultas: number;
}

interface UsePacientesPaginatedConfig {
  pageSize?: number;
  searchDebounce?: number;
}

interface UsePacientesPaginatedReturn {
  // Datos
  pacientes: Paciente[];
  stats: PacientesStats;
  
  // Paginación
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Búsqueda
  search: string;
  setSearch: (query: string) => void;
  
  // Filtros
  estadoFilter: string;
  setEstadoFilter: (estado: string) => void;
  
  // Estados
  isLoading: boolean;
  isSearching: boolean;
  error: Error | null;
  
  // Acciones
  refresh: () => Promise<void>;
}

/**
 * Fetcher de estadísticas (usa RPC del servidor)
 */
const fetchStats = async (): Promise<PacientesStats> => {
  // Usar rpc con cast para funciones nuevas no tipadas aún
  const { data, error } = await supabase.rpc('get_pacientes_stats' as never);
  
  if (error) {
    return { total: 0, activos: 0, inactivos: 0, recientes: 0, conConsultas: 0, sinConsultas: 0 };
  }
  
  return data as unknown as PacientesStats;
};

/**
 * Fetcher de pacientes paginados (usa RPC del servidor)
 */
const fetchPacientesPaginated = async (
  page: number,
  pageSize: number,
  search: string,
  estado: string
): Promise<{ data: Paciente[]; totalCount: number }> => {
  const offset = (page - 1) * pageSize;
  
  // Usar rpc con cast para funciones nuevas no tipadas aún
  const { data, error } = await supabase.rpc('search_pacientes' as never, {
    p_search: search || null,
    p_estado: estado || null,
    p_limit: pageSize,
    p_offset: offset,
  } as never);
  
  if (error) {
    throw error;
  }
  
  // El RPC retorna { data: JSON, total_count: number }
  const results = data as unknown as Array<{ data: Record<string, unknown>[]; total_count: number }>;
  const result = results?.[0];
  
  if (!result) {
    return { data: [], totalCount: 0 };
  }
  
  const pacientes: Paciente[] = (result.data || []).map((p: Record<string, unknown>) => {
    const nombreCompleto = p.nombreCompleto as string | null;
    const telefono = p.telefono as string;
    
    return {
      id: p.id as string,
      nombreCompleto,
      telefono,
      email: p.email as string | null,
      estado: ((p.estado as string) || 'Activo') as 'Activo' | 'Inactivo' | 'Alta',
      origenLead: p.origenLead as string | null,
      createdAt: p.createdAt as string,
      updatedAt: null,
      fechaNacimiento: null,
      notas: null,
      // Campos calculados/UI
      nombre: nombreCompleto || telefono, // Display name requerido
      totalConsultas: (p.totalConsultas as number) || 0,
      ultimaConsulta: p.ultimaConsulta as string | null,
    };
  });
  
  return {
    data: pacientes,
    totalCount: Number(result.total_count) || 0,
  };
};

/**
 * Hook principal para pacientes paginados
 */
export function usePacientesPaginated(
  config: UsePacientesPaginatedConfig = {}
): UsePacientesPaginatedReturn {
  const { pageSize = 50, searchDebounce = 150 } = config; // ✅ Debounce reducido a 150ms
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estado de búsqueda con debounce
  const [search, setSearchInternal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Estado de filtros
  const [estadoFilter, setEstadoFilter] = useState('');
  
  // Debounce de búsqueda
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
      setIsSearching(false);
    }, searchDebounce);
    
    return () => clearTimeout(timer);
  }, [search, searchDebounce]);
  
  // Reset página al cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [estadoFilter]);
  
  // SWR para estadísticas (cache largo, se calcula en servidor)
  const { data: stats } = useSWR<PacientesStats>(
    `${CACHE_KEYS.PACIENTES}-stats`,
    fetchStats,
    SWR_CONFIG_DASHBOARD
  );
  
  // Clave SWR única por página/búsqueda/filtro (v2: ordenado por ultima_consulta)
  const swrKey = useMemo(() => {
    return `${CACHE_KEYS.PACIENTES}-v2-p${currentPage}-s${pageSize}-q${debouncedSearch}-e${estadoFilter}`;
  }, [currentPage, pageSize, debouncedSearch, estadoFilter]);
  
  // SWR para datos paginados - ULTRA RÁPIDO
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => fetchPacientesPaginated(currentPage, pageSize, debouncedSearch, estadoFilter),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,   // No revalidar automáticamente
      dedupingInterval: 60000,    // Cache 1 minuto para evitar re-fetches
      refreshInterval: 0,
      keepPreviousData: true,     // Mostrar datos previos mientras carga
      shouldRetryOnError: false,  // No reintentar en error
    }
  );
  
  // ✅ PREFETCH: Cargar siguiente página en background
  const nextPageKey = `${CACHE_KEYS.PACIENTES}-v2-p${currentPage + 1}-s${pageSize}-q${debouncedSearch}-e${estadoFilter}`;
  useSWR(
    currentPage < Math.ceil((data?.totalCount ?? 0) / pageSize) ? nextPageKey : null,
    () => fetchPacientesPaginated(currentPage + 1, pageSize, debouncedSearch, estadoFilter),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  
  // Cálculos de paginación
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  // Navegación
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (hasNextPage) setCurrentPage(p => p + 1);
  }, [hasNextPage]);
  
  const prevPage = useCallback(() => {
    if (hasPrevPage) setCurrentPage(p => p - 1);
  }, [hasPrevPage]);
  
  // Búsqueda
  const setSearch = useCallback((query: string) => {
    setSearchInternal(query);
  }, []);
  
  // Refresh
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);
  
  return {
    pacientes: data?.data ?? [],
    stats: stats ?? { total: 0, activos: 0, inactivos: 0, recientes: 0, conConsultas: 0, sinConsultas: 0 },
    
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    
    search,
    setSearch,
    
    estadoFilter,
    setEstadoFilter,
    
    isLoading,
    isSearching,
    error: error ?? null,
    
    refresh,
  };
}
