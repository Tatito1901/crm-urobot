'use client';

import { useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { usePacientesPaginated } from '@/hooks/usePacientesPaginated';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { PaginationControls } from '@/app/components/common/PaginationControls';
import { cards } from '@/app/lib/design-system';
import { Users, UserCheck, UserPlus, AlertCircle, Search, RefreshCw, Loader2 } from 'lucide-react';
import { PacientesTable } from './components/PacientesTable';

// Interface para las estadísticas
interface PacientesStats {
  total: number;
  activos: number;
  inactivos: number;
  recientes: number;
  conConsultas: number;
  sinConsultas: number;
}

// Métricas compactas en línea - siempre muestra skeleton en SSR para evitar hydration mismatch
const PacientesMetrics = memo(({ stats, loading }: { stats: PacientesStats, loading: boolean }) => {
  const metrics = [
    { icon: Users, value: stats.total, label: 'Total', color: 'text-foreground' },
    { icon: UserCheck, value: stats.activos, label: 'Activos', color: 'text-emerald-600 dark:text-emerald-400' },
    { icon: UserPlus, value: stats.recientes, label: 'Nuevos (30d)', color: 'text-blue-600 dark:text-blue-400' },
    { icon: AlertCircle, value: stats.sinConsultas, label: 'Sin citas', color: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="flex gap-4 flex-wrap" suppressHydrationWarning>
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-2 text-sm">
          <m.icon className={`w-4 h-4 ${m.color}`} />
          <span className="font-semibold text-foreground">
            {loading ? '-' : m.value.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs">{m.label}</span>
        </div>
      ))}
    </div>
  );
});
PacientesMetrics.displayName = 'PacientesMetrics';

export default function PacientesPage() {
  const router = useRouter();

  // ✅ OPTIMIZADO: Paginación del servidor (no carga todos los registros)
  const { 
    pacientes,
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
  } = usePacientesPaginated({ pageSize: 10 });

  const handlePacienteHover = useCallback((pacienteId: string) => {
    router.prefetch(`/pacientes/${pacienteId}`);
  }, [router]);

  const handleEstadoFilterChange = useCallback((newFilter: '' | 'Activo' | 'Inactivo') => {
    setEstadoFilter(newFilter);
  }, [setEstadoFilter]);

  return (
    <PageShell
      accent
      fullWidth
      compact
      eyebrow="Gestión de pacientes"
      title="Carpeta clínica"
      description="Historial de pacientes con actividad y estado actual."
    >
      {/* Header compacto con búsqueda, métricas y filtros */}
      <Card className={`${cards.base} overflow-hidden`}>
        {/* Barra superior: Búsqueda + Métricas + Filtros */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Barra de búsqueda con indicador de loading */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono o correo..."
                className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
              )}
            </div>

            {/* Métricas inline (calculadas en servidor) */}
            <PacientesMetrics stats={stats} loading={isLoading && !pacientes.length} />
          </div>

          {/* Filtros y acciones */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              {/* Filtros de estado */}
              <div className="flex bg-muted rounded-lg p-0.5 border border-border">
                {[
                  { key: '' as const, label: 'Todos' },
                  { key: 'Activo' as const, label: 'Activos' },
                  { key: 'Inactivo' as const, label: 'Inactivos' },
                ].map((option) => (
                  <button
                    key={option.key || 'all'}
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

              <span className="text-xs text-muted-foreground">
                {totalCount.toLocaleString()} pacientes
              </span>
            </div>

            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabla */}
        <CardContent className="p-0">
          <ContentLoader
            loading={isLoading && !pacientes.length}
            error={error}
            onRetry={refresh}
            isEmpty={pacientes.length === 0 && !isLoading}
            minHeight="min-h-[300px]"
            skeleton={<TableContentSkeleton rows={5} />}
            emptyState={
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <Users className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </p>
              </div>
            }
          >
            <PacientesTable
              pacientes={pacientes}
              emptyMessage={search ? 'Sin coincidencias.' : 'No hay pacientes.'}
              onHover={handlePacienteHover}
            />
            
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
