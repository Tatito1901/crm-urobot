'use client';

import { useMemo, useState, memo } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/app/lib/crm-data';
import { useRecordatorios } from '@/hooks/useRecordatorios';
import { spacing, cards } from '@/app/lib/design-system';

type TipoFilter = 'ALL' | '48h' | '24h' | '3h' | 'confirmacion_inicial';
type RangoFilter = 'ultimos_7' | 'ultimos_30' | 'todos';

export const dynamic = 'force-dynamic';

// Configuración de estados para badges

const ESTADO_COLORS = {
  pendiente: 'border-amber-400/60 bg-amber-500/15 text-amber-300',
  enviado: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300',
  error: 'border-red-400/60 bg-red-500/15 text-red-300',
} as const;

// ✅ Componente memoizado para tarjetas de estadísticas
interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;
  color: 'blue' | 'emerald' | 'red' | 'amber';
}

const StatCard = memo(({ label, value, description, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    red: 'bg-red-500/10 border-red-500/20 text-red-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  };

  return (
    <div className={`rounded-xl border p-4 sm:p-5 transition-all hover:scale-105 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-white/60 font-medium mb-1">{label}</p>
          <p className="text-3xl sm:text-4xl font-bold mb-1">{value}</p>
          <p className="text-[10px] sm:text-xs text-white/50">{description}</p>
        </div>
        <span className="text-3xl sm:text-4xl">{icon}</span>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default function ConfirmacionesPage() {
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFilter>('ALL');
  const [rangoFiltro, setRangoFiltro] = useState<RangoFilter>('ultimos_30');
  const [soloUltimo, setSoloUltimo] = useState(true);

  // ✅ OPTIMIZACIÓN: Debounce para búsqueda (300ms)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  // ✅ Datos reales de Supabase
  const { recordatorios, loading, error, refresh } = useRecordatorios();

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

    // Aplicar todos los filtros en una sola pasada
    const result = recordatorios.filter((r) => {
      // Filtro por rango de fechas
      if (fechaLimite && new Date(r.programado_para) < fechaLimite) {
        return false;
      }

      // Filtro por tipo de recordatorio
      if (tipoFiltro !== 'ALL' && r.tipo !== tipoFiltro) {
        return false;
      }

      // Filtro por búsqueda
      if (term) {
        const nombrePaciente = (r.paciente?.nombre_completo || '').toLowerCase();
        const consultaId = (r.consulta?.consulta_id || '').toLowerCase();
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
        const consultaId = r.consulta?.consulta_id;
        if (consultaId) {
          const existing = consultaMap.get(consultaId);
          if (!existing || new Date(r.programado_para) > new Date(existing.programado_para)) {
            consultaMap.set(consultaId, r);
          }
        }
      });
      return Array.from(consultaMap.values());
    }

    return result;
  }, [search, recordatorios, tipoFiltro, rangoFiltro, soloUltimo]);

  // Calcular estadísticas en una sola pasada
  const stats = useMemo(() => {
    return filtered.reduce((acc, item) => {
      if (item.estado === 'pendiente') acc.pendientes++;
      else if (item.estado === 'enviado') acc.enviados++;
      else if (item.estado === 'error') acc.errores++;
      return acc;
    }, { pendientes: 0, enviados: 0, errores: 0 });
  }, [filtered]);

  return (
    <PageShell
      accent
      eyebrow="Orquestación n8n"
      title="Confirmaciones y recordatorios"
      description="Automatización de follow-ups multicanal para reducir no-shows y asegurar la agenda del día."
    >
      {/* Estadísticas mejoradas */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard
          label="Pendientes"
          value={stats.pendientes}
          description="Aguardando confirmación"
          icon="⏳"
          color="amber"
        />
        <StatCard
          label="Enviados"
          value={stats.enviados}
          description="Recordatorios completados"
          icon="✅"
          color="emerald"
        />
        <StatCard
          label="Errores"
          value={stats.errores}
          description="Requieren revisión"
          icon="⚠️"
          color="red"
        />
      </section>

      {/* Filtros mejorados */}
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base sm:text-lg font-semibold text-white">Filtros de búsqueda</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-white/60">Personaliza la vista de recordatorios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">🔍</span>
            <input
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                debouncedSearch(event.target.value);
              }}
              placeholder="Buscar por paciente o consulta..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Grid de filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tipo de recordatorio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 flex items-center gap-1">
                <span>📋</span> Tipo de recordatorio
              </label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as TipoFilter)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="ALL" className="bg-gray-900">Todos los tipos</option>
                <option value="confirmacion_inicial" className="bg-gray-900">📧 Confirmación inicial</option>
                <option value="48h" className="bg-gray-900">⏰ 48 horas antes</option>
                <option value="24h" className="bg-gray-900">⏱️ 24 horas antes</option>
                <option value="3h" className="bg-gray-900">🔔 3 horas antes</option>
              </select>
            </div>

            {/* Rango de tiempo */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 flex items-center gap-1">
                <span>📅</span> Período de tiempo
              </label>
              <select
                value={rangoFiltro}
                onChange={(e) => setRangoFiltro(e.target.value as RangoFilter)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="ultimos_7" className="bg-gray-900">Últimos 7 días</option>
                <option value="ultimos_30" className="bg-gray-900">Últimos 30 días</option>
                <option value="todos" className="bg-gray-900">Todos</option>
              </select>
            </div>

            {/* Vista agrupada */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 flex items-center gap-1">
                <span>👁️</span> Vista
              </label>
              <label className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={soloUltimo}
                  onChange={(e) => setSoloUltimo(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-white/5 text-blue-500 cursor-pointer"
                />
                <span className="text-sm text-white/80 font-medium">Solo último</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Tabla de recordatorios */}
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg font-semibold text-white mb-1">
                Detalle de confirmaciones {loading && '(cargando...)'}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-white/60">
                {error 
                  ? `Error: ${error.message}` 
                  : 'Flujos automatizados por paciente desde n8n'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => refresh()}
                disabled={loading}
                className="rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ↻
              </button>
              <div className="flex flex-col items-end">
                <p className="text-2xl sm:text-3xl font-bold text-white">{filtered.length}</p>
                <p className="text-[10px] sm:text-xs text-white/50">
                  {recordatorios.length !== filtered.length && `de ${recordatorios.length} total`}
                  {soloUltimo && ' (último)'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Info adicional */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 pb-2 border-b border-white/10">
            <span className="flex items-center gap-1">
              <span>📊</span>
              <span className="hidden sm:inline">Mostrando</span>
              <span className="font-semibold text-white">{filtered.length}</span>
              <span className="hidden sm:inline">recordatorios</span>
            </span>
            {tipoFiltro !== 'ALL' && (
              <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
                {tipoFiltro.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          
          <DataTable
            headers={[
              { key: 'programado', label: 'Programado' },
              { key: 'paciente', label: 'Paciente' },
              { key: 'consulta', label: 'Consulta' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'estado', label: 'Estado' },
              { key: 'canal', label: 'Canal' },
            ]}
            rows={useMemo(() =>
              [...filtered]
                .sort((a, b) => new Date(b.programado_para).getTime() - new Date(a.programado_para).getTime())
                .map((recordatorio) => ({
                id: recordatorio.id,
                programado: (
                  <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[120px] sm:min-w-[140px]">
                    <span className="font-medium text-white text-[10px] sm:text-xs leading-tight">
                      {formatDate(recordatorio.programado_para, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {recordatorio.enviado_en && (
                      <span className="text-[9px] sm:text-[10px] text-white/50">
                        Enviado: {formatDate(recordatorio.enviado_en, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                ),
                paciente: (
                  <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[140px] sm:min-w-[180px]">
                    <span className="font-medium text-white text-xs sm:text-sm leading-tight">
                      {recordatorio.paciente?.nombre_completo || 'Sin paciente'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wide">
                      {recordatorio.consulta?.sede || ''}
                    </span>
                  </div>
                ),
                consulta: (
                  <span className="font-semibold text-white text-xs sm:text-sm">
                    {recordatorio.consulta?.consulta_id || 'N/A'}
                  </span>
                ),
                tipo: (
                  <div className="flex justify-center sm:justify-start">
                    <Badge label={recordatorio.tipo.replace(/_/g, ' ')} />
                  </div>
                ),
                estado: (
                  <div className="flex justify-center sm:justify-start">
                    <Badge label={recordatorio.estado || 'pendiente'} tone={ESTADO_COLORS[recordatorio.estado as keyof typeof ESTADO_COLORS] || ESTADO_COLORS.pendiente} />
                  </div>
                ),
                canal: (
                  <div className="flex justify-center sm:justify-start">
                    <Badge label={recordatorio.canal || 'whatsapp'} />
                  </div>
                ),
              })), [filtered])}
            empty={search ? 'Sin coincidencias para el criterio aplicado.' : 'No hay recordatorios registrados aún.'}
            mobileConfig={{
              primary: 'paciente',
              secondary: 'programado',
              metadata: ['tipo', 'estado', 'canal']
            }}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
