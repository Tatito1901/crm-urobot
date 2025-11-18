'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Paciente } from '@/types/pacientes';
import { usePacientes } from '@/hooks/usePacientes';
import { ContentLoader, TableContentSkeleton } from '@/app/components/common/ContentLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { typography, spacing, cards, inputs } from '@/app/lib/design-system';
import { Button } from '@/components/ui/button';
import { HelpIcon } from '@/app/components/common/InfoTooltip';

export const dynamic = 'force-dynamic';

export default function PacientesPage() {
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  // ✅ OPTIMIZACIÓN: Debounce para búsqueda (300ms)
  const debouncedSearch = useDebouncedCallback(useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(0); // Resetear a primera página al buscar
  }, []), 300);

  // ✅ Datos reales de Supabase con estadísticas y métricas
  const { pacientes, loading, error, refetch, stats } = usePacientes();

  // ✅ OPTIMIZACIÓN: Callbacks memoizados
  const handlePacienteClick = useCallback((pacienteId: string) => {
    router.push(`/pacientes/${pacienteId}`);
  }, [router]);

  const handlePacienteHover = useCallback((pacienteId: string) => {
    router.prefetch(`/pacientes/${pacienteId}`);
  }, [router]);

  // ✅ OPTIMIZACIÓN: Filtrado eficiente con memoización
  const filteredPacientes = useMemo(() => {
    const term = search.trim().toLowerCase();
    
    // Si no hay búsqueda, retornar directo
    if (!term) return pacientes;
    
    // Filtrar por término de búsqueda
    return pacientes.filter((paciente) => {
      const nombre = paciente.nombre.toLowerCase();
      const telefono = paciente.telefono;
      const email = (paciente.email || '').toLowerCase();
      
      return nombre.includes(term) || telefono.includes(term) || email.includes(term);
    });
  }, [search, pacientes]);

  // ✅ OPTIMIZACIÓN: Paginación para mejor rendimiento
  const itemsPerPage = 50;
  
  // Estado filter
  const [estadoFilter, setEstadoFilter] = useState<'all' | 'Activo' | 'Inactivo'>('all');
  
  // Filtrado por estado
  const filteredByEstado = useMemo(() => {
    if (estadoFilter === 'all') return filteredPacientes;
    return filteredPacientes.filter(p => p.estado === estadoFilter);
  }, [filteredPacientes, estadoFilter]);
  
  // Paginación sobre filtro completo
  const paginatedPacientesFiltered = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredByEstado.slice(start, end);
  }, [filteredByEstado, currentPage, itemsPerPage]);
  
  const handleEstadoFilterChange = useCallback((newFilter: typeof estadoFilter) => {
    setEstadoFilter(newFilter);
    setCurrentPage(0);
  }, []);

  return (
    <PageShell
      accent
      eyebrow="Gestión de pacientes"
      title="Carpeta clínica"
      description="Historial completo de pacientes con su actividad, estado actual y última consulta registrada."
      headerSlot={
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className={typography.label}>Buscar</CardTitle>
            <CardDescription className={typography.metadataSmall}>
              Nombre, teléfono o correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center">
            <input
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                debouncedSearch(event.target.value);
              }}
              placeholder="Buscar por nombre, teléfono o correo"
              className={`${inputs.search} sm:border-none sm:bg-transparent sm:px-0 sm:py-0`}
            />
          </CardContent>
        </Card>
      }
    >
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className={typography.cardTitle}>
                Carpeta clínica
              </CardTitle>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Historial completo de pacientes registrados'
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
              <span className="rounded-full bg-white/5 px-3 py-1 flex items-center gap-1.5">
                <span>Total:</span>
                <span className="font-semibold text-white">{stats.total}</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 flex items-center gap-1.5">
                <span>✓ Activos:</span>
                <span className="font-semibold text-emerald-300">{stats.activos}</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 border border-blue-500/20 flex items-center gap-1.5">
                <span>🆕 Nuevos:</span>
                <span className="font-semibold text-blue-300">{stats.recientes}</span>
              </span>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 border border-amber-500/20 flex items-center gap-1.5">
                <span>⚠️ Atención:</span>
                <span className="font-semibold text-amber-300">{stats.requierenAtencion}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              {[
                { key: 'all' as const, label: 'Todos' },
                { key: 'Activo' as const, label: 'Activos' },
                { key: 'Inactivo' as const, label: 'Inactivos' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleEstadoFilterChange(option.key)}
                  className={`rounded-full px-3 py-1 border text-xs sm:text-[11px] transition-all duration-200 min-h-[32px] ${
                    estadoFilter === option.key
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
            isEmpty={filteredPacientes.length === 0}
            minHeight="min-h-[500px]"
            skeleton={<TableContentSkeleton rows={8} />}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <p className="text-4xl sm:text-5xl">👥</p>
                <p className={typography.body}>
                  {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </p>
              </div>
            }
          >
            <DataTable
              headers={[
                { 
                  key: 'nombre', 
                  label: (
                    <div className="flex items-center gap-1.5">
                      <span>Paciente</span>
                      <HelpIcon content="Nombre completo y teléfono de contacto" side="bottom" />
                    </div>
                  )
                },
                { 
                  key: 'actividad', 
                  label: (
                    <div className="flex items-center gap-1.5">
                      <span>Actividad</span>
                      <HelpIcon content="Número total de consultas registradas" side="bottom" />
                    </div>
                  )
                },
                { 
                  key: 'estado', 
                  label: (
                    <div className="flex items-center gap-1.5">
                      <span>Estado</span>
                      <HelpIcon content="Activo: paciente con consultas recientes | Inactivo: sin actividad prolongada" side="bottom" />
                    </div>
                  )
                },
                { 
                  key: 'ultimaConsulta', 
                  label: (
                    <div className="flex items-center gap-1.5">
                      <span>Última consulta</span>
                      <HelpIcon content="Fecha de la consulta más reciente y días transcurridos" side="bottom" />
                    </div>
                  )
                },
                { 
                  key: 'acciones', 
                  label: (
                    <div className="flex items-center gap-1.5">
                      <span>Acciones</span>
                      <HelpIcon content="Ver historial completo, agendar nueva consulta o contactar al paciente" side="bottom" />
                    </div>
                  )
                },
              ]}
              rows={paginatedPacientesFiltered.map((paciente: Paciente) => ({
                id: paciente.id,
                nombre: (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{paciente.nombre}</span>
                      {paciente.esReciente && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white/40">{paciente.telefono}</span>
                  </div>
                ),
                actividad: (
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">
                        {paciente.totalConsultas} {paciente.totalConsultas === 1 ? 'consulta' : 'consultas'}
                      </span>
                      {paciente.requiereAtencion && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Atención
                        </span>
                      )}
                    </div>
                  </div>
                ),
                estado: <Badge label={paciente.estado} tone={STATE_COLORS[paciente.estado]} />,
                ultimaConsulta: (
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-white/70">
                      {paciente.ultimaConsulta ? formatDate(paciente.ultimaConsulta) : 'Sin consulta previa'}
                    </span>
                    {paciente.diasDesdeUltimaConsulta !== null && (
                      <span className="text-white/50">
                        Hace {paciente.diasDesdeUltimaConsulta}d
                      </span>
                    )}
                  </div>
                ),
                acciones: (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePacienteClick(paciente.id);
                      }}
                    >
                      Ver historial
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/52${paciente.telefono}`, '_blank');
                      }}
                      title="Contactar por WhatsApp"
                    >
                      💬
                    </Button>
                  </div>
                ),
              }))}
              empty={search ? 'Sin coincidencias para el criterio aplicado.' : 'No hay pacientes registrados aún.'}
              mobileConfig={{
                primary: 'nombre',
                secondary: 'actividad',
                metadata: ['estado', 'ultimaConsulta']
              }}
              onRowHover={(rowId) => handlePacienteHover(rowId)}
            />
            
            {/* Paginación */}
            {filteredByEstado.length > itemsPerPage && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredByEstado.length}
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
