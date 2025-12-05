'use client';

import { useMemo, useCallback } from 'react';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLeadsPaginated } from '@/hooks/useLeadsPaginated';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { PaginationControls } from '@/app/components/common/PaginationControls';
import { typography, spacing, cards } from '@/app/lib/design-system';
import { MainTitle, QuickGuide } from '@/app/components/leads/LeadsTooltips';
import { LeadsMetrics } from './components/LeadsMetrics';
import { LeadsFilters } from './components/LeadsFilters';
import { LeadsTable } from './components/LeadsTable';
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
  } = useLeadsPaginated({ pageSize: 50 });
  
  // Stats ya vienen del servidor
  const leadsStats = useMemo(() => ({
    total: stats.total,
    nuevo: stats.nuevos,
    interesado: stats.interesados,
    convertido: stats.convertidos,
    descartado: stats.descartados,
    enProceso: stats.nuevos + stats.interesados,
    clientes: 0,
    calientes: 0,
    inactivos: 0,
  }), [stats]);
  
  // ✅ Handler para cambio de filtro (mapea a valores del hook)
  const handleFilterChange = useCallback((newFilter: 'all' | 'Nuevo' | 'Interesado' | 'Convertido' | 'Descartado') => {
    setEstadoFilter(newFilter === 'all' ? '' : newFilter);
  }, [setEstadoFilter]);

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Gestión de Prospectos"
      title={<MainTitle />}
      description="Pipeline de ventas y seguimiento de pacientes potenciales."
    >
      {/* Métricas Clave (calculadas en servidor) */}
      <LeadsMetrics stats={leadsStats} loading={isLoading && !leads.length} />

      <Card className={`${cards.base} overflow-hidden`}>
        <CardHeader className={`${spacing.cardHeader} border-b border-border bg-muted/20`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className={typography.cardTitle}>
                  Base de Datos de Leads
                </CardTitle>
                <QuickGuide />
                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>
              <CardDescription className={typography.cardDescription}>
                {totalCount.toLocaleString()} prospectos en total
              </CardDescription>
            </div>
            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
              title="Recargar datos"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-4 pb-0">
            <LeadsFilters
              currentFilter={estadoFilter === '' ? 'all' : estadoFilter as 'Nuevo' | 'Interesado' | 'Convertido' | 'Descartado'}
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
            minHeight="min-h-[400px]"
            skeleton={<TableContentSkeleton rows={10} />}
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
        </CardContent>
      </Card>
    </PageShell>
  );
}
