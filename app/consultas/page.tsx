'use client';

import { useMemo, useState, useCallback, memo } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Consulta } from '@/types/consultas';
import { useConsultas } from '@/hooks/useConsultas';
import { ContentLoader, TableContentSkeleton } from '@/app/components/common/ContentLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { typography, spacing, cards, inputs } from '@/app/lib/design-system';

export const dynamic = 'force-dynamic';

const SEDE_COLORS: Record<'POLANCO' | 'SATELITE', string> = {
  POLANCO: 'border border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-100',
  SATELITE: 'border border-cyan-400/60 bg-cyan-500/15 text-cyan-100',
};

// ✅ OPTIMIZACIÓN: Componente memoizado para tarjetas de estadísticas
interface StatCardProps {
  label: string;
  value: number;
  color: 'white' | 'blue' | 'emerald' | 'purple' | 'amber';
  icon: string;
  className?: string;
}

const StatCard = memo(({ label, value, color, icon, className = '' }: StatCardProps) => {
  const colorClasses = {
    white: 'bg-white/5 border-white/20 text-white',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 transition-all hover:scale-105 ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-white/60 font-medium">{label}</span>
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold">{value}</div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

// ✅ OPTIMIZACIÓN: Helper para crear filas de tabla optimizadas
const createConsultaRow = (consulta: Consulta) => ({
  id: consulta.id,
  paciente: (
    <div className="flex flex-col gap-1 min-w-[140px] sm:min-w-[180px]">
      <span className="font-medium text-white text-xs sm:text-sm leading-tight">{consulta.paciente}</span>
      <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wide">{consulta.tipo.replace('_', ' ')}</span>
    </div>
  ),
  sede: (
    <div className="flex justify-center sm:justify-start">
      <Badge label={consulta.sede} tone={SEDE_COLORS[consulta.sede]} />
    </div>
  ),
  estado: (
    <div className="flex justify-center sm:justify-start">
      <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
    </div>
  ),
  fecha: (
    <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]">
      <span className="text-white/80 font-medium text-[10px] sm:text-xs">
        {formatDate(consulta.fechaConsulta)}
      </span>
      <span className="text-white/50 text-[9px] sm:text-[10px]">
        {consulta.horaConsulta.slice(0, 5)} · {consulta.duracionMinutos}min
      </span>
    </div>
  ),
  confirmada: (
    <div className="flex items-center justify-center">
      {consulta.confirmadoPaciente ? (
        <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-500/15 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-emerald-300 border border-emerald-500/30 shadow-sm">
          <span className="text-sm sm:text-base">✓</span>
          <span className="hidden sm:inline">Sí</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-white/5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white/40 border border-white/10">
          <span className="text-sm sm:text-base">○</span>
          <span className="hidden sm:inline">No</span>
        </span>
      )}
    </div>
  ),
  detalle: (
    <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm max-w-[150px] sm:max-w-[200px]">
      <span className="text-white/70 line-clamp-2 text-[10px] sm:text-xs leading-tight">
        {consulta.motivoConsulta || 'Sin motivo registrado'}
      </span>
      <span className="text-white/50 text-[9px] sm:text-[10px] flex items-center gap-1">
        <span>📱</span>
        <span className="truncate">{consulta.canalOrigen || 'WhatsApp'}</span>
      </span>
    </div>
  ),
});

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
  const { consultas, loading, error, refetch, stats, metricas } = useConsultas();

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
            <input
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                debouncedSearch(event.target.value);
              }}
              placeholder="Buscar por paciente, folio o motivo"
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
                Listado de consultas
              </CardTitle>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Detalle operativo por paciente y sede'
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
          {/* Sección de estadísticas y filtros mejorada */}
          <div className="space-y-4">
            {/* Estadísticas en grid responsivo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              <StatCard
                label="Total"
                value={stats.total}
                color="white"
                icon="📊"
              />
              <StatCard
                label="Programadas"
                value={stats.programadas}
                color="blue"
                icon="📅"
              />
              <StatCard
                label="Confirmadas"
                value={stats.confirmadas}
                color="emerald"
                icon="✓"
              />
              <StatCard
                label="Hoy"
                value={stats.hoy}
                color="purple"
                icon="🕐"
              />
              <StatCard
                label="Esta semana"
                value={stats.semana}
                color="amber"
                icon="📆"
                className="col-span-2 sm:col-span-1"
              />
            </div>
            
            {/* Filtros de sede */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-white/50 flex items-center min-h-[36px]">Filtrar por sede:</span>
              {[
                { key: 'all' as const, label: 'Todas', icon: '🏢' },
                { key: 'POLANCO' as const, label: 'Polanco', icon: '🏥' },
                { key: 'SATELITE' as const, label: 'Satélite', icon: '🏨' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleSedeFilterChange(option.key)}
                  className={`rounded-lg px-4 py-2 border text-sm font-medium transition-all duration-200 min-h-[36px] flex items-center gap-2 ${
                    sedeFilter === option.key
                      ? 'bg-white/15 border-white/40 text-white shadow-lg scale-105'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.label.slice(0, 3)}</span>
                  {sedeFilter === option.key && <span className="text-xs opacity-60">({filteredConsultas.length})</span>}
                </button>
              ))}
            </div>
          </div>

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
            <DataTable
              headers={[
                { key: 'paciente', label: 'Paciente' },
                { key: 'sede', label: 'Sede' },
                { key: 'estado', label: 'Estado' },
                { key: 'fecha', label: 'Fecha y hora' },
                { key: 'confirmada', label: 'Confirmada' },
                { key: 'detalle', label: 'Detalle' },
              ]}
              rows={paginatedConsultas.map(createConsultaRow)}
              empty={search ? 'Sin coincidencias para el criterio aplicado.' : 'No hay consultas registradas aún.'}
              mobileConfig={{
                primary: 'paciente',
                secondary: 'fecha',
                metadata: ['sede', 'estado', 'confirmada']
              }}
            />
            
            {/* Paginación mejorada */}
            {filteredConsultas.length > itemsPerPage && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-white/60">
                    Mostrando <span className="font-semibold text-white">{currentPage * itemsPerPage + 1}</span> - <span className="font-semibold text-white">{Math.min((currentPage + 1) * itemsPerPage, filteredConsultas.length)}</span> de <span className="font-semibold text-white">{filteredConsultas.length}</span> consultas
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
