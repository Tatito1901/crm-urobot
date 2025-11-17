'use client';

import { useMemo, useState, useCallback } from 'react';
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

  // ✅ OPTIMIZACIÓN: Paginación
  const itemsPerPage = 50;
  const paginatedConsultas = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredConsultas.slice(start, end);
  }, [filteredConsultas, currentPage, itemsPerPage]);

  const handleSedeFilterChange = useCallback((newFilter: typeof sedeFilter) => {
    setSedeFilter(newFilter);
    setCurrentPage(0);
  }, []);
  
  // Calcular consultas futuras para las métricas de confirmación
  const consultasFuturas = useMemo(() => {
    return consultas.filter(c => c.horasHastaConsulta !== null && c.horasHastaConsulta > 0);
  }, [consultas]);

  return (
    <PageShell
      accent
      eyebrow="Consultas"
      title="Agenda centralizada"
      description="Controla el pipeline de citas: KPIs operativos y detalle por paciente."
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
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-white/70">
              <span className="rounded-full bg-white/5 px-3 py-1">
                Total:
                <span className="ml-1 font-semibold text-white">{stats.total}</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1">
                Programadas:
                <span className="ml-1 font-semibold text-blue-300">{stats.programadas}</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1">
                Confirmadas:
                <span className="ml-1 font-semibold text-emerald-300">{stats.confirmadas}</span>
              </span>
              <span className="rounded-full bg-purple-500/10 px-3 py-1">
                Hoy:
                <span className="ml-1 font-semibold text-purple-300">{stats.hoy}</span>
              </span>
              <span className="rounded-full bg-amber-500/10 px-3 py-1">
                Esta semana:
                <span className="ml-1 font-semibold text-amber-300">{stats.semana}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              {[
                { key: 'all' as const, label: 'Todas' },
                { key: 'POLANCO' as const, label: 'Polanco' },
                { key: 'SATELITE' as const, label: 'Satélite' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleSedeFilterChange(option.key)}
                  className={`rounded-full px-3 py-1 border text-xs sm:text-[11px] transition-all duration-200 min-h-[32px] ${
                    sedeFilter === option.key
                      ? 'bg-white/15 border-white/40 text-white shadow-sm'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alertas de Confirmación Urgentes */}
          {metricas.confirmaciones.requierenAtencion > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-300 mb-1">
                    {metricas.confirmaciones.requierenAtencion} {metricas.confirmaciones.requierenAtencion === 1 ? 'consulta requiere' : 'consultas requieren'} confirmación urgente
                  </h3>
                  <p className="text-xs text-white/60">
                    Consultas en las próximas 48 horas sin confirmar. Envía recordatorios cuanto antes.
                  </p>
                  {metricas.confirmaciones.vencidas > 0 && (
                    <p className="text-xs text-amber-400 mt-2">
                      🔴 {metricas.confirmaciones.vencidas} con fecha límite vencida
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Métricas de Confirmación */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <span>🔔</span> Estado de confirmaciones
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Confirmadas</span>
                  <span className="text-xs font-medium text-emerald-400">{metricas.confirmaciones.confirmadas}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${consultasFuturas.length > 0 ? (metricas.confirmaciones.confirmadas / consultasFuturas.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Pendientes</span>
                  <span className="text-xs font-medium text-blue-400">{metricas.confirmaciones.pendientes}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${consultasFuturas.length > 0 ? (metricas.confirmaciones.pendientes / consultasFuturas.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Urgentes</span>
                  <span className="text-xs font-medium text-amber-400">{metricas.confirmaciones.requierenAtencion}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${consultasFuturas.length > 0 ? (metricas.confirmaciones.requierenAtencion / consultasFuturas.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Vencidas</span>
                  <span className="text-xs font-medium text-red-400">{metricas.confirmaciones.vencidas}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${consultasFuturas.length > 0 ? (metricas.confirmaciones.vencidas / consultasFuturas.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">No confirm</span>
                  <span className="text-xs font-medium text-white/70">{metricas.confirmaciones.noConfirmadas}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/30 rounded-full transition-all duration-500"
                    style={{ width: `${consultasFuturas.length > 0 ? (metricas.confirmaciones.noConfirmadas / consultasFuturas.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Recordatorios */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/60 mb-2">Recordatorios enviados:</p>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-white/60">Inicial: </span>
                  <span className="font-medium text-blue-400">{metricas.recordatorios.inicialEnviado}</span>
                </div>
                <div>
                  <span className="text-white/60">48h: </span>
                  <span className="font-medium text-purple-400">{metricas.recordatorios.rem48h}</span>
                </div>
                <div>
                  <span className="text-white/60">24h: </span>
                  <span className="font-medium text-emerald-400">{metricas.recordatorios.rem24h}</span>
                </div>
                <div>
                  <span className="text-white/60">3h: </span>
                  <span className="font-medium text-amber-400">{metricas.recordatorios.rem3h}</span>
                </div>
                {metricas.recordatorios.sinEnviar > 0 && (
                  <div>
                    <span className="text-white/60">Sin enviar: </span>
                    <span className="font-medium text-red-400">{metricas.recordatorios.sinEnviar}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métricas Operativas - Específicas de Consultas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4 border-b border-white/10">
            {/* Tasa de Confirmación */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Tasa de confirmación</span>
                <span className="text-xs text-emerald-400 font-medium">{metricas.tasaConfirmacion}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${metricas.tasaConfirmacion}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/40 mt-1.5">
                {stats.confirmadas} de {stats.total} consultas
              </p>
            </div>

            {/* Tasa de Asistencia */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Tasa de asistencia</span>
                <span className="text-xs text-blue-400 font-medium">{metricas.tasaAsistencia}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${metricas.tasaAsistencia}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/40 mt-1.5">
                {stats.completadas} asistieron
              </p>
            </div>

            {/* Duración Promedio */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Duración promedio</span>
                <span className="text-xs text-purple-400 font-medium">{metricas.promedioDuracion} min</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((metricas.promedioDuracion / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/40 mt-1.5">
                Por consulta
              </p>
            </div>

            {/* Tasa de Cancelación */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Tasa de cancelación</span>
                <span className="text-xs text-amber-400 font-medium">{metricas.tasaCancelacion}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${metricas.tasaCancelacion}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/40 mt-1.5">
                {stats.canceladas} canceladas
              </p>
            </div>
          </div>

          {/* Distribución por Sede y Tipo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Distribución por Sede */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-sm font-medium text-white mb-3">Distribución por sede</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Polanco</span>
                    <span className="text-xs font-medium text-fuchsia-400">{metricas.porSede.polanco}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-fuchsia-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (metricas.porSede.polanco / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Satélite</span>
                    <span className="text-xs font-medium text-cyan-400">{metricas.porSede.satelite}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (metricas.porSede.satelite / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tipo de Consulta */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-sm font-medium text-white mb-3">Tipo de consulta</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Primera vez</span>
                    <span className="text-xs font-medium text-blue-400">{metricas.primeraVez}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (metricas.primeraVez / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Seguimiento</span>
                    <span className="text-xs font-medium text-emerald-400">{metricas.seguimiento}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (metricas.seguimiento / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
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
                { key: 'detalle', label: 'Detalle' },
              ]}
              rows={paginatedConsultas.map((consulta: Consulta) => ({
                id: consulta.id,
                paciente: (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white">{consulta.paciente}</span>
                    <span className="text-xs text-white/40">{consulta.tipo}</span>
                  </div>
                ),
                sede: (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label={consulta.sede} tone={SEDE_COLORS[consulta.sede]} />
                    {consulta.confirmadoPaciente && (
                      <span className="text-[10px] font-medium text-emerald-300">✓ Confirmado</span>
                    )}
                  </div>
                ),
                estado: <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />,
                fecha: (
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-white/70">
                      {formatDate(consulta.fechaConsulta)}
                    </span>
                    <span className="text-white/50">
                      {consulta.horaConsulta} · {consulta.duracionMinutos}min
                    </span>
                  </div>
                ),
                detalle: (
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-white/70">
                      {consulta.motivoConsulta || 'Sin motivo registrado'}
                    </span>
                    <span className="text-white/50">
                      {consulta.canalOrigen || 'WhatsApp'}
                    </span>
                  </div>
                ),
              }))}
              empty={search ? 'Sin coincidencias para el criterio aplicado.' : 'No hay consultas registradas aún.'}
              mobileConfig={{
                primary: 'paciente',
                secondary: 'fecha',
                metadata: ['sede', 'estado']
              }}
            />
            
            {/* Paginación */}
            {filteredConsultas.length > itemsPerPage && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredConsultas.length}
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
