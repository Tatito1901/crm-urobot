'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
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
import { Users, UserPlus, Clock, Calendar, CalendarCheck, UserCheck, Loader2, Stethoscope, ArrowRight } from 'lucide-react';
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
    fuenteFilter,
    setFuenteFilter,
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

  const selectedIndex = useMemo(
    () => leads.findIndex(l => l.id === selectedLeadId),
    [leads, selectedLeadId]
  );

  const handleRowClick = useCallback((leadId: string) => {
    setSelectedLeadId(prev => prev === leadId ? null : leadId);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelectedLeadId(null);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const idx = leads.findIndex(l => l.id === selectedLeadId);
    if (idx === -1) return;
    const newIdx = direction === 'prev' ? idx - 1 : idx + 1;
    if (newIdx >= 0 && newIdx < leads.length) {
      setSelectedLeadId(leads[newIdx].id);
    }
  }, [leads, selectedLeadId]);

  // Cerrar drawer con Escape
  useEffect(() => {
    if (!selectedLeadId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLeadId(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedLeadId]);

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
        title={<span className="text-gradient-teal">Leads</span>}
        description="Gestiona y da seguimiento a tus prospectos"
        headerSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeadId(prev => prev ? null : leads[0]?.id ?? null)}
              className={`p-2 rounded-lg transition-colors ${
                selectedLeadId
                  ? 'bg-teal-500/10 text-teal-400'
                  : 'hover:bg-secondary text-muted-foreground'
              }`}
              aria-label="Panel clínico"
              aria-pressed={!!selectedLeadId}
            >
              <Stethoscope className="w-4 h-4" aria-hidden />
            </button>
            <RefreshButton onClick={handleRefresh} loading={isLoading} />
          </div>
        }
      >

      {/* Ambient background gradient */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30 z-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(20, 184, 166, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-[1] space-y-4">

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 animate-fade-up stagger-1">
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
            title="Cita ofrecida"
            value={stats.citaPropuesta}
            loading={statsLoading}
            tooltip="Leads a los que se les ofreci\u00f3 cita"
          />
          <MetricCard
            variant="compact"
            icon={<CalendarCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />}
            color="emerald"
            title="Cita agendada"
            value={stats.citaAgendada}
            loading={statsLoading}
            tooltip="Leads que agendaron cita"
          />
          <MetricCard
            variant="compact"
            icon={<UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-500" />}
            color="teal"
            title="Convertidos"
            value={stats.convertidos}
            loading={statsLoading}
          />
        </div>

        {/* ── Conversion funnel mini-bar ── */}
        {(stats.citasOfrecidasTotal > 0 || stats.citasAgendadasTotal > 0) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground animate-fade-up stagger-2">
            <span className="font-medium text-foreground">{stats.total}</span> leads
            <ArrowRight className="w-3 h-3" />
            <span className="font-medium text-purple-400">{stats.citasOfrecidasTotal}</span> ofrecidas
            <ArrowRight className="w-3 h-3" />
            <span className="font-medium text-emerald-400">{stats.citasAgendadasTotal}</span> agendadas
            {stats.tasaOfertaAAgenda > 0 && (
              <span className="ml-auto font-semibold text-emerald-400">
                {stats.tasaOfertaAAgenda}% conversi\u00f3n
              </span>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div className="space-y-4 animate-fade-up stagger-2">
          {/* Search + filters bar */}
          <div className="bg-card p-3 sm:p-4 rounded-xl border border-border shadow-sm space-y-2 shine-top relative overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <LeadsFilters
                  currentFilter={estadoFilter === '' ? 'all' : estadoFilter as 'nuevo' | 'interactuando' | 'contactado' | 'cita_propuesta' | 'cita_agendada' | 'perdido'}
                  onFilterChange={handleFilterChange}
                  searchValue={search}
                  onSearchChange={setSearch}
                  fuenteFilter={fuenteFilter}
                  onFuenteChange={setFuenteFilter}
                />
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground shrink-0">
                <span className="tabular-nums font-medium text-foreground">{totalCount}</span>
                <span className="hidden sm:inline">leads</span>
                {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              </div>
            </div>
          </div>

          {/* Table card */}
          <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm glow-ring-teal">
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
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Panel clínico del lead"
            aria-modal="true"
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] sm:max-w-[90vw] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
          >
            <LeadClinicSidebar
              lead={selectedLead}
              onClose={handleCloseSidebar}
              onNavigate={handleNavigate}
              hasPrev={selectedIndex > 0}
              hasNext={selectedIndex < leads.length - 1}
              onRefresh={handleRefresh}
            />
          </aside>
        </>
      )}

      </PageShell>
    </ErrorBoundary>
  );
}
