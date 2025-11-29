'use client';

import { useMemo, useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { usePacientes } from '@/hooks/usePacientes';
import { ContentLoader } from '@/app/components/common/ContentLoader';
import { TableContentSkeleton } from '@/app/components/common/SkeletonLoader';
import { Pagination } from '@/app/components/common/Pagination';
import { cards } from '@/app/lib/design-system';
import { Users, UserCheck, UserPlus, AlertCircle, Search, RefreshCw } from 'lucide-react';
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

// Métricas compactas en línea
const PacientesMetrics = memo(({ stats, loading }: { stats: PacientesStats, loading: boolean }) => {
  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const metrics = [
    { icon: Users, value: stats.total, label: 'Total', color: 'text-slate-600 dark:text-slate-300' },
    { icon: UserCheck, value: stats.activos, label: 'Activos', color: 'text-emerald-600 dark:text-emerald-400' },
    { icon: UserPlus, value: stats.recientes, label: 'Nuevos', color: 'text-blue-600 dark:text-blue-400' },
    { icon: AlertCircle, value: stats.requierenAtencion, label: 'Atención', color: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-2 text-sm">
          <m.icon className={`w-4 h-4 ${m.color}`} />
          <span className="font-semibold text-foreground">{m.value}</span>
          <span className="text-muted-foreground text-xs">{m.label}</span>
        </div>
      ))}
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
      const nombre = (paciente.nombre || paciente.nombreCompleto || '').toLowerCase();
      const telefono = paciente.telefono;
      const email = (paciente.email || '').toLowerCase();
      
      return nombre.includes(term) || telefono.includes(term) || email.includes(term);
    });
  }, [search, pacientes]);

  // Paginación con 10 items por página
  const itemsPerPage = 10;
  
  // Estado filter
  const [estadoFilter, setEstadoFilter] = useState<'all' | 'Activo' | 'Inactivo'>('all');
  
  // Filtrado por estado
  const filteredByEstado = useMemo(() => {
    if (estadoFilter === 'all') return filteredPacientes;
    return filteredPacientes.filter(p => p.estado === estadoFilter);
  }, [filteredPacientes, estadoFilter]);
  
  // Paginación
  const paginatedPacientes = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredByEstado.slice(start, start + itemsPerPage);
  }, [filteredByEstado, currentPage]);
  
  const handleEstadoFilterChange = useCallback((newFilter: typeof estadoFilter) => {
    setEstadoFilter(newFilter);
    setCurrentPage(0);
  }, []);

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
            {/* Barra de búsqueda larga */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                placeholder="Buscar por nombre, teléfono o correo..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Métricas inline */}
            <PacientesMetrics stats={stats} loading={loading} />
          </div>

          {/* Filtros y acciones */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              {/* Filtros de estado */}
              <div className="flex bg-muted rounded-lg p-0.5 border border-border">
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

              <span className="text-xs text-muted-foreground">
                {filteredByEstado.length} pacientes
              </span>
            </div>

            <button
              onClick={() => refetch()}
              disabled={loading}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabla */}
        <CardContent className="p-0">
          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredPacientes.length === 0}
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
              pacientes={paginatedPacientes}
              emptyMessage={search ? 'Sin coincidencias.' : 'No hay pacientes.'}
              onHover={handlePacienteHover}
            />
            
            {/* Paginación Reutilizable Consistente */}
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredByEstado.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </ContentLoader>
        </CardContent>
      </Card>
    </PageShell>
  );
}
