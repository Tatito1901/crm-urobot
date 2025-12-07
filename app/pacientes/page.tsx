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

// Métricas compactas - responsivas para móvil
const PacientesMetrics = memo(({ stats, loading }: { stats: PacientesStats, loading: boolean }) => {
  const metrics = [
    { icon: Users, value: stats.total, label: 'Total', color: 'text-foreground', show: true },
    { icon: UserCheck, value: stats.activos, label: 'Activos', color: 'text-emerald-600 dark:text-emerald-400', show: true },
    { icon: UserPlus, value: stats.conConsultas, label: 'Con citas', color: 'text-blue-600 dark:text-blue-400', show: false },
    { icon: AlertCircle, value: stats.sinConsultas, label: 'Sin citas', color: 'text-amber-600 dark:text-amber-400', show: true },
  ];

  return (
    <div className="flex gap-3 sm:gap-4 flex-wrap" suppressHydrationWarning>
      {metrics.map((m) => (
        <div 
          key={m.label} 
          className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${!m.show ? 'hidden sm:flex' : ''}`}
        >
          <m.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${m.color}`} />
          <span className="font-semibold text-foreground tabular-nums">
            {loading ? '-' : m.value.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-[10px] sm:text-xs hidden xs:inline">{m.label}</span>
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
  } = usePacientesPaginated({ pageSize: 8 });

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
        <div className="p-3 sm:p-4 border-b border-border bg-muted/30">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Fila 1: Búsqueda + Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="w-full pl-9 pr-9 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                )}
              </div>
              <button
                onClick={() => refresh()}
                disabled={isLoading}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50 flex-shrink-0"
                title="Recargar datos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Fila 2: Filtros + Métricas */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Filtros de estado */}
              <div className="flex items-center gap-2">
                <div className="inline-flex bg-muted rounded-lg p-0.5 border border-border">
                  {[
                    { key: '' as const, label: 'Todos' },
                    { key: 'Activo' as const, label: 'Activos' },
                    { key: 'Inactivo' as const, label: 'Inactivos' },
                  ].map((option) => (
                    <button
                      key={option.key || 'all'}
                      type="button"
                      onClick={() => handleEstadoFilterChange(option.key)}
                      className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        estadoFilter === option.key
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {totalCount.toLocaleString()}
                </span>
              </div>

              {/* Métricas inline (calculadas en servidor) */}
              <PacientesMetrics stats={stats} loading={isLoading && !pacientes.length} />
            </div>
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
