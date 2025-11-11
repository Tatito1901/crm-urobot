/**
 * ============================================================
 * HOOK BASE OPTIMIZADO - useOptimizedQuery
 * ============================================================
 * Hook genérico con paginación, cache, retry y mejor performance
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient();

// ===== TIPOS =====
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface UseOptimizedQueryOptions<T> {
  tableName: string;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filter?: Record<string, unknown>;
  pagination?: PaginationOptions;
  enableRealtime?: boolean;
  cacheTime?: number; // ms (default: 30000 = 30s)
  retryAttempts?: number; // default: 3
}

export interface UseOptimizedQueryReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  refetch: (options?: { silent?: boolean }) => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

// ===== CACHE SIMPLE =====
interface CacheEntry<T> {
  data: T[];
  count: number;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(options: UseOptimizedQueryOptions<unknown>): string {
  return JSON.stringify({
    table: options.tableName,
    select: options.select,
    orderBy: options.orderBy,
    filter: options.filter,
    page: options.pagination?.page,
    pageSize: options.pagination?.pageSize,
  });
}

function getFromCache<T>(key: string, cacheTime: number): CacheEntry<T> | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > cacheTime;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry;
}

function setCache<T>(key: string, data: T[], count: number): void {
  cache.set(key, { data, count, timestamp: Date.now() });
}

// ===== HOOK =====
export function useOptimizedQuery<T>(
  options: UseOptimizedQueryOptions<T>
): UseOptimizedQueryReturn<T> {
  const {
    tableName,
    select = '*',
    orderBy,
    filter,
    pagination,
    enableRealtime = true,
    cacheTime = 30000,
    retryAttempts = 3,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(pagination?.page ?? 1);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (opts: { silent?: boolean; attempt?: number } = {}) => {
      const { silent = false, attempt = 1 } = opts;

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (!silent) {
          setLoading(true);
        }
        setError(null);

        // Verificar cache
        const cacheKey = getCacheKey({ ...options, pagination: { page: currentPage, pageSize: pagination?.pageSize ?? 50 } });
        const cached = getFromCache<T>(cacheKey, cacheTime);

        if (cached && attempt === 1) {
          setData(cached.data);
          setTotalCount(cached.count);
          if (!silent) setLoading(false);
          return;
        }

        // Construir query
        let query = supabase
          .from(tableName)
          .select(select, { count: 'exact' });

        // Aplicar filtros
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value as string | number | boolean);
            }
          });
        }

        // Aplicar ordenamiento
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
        }

        // Aplicar paginación
        if (pagination) {
          const from = (currentPage - 1) * pagination.pageSize;
          const to = from + pagination.pageSize - 1;
          query = query.range(from, to);
        }

        const { data: fetchedData, error: fetchError, count } = await query;

        if (fetchError) throw fetchError;

        const resultData = (fetchedData as T[]) ?? [];
        const resultCount = count ?? resultData.length;

        // Guardar en cache
        setCache(cacheKey, resultData, resultCount);

        setData(resultData);
        setTotalCount(resultCount);
      } catch (err: unknown) {
        // Retry logic
        if (attempt < retryAttempts && err instanceof Error && err.name !== 'AbortError') {
          console.warn(`Retry attempt ${attempt}/${retryAttempts} for ${tableName}`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          return fetchData({ silent, attempt: attempt + 1 });
        }

        console.error(`Error fetching ${tableName}:`, err);
        setError(err as Error);
      } finally {
        if (!silent) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [tableName, select, orderBy, filter, currentPage, pagination, cacheTime, retryAttempts, options]
  );

  // Effect: Fetch inicial y real-time
  useEffect(() => {
    fetchData();

    if (!enableRealtime) return;

    // Configurar real-time
    const channel = supabase
      .channel(`public:${tableName}:${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData({ silent: true });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, tableName, enableRealtime]);

  // Paginación helpers
  const totalPages = pagination ? Math.ceil(totalCount / pagination.pageSize) : 1;
  const hasMore = pagination ? currentPage < totalPages : false;

  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchData,
    nextPage,
    prevPage,
    currentPage,
    totalPages,
    hasMore,
  };
}
