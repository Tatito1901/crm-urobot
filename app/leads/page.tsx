'use client';

import { useMemo, useCallback } from 'react';
import { PageShell } from '@/app/components/crm/page-shell';
import { useLeadsPaginated } from '@/hooks/leads/useLeadsPaginated';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { PaginationControls } from '@/app/components/common/PaginationControls';
import { cards } from '@/app/lib/design-system';
import { MainTitle, QuickGuide } from '@/app/components/leads/LeadsTooltips';
import { LeadsMetrics } from './components/LeadsMetrics';
import { LeadsFilters } from './components/LeadsFilters';
import { LeadsTable } from './components/LeadsTable';
import { FunnelGuide } from './components/FunnelGuide';
import { LeadsCleanupPanel } from './components/LeadsCleanupPanel';
import { Loader2 } from 'lucide-react';

export default function LeadsPage() {
  // ✅ OPTIMIZADO: Paginación del servidor (no carga todos los registros)
  const {
    leads,
    stats,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    isLoading,
    isSearching,
    error,
    refresh,
  } = useLeadsPaginated({ pageSize: 8 });
  
  // Stats ya vienen del servidor
  const leadsStats = useMemo(() => ({
    total: stats.total,
    nuevo: stats.nuevos,
    contactado: stats.enSeguimiento, // Leads contactados (en seguimiento)
    interesado: stats.interesados,
    convertido: stats.convertidos,
    descartado: stats.descartados,
    activos: stats.nuevos + stats.enSeguimiento + stats.interesados, // Pipeline activo
  }), [stats]);
  
  // ✅ Handler para cambio de filtro (mapea a valores del hook)
  const handleFilterChange = useCallback((newFilter: 'all' | 'nuevo' | 'contactado' | 'interesado' | 'convertido' | 'descartado') => {
    setEstadoFilter(newFilter === 'all' ? '' : newFilter);
  }, [setEstadoFilter]);

  // ✅ Handler memoizado para refresh
  const handleRefresh = useCallback(() => refresh(), [refresh]);

  return (
    <PageShell
      accent
      fullWidth
      compact
      eyebrow="Gestión de Prospectos"
      title={<MainTitle />}
      description="Pipeline de ventas y seguimiento de pacientes potenciales."
    >
      {/* Métricas Clave (calculadas en servidor) */}
      <LeadsMetrics stats={leadsStats} loading={isLoading && !leads.length} />

      {/* Guía del Embudo (educativo para el doctor) */}
      <FunnelGuide />

      {/* Panel de limpieza de leads duplicados */}
      <LeadsCleanupPanel onComplete={handleRefresh} />

      <div className={`${cards.base} overflow-hidden rounded-xl border border-border dark:border-white/[0.06] bg-card dark:bg-white/[0.02]`}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border dark:border-white/[0.06] bg-muted/20 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Base de Datos de Leads</span>
            <QuickGuide />
            <span className="text-xs text-muted-foreground">({totalCount.toLocaleString()})</span>
            {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
            title="Recargar datos"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div>
          <div className="px-4 py-3 pb-0">
            <LeadsFilters
              currentFilter={estadoFilter === '' ? 'all' : estadoFilter as 'nuevo' | 'interesado' | 'convertido' | 'descartado'}
              onFilterChange={handleFilterChange}
              searchValue={search}
              onSearchChange={setSearch}
            />
          </div>

          <ContentLoader
            loading={isLoading && !leads.length}
            error={error}
            onRetry={refresh}
            isEmpty={leads.length === 0 && !isLoading}
            minHeight="min-h-[300px]"
            skeleton={<TableContentSkeleton rows={6} />}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="bg-muted/50 p-4 rounded-full mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p>{search ? 'No se encontraron leads con ese criterio' : 'No hay leads registrados aún'}</p>
              </div>
            }
          >
            <div className="border-t border-border">
              <LeadsTable 
                leads={leads} 
                loading={isLoading}
                onRefresh={handleRefresh}
                emptyMessage="No hay datos para mostrar"
              />
            </div>
            
            {/* Paginación del servidor */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border/50 bg-gradient-to-r from-muted/30 via-transparent to-muted/30">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={goToPage}
                  isLoading={isLoading}
                />
              </div>
            )}
          </ContentLoader>
        </div>
      </div>
    </PageShell>
  );
}
