'use client';

import { useMemo, useState } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecordatorios } from '@/hooks/useRecordatorios';
import { spacing, cards } from '@/app/lib/design-system';
import { Pagination } from '@/app/components/common/Pagination';
import { Search, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ConfirmacionesTable } from './components/ConfirmacionesTable';
import { ConfirmacionesMetrics } from './components/ConfirmacionesMetrics';

type TipoFilter = 'ALL' | '48h' | '24h' | '3h' | 'confirmacion_inicial';
type RangoFilter = 'ultimos_7' | 'ultimos_30' | 'todos';

export default function ConfirmacionesPage() {
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFilter>('ALL');
  const [rangoFiltro, setRangoFiltro] = useState<RangoFilter>('ultimos_30');
  const [soloUltimo, setSoloUltimo] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 50;

  // ✅ OPTIMIZACIÓN: Debounce para búsqueda (300ms)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setCurrentPage(0); // Resetear página al buscar
  }, 300);

  // ✅ Datos reales de Supabase
  const { recordatorios, loading, refresh } = useRecordatorios();

  const filtered = useMemo(() => {
    const now = new Date();
    const term = search.trim().toLowerCase();

    // Calcular fecha límite una sola vez
    let fechaLimite: Date | null = null;
    if (rangoFiltro === 'ultimos_7') {
      fechaLimite = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (rangoFiltro === 'ultimos_30') {
      fechaLimite = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Helper para extraer tipo de metadata
    const getTipo = (r: typeof recordatorios[0]) => {
      return (r.metadata as { tipo?: string } | null)?.tipo || '';
    };

    // Aplicar todos los filtros en una sola pasada
    const result = recordatorios.filter((r) => {
      // Filtro por rango de fechas
      const fechaNotif = r.nextAttemptAt ? new Date(r.nextAttemptAt) : new Date(r.createdAt || 0);
      if (fechaLimite && fechaNotif < fechaLimite) {
        return false;
      }

      // Filtro por tipo de recordatorio (extraído de metadata)
      if (tipoFiltro !== 'ALL') {
        const tipo = getTipo(r);
        if (tipo !== tipoFiltro) {
          return false;
        }
      }

      // Filtro por búsqueda
      if (term) {
        const nombrePaciente = (r.pacienteNombre || '').toLowerCase();
        const consultaId = (r.consultaId || '').toLowerCase();
        if (!nombrePaciente.includes(term) && !consultaId.includes(term)) {
          return false;
        }
      }

      return true;
    });

    // Mostrar solo el último recordatorio por consulta
    if (soloUltimo) {
      const consultaMap = new Map<string, typeof result[0]>();
      result.forEach((r) => {
        const consultaId = r.consultaId;
        if (consultaId) {
          const existing = consultaMap.get(consultaId);
          const fechaR = r.nextAttemptAt ? new Date(r.nextAttemptAt) : new Date(0);
          const fechaExisting = existing?.nextAttemptAt ? new Date(existing.nextAttemptAt) : new Date(0);
          if (!existing || fechaR > fechaExisting) {
            consultaMap.set(consultaId, r);
          }
        }
      });
      return Array.from(consultaMap.values());
    }

    return result;
  }, [search, recordatorios, tipoFiltro, rangoFiltro, soloUltimo]);

  // ✅ Lógica de Paginación
  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    // Ordenar antes de paginar por nextAttemptAt o createdAt
    return [...filtered]
      .sort((a, b) => {
        const fechaA = a.nextAttemptAt ? new Date(a.nextAttemptAt).getTime() : 0;
        const fechaB = b.nextAttemptAt ? new Date(b.nextAttemptAt).getTime() : 0;
        return fechaB - fechaA;
      })
      .slice(start, end);
  }, [filtered, currentPage, itemsPerPage]);

  // Calcular estadísticas en una sola pasada (usa status, no estado)
  const stats = useMemo(() => {
    return filtered.reduce((acc, item) => {
      if (item.status === 'pending') acc.pendientes++;
      else if (item.status === 'sent') acc.enviados++;
      else if (item.status === 'failed') acc.errores++;
      return acc;
    }, { pendientes: 0, enviados: 0, errores: 0 });
  }, [filtered]);

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Orquestación n8n"
      title="Confirmaciones y recordatorios"
      description="Automatización de follow-ups multicanal para reducir no-shows y asegurar la agenda del día."
    >
      {/* Estadísticas mejoradas y consistentes */}
      <ConfirmacionesMetrics stats={stats} />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Panel Lateral de Filtros (Sticky en desktop) */}
        <div className="space-y-6">
          <Card className={`${cards.base} lg:sticky lg:top-6`}>
            <CardHeader className={spacing.cardHeader}>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Búsqueda */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Búsqueda rápida</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                  <input
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                      debouncedSearch(event.target.value);
                    }}
                    placeholder="Paciente o consulta..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950/50 border border-border rounded-md text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Tipo de recordatorio</Label>
                <Select
                  value={tipoFiltro}
                  onValueChange={(value) => {
                    setTipoFiltro(value as TipoFilter);
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los tipos</SelectItem>
                    <SelectItem value="confirmacion_inicial">Confirmación inicial</SelectItem>
                    <SelectItem value="48h">48 horas antes</SelectItem>
                    <SelectItem value="24h">24 horas antes</SelectItem>
                    <SelectItem value="3h">3 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rango */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Período
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { value: 'ultimos_7', label: '7 días' },
                    { value: 'ultimos_30', label: '30 días' },
                    { value: 'todos', label: 'Historico' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setRangoFiltro(opt.value as RangoFilter);
                        setCurrentPage(0);
                      }}
                      className={`px-3 py-1.5 text-xs text-left rounded-md transition-colors ${
                        rangoFiltro === opt.value
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
                          : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agrupación */}
              <div className="pt-4 border-t border-border/50">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${soloUltimo ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500 bg-white dark:bg-transparent'}`}>
                    {soloUltimo && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={soloUltimo}
                    onChange={(e) => {
                      setSoloUltimo(e.target.checked);
                      setCurrentPage(0);
                    }}
                    className="hidden"
                  />
                  <span className="text-xs text-foreground group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Ver solo último envío</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla Principal */}
        <div className="min-w-0">
          <Card className={cards.base}>
            <CardHeader className={spacing.cardHeader}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Historial de envíos
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {filtered.length} registros encontrados
                  </CardDescription>
                </div>
                <button
                  onClick={() => refresh()}
                  disabled={loading}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  <div className={loading ? 'animate-spin' : ''}>↻</div>
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ConfirmacionesTable 
                recordatorios={paginatedData}
                emptyMessage={search ? 'Sin coincidencias.' : 'No hay recordatorios.'}
              />
              
              {/* Paginación */}
              {filtered.length > itemsPerPage && (
                <div className="border-t border-border/50 p-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
