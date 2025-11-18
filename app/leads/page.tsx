'use client';

import { useMemo, useState, useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { STATE_COLORS } from '@/app/lib/crm-data';
import type { Lead } from '@/types/leads';
import { useLeads } from '@/hooks/useLeads';
import { CANAL_COLORS, type CanalMarketing } from '@/types/canales-marketing';
import Link from 'next/link';
import { ContentLoader, TableContentSkeleton } from '@/app/components/common/ContentLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { typography, spacing, cards } from '@/app/lib/design-system';
import { InfoTooltip, WrapTooltip } from '@/app/components/common/InfoTooltip';
import { GLOSARIO } from '@/app/lib/glosario-medico';
import { TableHeaders, MainTitle, QuickGuide, StatsTooltips, FilterTooltips } from '@/app/components/leads/LeadsTooltips';

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
      eyebrow="Personas interesadas"
      title={<MainTitle />}
      description="Personas que han mostrado interés en nuestros servicios. Aquí puedes dar seguimiento hasta que agenden su primera consulta."
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
              <div className="flex items-center gap-2">
                <CardTitle className={typography.cardTitle}>
                  Personas interesadas
                </CardTitle>
                <QuickGuide />
              </div>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Seguimiento de personas que contactaron pero aún no agendaron consulta'
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
              <WrapTooltip content={StatsTooltips.total} side="bottom">
                <span className="rounded-full bg-white/5 px-3 py-1 cursor-help">
                  Total:
                  <span className="ml-1 font-semibold text-white">{leadsStats.total}</span>
                </span>
              </WrapTooltip>
              
              <WrapTooltip content={StatsTooltips.convertidos} side="bottom">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 cursor-help">
                  Convertidos:
                  <span className="ml-1 font-semibold text-emerald-300">{leadsStats.convertido}</span>
                </span>
              </WrapTooltip>
              
              <WrapTooltip content={StatsTooltips.enProceso} side="bottom">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 cursor-help">
                  En proceso:
                  <span className="ml-1 font-semibold text-blue-300">{leadsStats.enProceso}</span>
                </span>
              </WrapTooltip>
              
              <WrapTooltip content={StatsTooltips.conConsultas} side="bottom">
                <span className="rounded-full bg-purple-500/10 px-3 py-1 cursor-help">
                  Con consultas:
                  <span className="ml-1 font-semibold text-purple-300">{leadsStats.clientes}</span>
                </span>
              </WrapTooltip>
              
              <WrapTooltip content={StatsTooltips.altaPrioridad} side="bottom">
                <span className="rounded-full bg-amber-500/10 px-3 py-1 cursor-help">
                  {GLOSARIO.caliente.icono} Alta prioridad:
                  <span className="ml-1 font-semibold text-amber-300">{leadsStats.calientes}</span>
                </span>
              </WrapTooltip>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              {[
                { key: 'all' as const, label: 'Todos', tooltip: FilterTooltips['all'] },
                { key: 'Nuevo' as const, label: 'Nuevos', tooltip: FilterTooltips['Nuevo'] },
                { key: 'En seguimiento' as const, label: 'Seguimiento', tooltip: FilterTooltips['En seguimiento'] },
                { key: 'Convertido' as const, label: 'Convertidos', tooltip: FilterTooltips['Convertido'] },
                { key: 'Descartado' as const, label: 'Descartados', tooltip: FilterTooltips['Descartado'] },
              ].map((option) => (
                <WrapTooltip key={option.key} content={option.tooltip} side="bottom">
                  <button
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
                </WrapTooltip>
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
                { key: 'nombre', label: <TableHeaders.Persona /> },
                { key: 'origen', label: <TableHeaders.Origen /> },
                { key: 'ultimoMensaje', label: <TableHeaders.UltimoMensaje /> },
                { key: 'estado', label: <TableHeaders.Etapa /> },
                { key: 'conversion', label: <TableHeaders.Paciente /> },
              ]}
              rows={paginatedLeads.map((lead: Lead) => {
                const canal = (lead.canalMarketing || 'Otro') as CanalMarketing;
                const canalStyle = CANAL_COLORS[canal] || CANAL_COLORS['Otro'];
                
                return {
                  id: lead.id,
                  nombre: (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{lead.nombre}</span>
                        {lead.esCaliente && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🔥
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/50">{lead.telefono}</span>
                      <span className="text-[10px] text-white/40">{lead.fuente}</span>
                    </div>
                  ),
                  origen: (
                    <WrapTooltip content={GLOSARIO.canales[canal]} side="right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${canalStyle.bg} ${canalStyle.text} ${canalStyle.border} cursor-help`}>
                        <span>{canalStyle.icon}</span>
                        <span>{canal}</span>
                      </span>
                    </WrapTooltip>
                  ),
                  ultimoMensaje: (
                    <div className="flex flex-col gap-1 text-xs">
                      {lead.ultimaInteraccion ? (
                        <>
                          <span className="text-white/80 font-medium">
                            {new Date(lead.ultimaInteraccion).toLocaleDateString('es-MX', { 
                              day: 'numeric', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-white/50">
                            Hace {lead.diasDesdeUltimaInteraccion}d
                          </span>
                        </>
                      ) : (
                        <span className="text-white/40">
                          Sin mensajes aún
                        </span>
                      )}
                      {lead.esInactivo && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-red-500/10 text-red-300 border border-red-500/20 w-fit">
                          Inactivo
                        </span>
                      )}
                    </div>
                  ),
                  estado: (
                    <WrapTooltip 
                      content={
                        <div className="space-y-1">
                          <p className="font-semibold">{lead.estado}</p>
                          <p className="text-white/70">{GLOSARIO.estados.detalle[lead.estado]}</p>
                        </div>
                      } 
                      side="right"
                    >
                      <div className="inline-block cursor-help">
                        <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
                      </div>
                    </WrapTooltip>
                  ),
                  conversion: (
                    <div className="flex flex-col gap-1 text-xs">
                      {lead.esCliente && lead.paciente ? (
                        <>
                          <Link
                            href={`/pacientes/${lead.paciente.id}`}
                            className="text-emerald-300 hover:text-emerald-200 font-medium underline decoration-emerald-500/30 hover:decoration-emerald-300 transition-colors"
                          >
                            Ver perfil →
                          </Link>
                          <span className="text-white/50">
                            {lead.paciente.totalConsultas} {lead.paciente.totalConsultas === 1 ? 'consulta' : 'consultas'}
                          </span>
                          {lead.diasDesdeConversion !== null && (
                            <span className="text-white/40 text-[10px]">
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
                };
              })}
              empty={search ? 'Sin resultados para el criterio aplicado.' : 'Aún no hay leads registrados.'}
              mobileConfig={{
                primary: 'nombre',
                secondary: 'origen',
                metadata: ['estado', 'ultimoMensaje']
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
