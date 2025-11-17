'use client';

import { useMemo, useState, useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { STATE_COLORS } from '@/app/lib/crm-data';
import type { Lead } from '@/types/leads';
import { useLeads } from '@/hooks/useLeads';
import Link from 'next/link';
import { ContentLoader, TableContentSkeleton } from '@/app/components/common/ContentLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { typography, spacing, cards } from '@/app/lib/design-system';

export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
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
      eyebrow="Pipeline"
      title="Leads activos"
      description="Seguimiento de primeras conversaciones y conversiones recientes."
      headerSlot={
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 shadow-sm shadow-black/20">
            <input
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                debouncedSearch(event.target.value);
              }}
              placeholder="Buscar por nombre, teléfono o fuente"
              className="w-full bg-transparent border-none text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      }
    >
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className={typography.cardTitle}>
                Listado de leads
              </CardTitle>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Todas las etapas del funnel en un solo lugar'
                }
              </CardDescription>
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ↻
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-white/70">
              <span className="rounded-full bg-white/5 px-3 py-1">
                Total:
                <span className="ml-1 font-semibold text-white">{leadsStats.total}</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1">
                Convertidos:
                <span className="ml-1 font-semibold text-emerald-300">{leadsStats.convertido}</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1">
                En proceso:
                <span className="ml-1 font-semibold text-blue-300">{leadsStats.enProceso}</span>
              </span>
              <span className="rounded-full bg-purple-500/10 px-3 py-1">
                Con consultas:
                <span className="ml-1 font-semibold text-purple-300">{leadsStats.clientes}</span>
              </span>
              <span className="rounded-full bg-amber-500/10 px-3 py-1">
                Alta prioridad:
                <span className="ml-1 font-semibold text-amber-300">{leadsStats.calientes}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              {[
                { key: 'all' as const, label: 'Todos' },
                { key: 'Nuevo' as const, label: 'Nuevos' },
                { key: 'En seguimiento' as const, label: 'Seguimiento' },
                { key: 'Convertido' as const, label: 'Convertidos' },
                { key: 'Descartado' as const, label: 'Descartados' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleFilterChange(option.key)}
                  className={`rounded-full px-3 py-1 border text-xs sm:text-[11px] transition-all duration-200 min-h-[32px] ${
                    statusFilter === option.key
                      ? 'bg-white/15 border-white/40 text-white shadow-sm'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredLeads.length === 0}
            minHeight="min-h-[500px]"
            skeleton={<TableContentSkeleton rows={8} />}
            emptyState={
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-400">
                  {search ? 'No se encontraron leads' : 'No hay leads registrados'}
                </p>
              </div>
            }
          >
            <DataTable
              headers={[
                { key: 'nombre', label: 'Lead' },
                { key: 'actividad', label: 'Actividad' },
                { key: 'estado', label: 'Estado' },
                { key: 'conversion', label: 'Conversión' },
                { key: 'acciones', label: 'Acciones' },
              ]}
              rows={paginatedLeads.map((lead: Lead) => ({
                id: lead.id,
                nombre: (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white">{lead.nombre}</span>
                    <span className="text-xs text-white/40">{lead.telefono}</span>
                  </div>
                ),
                actividad: (
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">
                        {lead.totalInteracciones} {lead.totalInteracciones === 1 ? 'contacto' : 'contactos'}
                      </span>
                      {lead.esCaliente && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Prioridad
                        </span>
                      )}
                    </div>
                    <span className="text-white/50">
                      {lead.diasDesdeUltimaInteraccion !== null 
                        ? `Última: hace ${lead.diasDesdeUltimaInteraccion}d`
                        : `Registro: hace ${lead.diasDesdeContacto}d`
                      }
                    </span>
                    {lead.esInactivo && (
                      <span className="text-xs text-white/40">Sin actividad reciente</span>
                    )}
                  </div>
                ),
                estado: <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />,
                conversion: (
                  <div className="flex flex-col gap-1 text-xs">
                    {lead.esCliente && lead.paciente ? (
                      <>
                        <span className="text-white/70">
                          {lead.paciente.totalConsultas} {lead.paciente.totalConsultas === 1 ? 'consulta' : 'consultas'} registrada{lead.paciente.totalConsultas !== 1 ? 's' : ''}
                        </span>
                        {lead.diasDesdeConversion !== null && (
                          <span className="text-white/50">
                            Convertido hace {lead.diasDesdeConversion}d
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-white/50">
                        En prospección
                      </span>
                    )}
                  </div>
                ),
                acciones: (
                  <div className="flex items-center gap-2">
                    {lead.esCliente && lead.paciente ? (
                      <Link
                        href={`/pacientes/${lead.paciente.id}`}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                      >
                        Ver historial
                      </Link>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </div>
                ),
              }))}
              empty={search ? 'Sin resultados para el criterio aplicado.' : 'Aún no hay leads registrados.'}
              mobileConfig={{
                primary: 'nombre',
                secondary: 'actividad',
                metadata: ['estado', 'conversion']
              }}
            />
            
            {/* Paginación */}
            {filteredLeads.length > itemsPerPage && (
              <div className="mt-6 pt-6 border-t border-white/10">
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
