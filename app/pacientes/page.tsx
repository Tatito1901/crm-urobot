'use client';

import { useMemo, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePacientes } from '@/hooks/usePacientes';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { typography, spacing, cards, inputs } from '@/app/lib/design-system';
import { Users, UserCheck, UserPlus, AlertCircle } from 'lucide-react';
import { PacientesTable } from './components/PacientesTable';

// Interface para las estadísticas
interface PacientesStats {
  total: number;
  activos: number;
  inactivos: number;
  recientes: number;
  requierenAtencion: number;
  conConsultas: number;
  sinConsultas: number;
}

// Componente de métricas visuales consistente con Leads/Dashboard
const PacientesMetrics = memo(({ stats, loading }: { stats: PacientesStats, loading: boolean }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group shadow-sm dark:shadow-none transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Users className="w-12 h-12 text-slate-500 dark:text-muted-foreground" />
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-muted-foreground mb-1 font-medium">Total Pacientes</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-foreground">{stats.total}</div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-muted-foreground mt-2">Historial completo</div>
      </div>

      <div className="bg-white dark:bg-card border border-emerald-100 dark:border-emerald-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group shadow-sm dark:shadow-none transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserCheck className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div>
          <div className="text-xs text-emerald-600 dark:text-emerald-300 mb-1 font-medium">Activos</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-100">{stats.activos}</div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-muted-foreground mt-2">Con consultas recientes</div>
      </div>

      <div className="bg-white dark:bg-card border border-blue-100 dark:border-blue-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group shadow-sm dark:shadow-none transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <UserPlus className="w-12 h-12 text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <div className="text-xs text-blue-600 dark:text-blue-300 mb-1 font-medium">Recientes</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-foreground">{stats.recientes}</div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-muted-foreground mt-2">Registrados este mes</div>
      </div>

      <div className="bg-white dark:bg-card border border-amber-100 dark:border-amber-500/20 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group shadow-sm dark:shadow-none transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-500/30">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertCircle className="w-12 h-12 text-amber-500 dark:text-amber-400" />
        </div>
        <div>
          <div className="text-xs text-amber-600 dark:text-amber-300 mb-1 font-medium">Atención</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-100">{stats.requierenAtencion}</div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-muted-foreground mt-2">Sin seguimiento reciente</div>
      </div>
    </div>
  );
});
PacientesMetrics.displayName = 'PacientesMetrics';

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
      fullWidth
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
      {/* Métricas Clave */}
      <PacientesMetrics stats={stats} loading={loading} />

      <Card className={`${cards.base} overflow-hidden`}>
        <CardHeader className={`${spacing.cardHeader} border-b border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/20`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className={typography.cardTitle}>
                Base de Pacientes
              </CardTitle>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Listado maestro de pacientes registrados'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Filtros de estado */}
              <div className="hidden sm:flex bg-muted rounded-lg p-1 border border-border">
                {[
                  { key: 'all' as const, label: 'Todos' },
                  { key: 'Activo' as const, label: 'Activos' },
                  { key: 'Inactivo' as const, label: 'Inactivos' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleEstadoFilterChange(option.key)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      estadoFilter === option.key
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => refetch()}
                disabled={loading}
                className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
                title="Recargar datos"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Filtros móviles */}
          <div className="flex sm:hidden mt-3 bg-muted rounded-lg p-1 border border-border w-full">
            {[
              { key: 'all' as const, label: 'Todos' },
              { key: 'Activo' as const, label: 'Activos' },
              { key: 'Inactivo' as const, label: 'Inactivos' },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleEstadoFilterChange(option.key)}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  estadoFilter === option.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredPacientes.length === 0}
            minHeight="min-h-[500px]"
            skeleton={<TableContentSkeleton rows={8} />}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="bg-muted p-4 rounded-full mb-2">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className={typography.body}>
                  {search ? 'No se encontraron pacientes con ese criterio' : 'No hay pacientes registrados'}
                </p>
              </div>
            }
          >
            <div className="border-t border-border">
              <PacientesTable
                pacientes={paginatedPacientesFiltered}
                emptyMessage={search ? 'Sin coincidencias para el criterio aplicado.' : 'No hay pacientes registrados aún.'}
                onHover={handlePacienteHover}
              />
            </div>
            
            {/* Paginación */}
            {filteredByEstado.length > itemsPerPage && (
              <div className="mt-6 pt-6 border-t border-border">
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
