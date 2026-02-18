'use client';

import React, { useMemo, useCallback, memo } from 'react';
import { useLeadsPaginated } from '@/hooks/leads/useLeadsPaginated';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { PaginationControls } from '@/app/components/common/PaginationControls';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { RefreshButton } from '@/app/components/common/RefreshButton';
import { PageShell } from '@/app/components/crm/page-shell';
import { LeadsFilters } from './components/LeadsFilters';
import { LeadsTable } from './components/LeadsTable';
import { Users, UserPlus, Clock, Calendar, UserCheck, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ── Compact stat card (matches Cardiobot pattern) ──
interface StatMiniCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  valueClass?: string;
  loading?: boolean;
}

const StatMiniCard = memo(function StatMiniCard({
  icon, iconBg, label, value, valueClass, loading,
}: StatMiniCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card/80 border border-border/40 transition-all duration-200 hover:border-border/60 hover:bg-card hover:shadow-sm min-h-[72px] cursor-pointer">
      <div className={cn('p-2 sm:p-2.5 rounded-xl shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium truncate leading-tight uppercase tracking-wide">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-6 w-10 mt-1" />
        ) : (
          <p className={cn('text-lg sm:text-xl font-bold tabular-nums leading-tight mt-0.5', valueClass || 'text-foreground')}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
});

export default function LeadsPage() {
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
  } = useLeadsPaginated({ pageSize: 8 });

  const computedStats = useMemo(() => {
    const activos = stats.nuevos + stats.interactuando + stats.contactados + stats.citaPropuesta + stats.enSeguimiento + stats.citaAgendada;
    const enProceso = stats.interactuando + stats.contactados + stats.citaPropuesta;
    const conversionRate = activos > 0
      ? Math.round((stats.convertidos / (activos + stats.convertidos)) * 100)
      : 0;
    return { activos, enProceso, conversionRate };
  }, [stats]);

  const handleFilterChange = useCallback((newFilter: 'all' | 'nuevo' | 'interactuando' | 'contactado' | 'cita_propuesta' | 'cita_agendada' | 'perdido') => {
    setEstadoFilter(newFilter === 'all' ? '' : newFilter);
  }, [setEstadoFilter]);

  const handleRefresh = useCallback(() => refresh(), [refresh]);

  const statsLoading = isLoading && !leads.length;

  return (
    <ErrorBoundary>
      <PageShell
        accent
        fullWidth
        compact
        eyebrow="Gestión Comercial"
        title="Leads"
        description="Gestiona y da seguimiento a tus prospectos"
        headerSlot={
          <RefreshButton onClick={handleRefresh} loading={isLoading} />
        }
      >

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatMiniCard
            icon={<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />}
            iconBg="bg-primary/10"
            label="Activos"
            value={computedStats.activos}
            loading={statsLoading}
          />
          <StatMiniCard
            icon={<UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />}
            iconBg="bg-blue-500/10"
            label="Nuevos"
            value={stats.nuevos}
            valueClass={stats.nuevos > 0 ? 'text-blue-500' : undefined}
            loading={statsLoading}
          />
          <StatMiniCard
            icon={<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />}
            iconBg="bg-amber-500/10"
            label="En proceso"
            value={computedStats.enProceso}
            loading={statsLoading}
          />
          <StatMiniCard
            icon={<Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />}
            iconBg="bg-purple-500/10"
            label="Citas"
            value={stats.citaAgendada}
            valueClass="text-purple-500"
            loading={statsLoading}
          />
          <StatMiniCard
            icon={<UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
            label="Convertidos"
            value={stats.convertidos}
            valueClass="text-emerald-500"
            loading={statsLoading}
          />
        </div>

        {/* ── Table ── */}
        <div className="space-y-4">
          {/* Search + filters bar */}
          <div className="flex items-center gap-4 bg-card/80 p-4 rounded-xl border border-border/50 shadow-sm">
            <LeadsFilters
              currentFilter={estadoFilter === '' ? 'all' : estadoFilter as 'nuevo' | 'interactuando' | 'contactado' | 'cita_propuesta' | 'cita_agendada' | 'perdido'}
              onFilterChange={handleFilterChange}
              searchValue={search}
              onSearchChange={setSearch}
            />
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <span className="tabular-nums font-medium text-foreground">{totalCount}</span>
              <span>leads</span>
              {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
            </div>
          </div>

          {/* Table card */}
          <div className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
            <ContentLoader
              loading={statsLoading}
              error={error}
              onRetry={refresh}
              isEmpty={leads.length === 0 && !isLoading}
              minHeight="min-h-[300px]"
              skeleton={<TableContentSkeleton rows={6} />}
              emptyState={
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 ring-1 ring-primary/10">
                    <Users className="h-9 w-9 text-primary/60" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {search ? 'No se encontraron leads' : 'No hay leads registrados'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
                    {search ? 'Intenta con otros términos de búsqueda' : 'Los leads aparecerán aquí cuando los pacientes envíen mensajes'}
                  </p>
                </div>
              }
            >
              <LeadsTable
                leads={leads}
                loading={isLoading}
                onRefresh={handleRefresh}
                emptyMessage="No hay datos para mostrar"
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 border-t border-border/40 px-4 sm:px-6 py-3 sm:py-4 bg-secondary/20">
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
          </div>
        </div>
      </PageShell>
    </ErrorBoundary>
  );
}
