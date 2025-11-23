'use client';

import { useMemo, useState, useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConsultas } from '@/hooks/useConsultas';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { typography, spacing, cards, inputs } from '@/app/lib/design-system';
import { Building2, MapPin, Search } from 'lucide-react';
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
      const paciente = consulta.paciente.toLowerCase();
      const id = consulta.id.toLowerCase();
      const motivo = (consulta.motivoConsulta || '').toLowerCase();
      
      return paciente.includes(term) || id.includes(term) || motivo.includes(term);
    });
  }, [search, consultas, sedeFilter]);

  // ✅ OPTIMIZACIÓN: Paginación adaptativa según viewport
  const itemsPerPage = 30;
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
      eyebrow="Consultas"
      title="Agenda de consultas"
      description="Listado completo de consultas programadas con información esencial de cada cita."
      headerSlot={
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className={typography.label}>Buscar</CardTitle>
            <CardDescription className={typography.metadataSmall}>
              Paciente, folio o motivo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/40" />
              <input
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  debouncedSearch(event.target.value);
                }}
                placeholder="Buscar..."
                className={`${inputs.search} sm:border-none sm:bg-transparent sm:px-0 sm:py-0 pl-9 sm:pl-9`}
              />
            </div>
          </CardContent>
        </Card>
      }
    >
      {/* Estadísticas fuera del Card principal para consistencia visual */}
      <ConsultasMetrics stats={stats} />

      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className={typography.cardTitle}>
                Listado de consultas
              </CardTitle>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Detalle operativo por paciente y sede'
                }
              </CardDescription>
            </div>
            
            {/* Filtros de sede y botón recargar (Unificados y Responsivos) */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700/50">
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
                      flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2
                      ${sedeFilter === option.key
                        ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-transparent'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <span>{option.icon}</span>
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">{option.label.slice(0, 3)}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => refetch()}
                disabled={loading}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 hidden sm:flex"
                title="Recargar datos"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          
          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredConsultas.length === 0}
            minHeight="min-h-[500px]"
            skeleton={<TableContentSkeleton rows={8} />}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <p className="text-4xl sm:text-5xl">📅</p>
                <p className={typography.body}>
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
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-white/60">
                    Mostrando <span className="font-semibold text-slate-900 dark:text-white">{currentPage * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-900 dark:text-white">{Math.min((currentPage + 1) * itemsPerPage, filteredConsultas.length)}</span> de <span className="font-semibold text-slate-900 dark:text-white">{filteredConsultas.length}</span> consultas
                  </p>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredConsultas.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </ContentLoader>
        </CardContent>
      </Card>
    </PageShell>
  );
}
