'use client';

import { useMemo, useState, useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { typography, spacing, cards } from '@/app/lib/design-system';
import { MainTitle, QuickGuide } from '@/app/components/leads/LeadsTooltips';
import { LeadsMetrics } from './components/LeadsMetrics';
import { LeadsFilters } from './components/LeadsFilters';
import { LeadsTable } from './components/LeadsTable';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Nuevo' | 'En seguimiento' | 'Convertido' | 'Descartado'>('all');
  
  // ✅ OPTIMIZACIÓN: Debounce para búsqueda (300ms)
  const debouncedSearch = useDebouncedCallback(useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(0); // Resetear a primera página al buscar
  }, []), 300);
  
  // ✅ Datos enriquecidos de Supabase (con relación a pacientes)
  const { leads, loading, error, refetch, stats } = useLeads();
  
  // Stats ya vienen del hook enriquecido
  const leadsStats = useMemo(() => ({
    total: stats.total,
    nuevo: stats.nuevos,
    seguimiento: stats.enSeguimiento,
    convertido: stats.convertidos,
    descartado: stats.descartados,
    enProceso: stats.nuevos + stats.enSeguimiento,
    clientes: stats.clientes,
    calientes: stats.calientes,
    inactivos: stats.inactivos,
  }), [stats]);
  
  // ✅ OPTIMIZACIÓN: Filtrado con memoización eficiente
  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    
    // Filtrar por estado primero (más rápido)
    const filtered = statusFilter !== 'all' 
      ? leads.filter((lead) => lead.estado === statusFilter)
      : leads;
    
    // Si no hay búsqueda, retornar directo
    if (!term) return filtered;
    
    // Filtrar por término de búsqueda
    return filtered.filter((lead) => {
      const nombre = lead.nombre.toLowerCase();
      const telefono = lead.telefono;
      const fuente = lead.fuente.toLowerCase();
      
      return nombre.includes(term) || telefono.includes(term) || fuente.includes(term);
    });
  }, [search, leads, statusFilter]);
  
  // ✅ OPTIMIZACIÓN: Paginación dinámica según tamaño de pantalla
  const itemsPerPage = 50;
  const paginatedLeads = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, currentPage, itemsPerPage]);
  
  // ✅ Resetear página cuando cambian filtros
  const handleFilterChange = useCallback((newFilter: typeof statusFilter) => {
    setStatusFilter(newFilter);
    setCurrentPage(0);
  }, []);

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Gestión de Prospectos"
      title={<MainTitle />}
      description="Pipeline de ventas y seguimiento de pacientes potenciales."
    >
      {/* Métricas Clave */}
      <LeadsMetrics stats={leadsStats} loading={loading} />

      <Card className={`${cards.base} overflow-hidden`}>
        <CardHeader className={`${spacing.cardHeader} border-b border-border bg-muted/20`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className={typography.cardTitle}>
                  Base de Datos de Leads
                </CardTitle>
                <QuickGuide />
              </div>
              <CardDescription className={typography.cardDescription}>
                Gestiona y califica a tus prospectos
              </CardDescription>
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
              title="Recargar datos"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-4 pb-0">
            <LeadsFilters
              currentFilter={statusFilter}
              onFilterChange={handleFilterChange}
              searchValue={search}
              onSearchChange={(val) => {
                setSearch(val); // Update input immediately
                debouncedSearch(val); // Debounce fetch/filter
              }}
            />
          </div>

          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredLeads.length === 0}
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
                leads={paginatedLeads} 
                loading={loading}
                emptyMessage="No hay datos para mostrar"
              />
            </div>
            
            {/* Paginación */}
            {filteredLeads.length > itemsPerPage && (
              <div className="p-4 border-t border-border bg-muted/20">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredLeads.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </ContentLoader>
        </CardContent>
      </Card>
    </PageShell>
  );
}
