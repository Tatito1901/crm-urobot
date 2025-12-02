/**
 * ============================================================
 * HOOK: usePaginatedData
 * ============================================================
 * Hook genérico para paginación optimizada con +3000 registros
 * 
 * CARACTERÍSTICAS:
 * - Paginación del lado del servidor
 * - Búsqueda con debounce
 * - Cache por página
 * - Prefetch de página siguiente
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config';

interface PaginationConfig {
  /** Número de items por página (default: 50) */
  pageSize?: number;
  /** Debounce en ms para búsqueda (default: 300) */
  searchDebounce?: number;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  isLoading: boolean;
  isSearching: boolean;
  error: Error | null;
  
  // Navegación
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Búsqueda
  search: string;
  setSearch: (query: string) => void;
  
  // Filtros
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  
  // Refresh
  refresh: () => Promise<void>;
  
  // Helpers
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Hook genérico para datos paginados
 * 
 * @example
 * const { data, isLoading, search, setSearch, goToPage } = usePaginatedData<Paciente>(
 *   'pacientes',
 *   async (page, pageSize, search, filters) => {
 *     const { data } = await supabase.rpc('search_pacientes', { ... });
 *     return { data, totalCount };
 *   }
 * );
 */
export function usePaginatedData<T>(
  key: string,
  fetcher: (
    page: number,
    pageSize: number,
    search: string,
    filters: Record<string, string>
  ) => Promise<{ data: T[]; totalCount: number }>,
  config: PaginationConfig = {}
): PaginatedResult<T> {
  const { pageSize = 50, searchDebounce = 300 } = config;
  
  // Estado local
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearchInternal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce de búsqueda
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset a página 1 al buscar
      setIsSearching(false);
    }, searchDebounce);
    
    return () => clearTimeout(timer);
  }, [search, searchDebounce]);
  
  // Clave SWR única por página/búsqueda/filtros
  const swrKey = useMemo(() => {
    const filterStr = JSON.stringify(filters);
    return `${key}-page${currentPage}-size${pageSize}-q${debouncedSearch}-f${filterStr}`;
  }, [key, currentPage, pageSize, debouncedSearch, filters]);
  
  // Fetcher wrapper
  const fetchPage = useCallback(async () => {
    return fetcher(currentPage, pageSize, debouncedSearch, filters);
  }, [fetcher, currentPage, pageSize, debouncedSearch, filters]);
  
  // SWR con cache
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    fetchPage,
    {
      ...SWR_CONFIG_STANDARD,
      keepPreviousData: true, // Mantener datos mientras carga
    }
  );
  
  // Cálculos
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
  
  // Filtros
  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);
  
  // Refresh
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);
  
  return {
    data: data?.data ?? [],
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    isLoading,
    isSearching,
    error: error ?? null,
    
    goToPage,
    nextPage,
    prevPage,
    
    search,
    setSearch,
    
    filters,
    setFilter,
    clearFilters,
    
    refresh,
    
    hasNextPage,
    hasPrevPage,
  };
}

/**
 * Componente de paginación reutilizable
 */
export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

// Exportar tipos para uso externo
export type { PaginatedResult, PaginationConfig };
