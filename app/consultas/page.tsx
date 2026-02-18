'use client';

import { useMemo, useState, useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/common/useDebouncedCallback';
import { PageShell } from '@/app/components/crm/page-shell';
import { useConsultas } from '@/hooks/consultas/useConsultas';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { cards } from '@/app/lib/design-system';
import { Building2, MapPin, Search, RefreshCw, Loader2 } from 'lucide-react';
import { ConsultasTable } from './components/ConsultasTable';
import { ConsultasMetrics } from './components/ConsultasMetrics';

export default function ConsultasPage() {
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sedeFilter, setSedeFilter] = useState<'all' | 'POLANCO' | 'SATELITE'>('all');

  // ✅ OPTIMIZACIÓN: Debounce para búsqueda (300ms)
  const debouncedSearch = useDebouncedCallback(useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(0);
  }, []), 300);

  // ✅ Datos reales de Supabase con estadísticas y métricas
  const { consultas, loading, error, refetch, stats } = useConsultas();

  // ✅ OPTIMIZACIÓN: Filtrado eficiente con memoización
  const filteredConsultas = useMemo(() => {
    const term = search.trim().toLowerCase();
    
    // Filtrar por sede primero
    const filtered = sedeFilter !== 'all'
      ? consultas.filter((c) => c.sede === sedeFilter)
      : consultas;
    
    // Si no hay búsqueda, retornar directo
    if (!term) return filtered;
    
    // Filtrar por término de búsqueda
    return filtered.filter((consulta) => {
      const paciente = (consulta.paciente || '').toLowerCase();
      const id = consulta.id.toLowerCase();
      const motivo = (consulta.motivoConsulta || '').toLowerCase();
      
      return paciente.includes(term) || id.includes(term) || motivo.includes(term);
    });
  }, [search, consultas, sedeFilter]);

  // ✅ Paginación de 7 elementos
  const itemsPerPage = 7;
  const paginatedConsultas = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredConsultas.slice(start, end);
  }, [filteredConsultas, currentPage, itemsPerPage]);

  const handleSedeFilterChange = useCallback((newFilter: typeof sedeFilter) => {
    setSedeFilter(newFilter);
    setCurrentPage(0);
  }, []);
  

  return (
    <PageShell
      accent
      fullWidth
      compact
      eyebrow="Gestión de Citas"
      title="Agenda de Consultas"
      description="Historial de consultas programadas con información de cada cita."
    >
      {/* Métricas */}
      <ConsultasMetrics stats={stats} />

      <div className={`${cards.base} overflow-hidden rounded-xl border border-border bg-card`}>
        {/* Header con búsqueda y filtros */}
        <div className="p-3 sm:p-4 border-b border-border bg-muted/20">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3 sm:items-center sm:justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  debouncedSearch(event.target.value);
                }}
                placeholder="Buscar paciente, folio o motivo..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all"
              />
            </div>

            {/* Filtros de sede + refresh */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="inline-flex p-0.5 sm:p-1 bg-muted/50 rounded-lg border border-border flex-1 sm:flex-none">
                {[
                  { key: 'all' as const, label: 'Todas', icon: <Building2 className="h-3.5 w-3.5" /> },
                  { key: 'POLANCO' as const, label: 'Polanco', icon: <MapPin className="h-3.5 w-3.5" /> },
                  { key: 'SATELITE' as const, label: 'Satélite', icon: <MapPin className="h-3.5 w-3.5" /> },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleSedeFilterChange(option.key)}
                    className={`
                      flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 whitespace-nowrap
                      ${sedeFilter === option.key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {option.icon}
                    <span className="hidden xs:inline sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => refetch()}
                disabled={loading}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50 shrink-0"
                title="Recargar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div>
          
          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredConsultas.length === 0}
            minHeight="min-h-[500px]"
            skeleton={<TableContentSkeleton rows={7} />}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <p className="text-4xl sm:text-5xl">📅</p>
                <p className="text-sm text-muted-foreground">
                  {search ? 'No se encontraron consultas' : 'No hay consultas registradas'}
                </p>
              </div>
            }
          >
            <ConsultasTable
              consultas={paginatedConsultas}
              emptyMessage={search ? 'Sin coincidencias para el criterio aplicado.' : 'No hay consultas registradas aún.'}
            />
            
            {/* Paginación mejorada */}
            {filteredConsultas.length > itemsPerPage && (
              <div className="p-4 border-t border-border bg-muted/20">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredConsultas.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </ContentLoader>
        </div>
      </div>
    </PageShell>
  );
}
