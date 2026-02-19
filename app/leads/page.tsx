'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { useLeadsPaginated } from '@/hooks/leads/useLeadsPaginated';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { PaginationControls } from '@/app/components/common/PaginationControls';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { RefreshButton } from '@/app/components/common/RefreshButton';
import { PageShell } from '@/app/components/crm/page-shell';
import { LeadsFilters } from './components/LeadsFilters';
import { LeadsTable } from './components/LeadsTable';
import { LeadClinicSidebar } from './components/LeadClinicSidebar';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import { Users, UserPlus, Clock, Calendar, UserCheck, Loader2, Stethoscope } from 'lucide-react';
import { EmptyState } from '@/app/components/common/EmptyState';

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

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const selectedLead = useMemo(
    () => leads.find(l => l.id === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  );

  const handleRowClick = useCallback((leadId: string) => {
    setSelectedLeadId(prev => prev === leadId ? null : leadId);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelectedLeadId(null);
  }, []);

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeadId(prev => prev ? null : leads[0]?.id ?? null)}
              className={`p-2 rounded-lg transition-colors ${
                selectedLeadId
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                  : 'hover:bg-secondary text-muted-foreground'
              }`}
              title="Panel clínico"
            >
              <Stethoscope className="w-4 h-4" />
            </button>
            <RefreshButton onClick={handleRefresh} loading={isLoading} />
          </div>
        }
      >

      {/* ── Main content ── */}
      <div className="space-y-4">

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <MetricCard
            variant="compact"
            icon={<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />}
            iconColor="bg-primary/10"
            title="Activos"
            value={computedStats.activos}
            loading={statsLoading}
          />
          <MetricCard
            variant="compact"
            icon={<UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />}
            color="blue"
            title="Nuevos"
            value={stats.nuevos}
            loading={statsLoading}
          />
          <MetricCard
            variant="compact"
            icon={<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />}
            color="amber"
            title="En proceso"
            value={computedStats.enProceso}
            loading={statsLoading}
          />
          <MetricCard
            variant="compact"
            icon={<Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />}
            color="purple"
            title="Citas"
            value={stats.citaAgendada}
            loading={statsLoading}
          />
          <MetricCard
            variant="compact"
            icon={<UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />}
            color="emerald"
            title="Convertidos"
            value={stats.convertidos}
            loading={statsLoading}
          />
        </div>

        {/* ── Table ── */}
        <div className="space-y-4">
          {/* Search + filters bar */}
          <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
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
          <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
            <ContentLoader
              loading={statsLoading}
              error={error}
              onRetry={refresh}
              isEmpty={leads.length === 0 && !isLoading}
              minHeight="min-h-[300px]"
              skeleton={<TableContentSkeleton rows={6} />}
              emptyState={
                <EmptyState
                  icon={Users}
                  size="lg"
                  title={search ? 'No se encontraron leads' : 'No hay leads registrados'}
                  description={search ? 'Intenta con otros términos de búsqueda' : 'Los leads aparecerán aquí cuando los pacientes envíen mensajes'}
                />
              }
            >
              <LeadsTable
                leads={leads}
                loading={isLoading}
                onRefresh={handleRefresh}
                onRowClick={handleRowClick}
                emptyMessage="No hay datos para mostrar"
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 border-t border-border px-4 sm:px-6 py-3 sm:py-4 bg-secondary/20">
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

      </div>{/* end main content */}

      {/* ── Drawer clínico (right panel) ── */}
      {selectedLead && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
            onClick={handleCloseSidebar}
          />
          <aside className="fixed top-0 right-0 z-50 h-full w-[340px] max-w-[90vw] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <LeadClinicSidebar
              lead={selectedLead}
              onClose={handleCloseSidebar}
            />
          </aside>
        </>
      )}

      </PageShell>
    </ErrorBoundary>
  );
}
