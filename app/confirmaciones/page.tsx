'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import { useRecordatorios } from '@/hooks/useRecordatorios';

type TipoFilter = 'ALL' | '48h' | '24h' | '3h' | 'confirmacion_inicial';
type RangoFilter = 'ultimos_7' | 'ultimos_30' | 'todos';

export default function ConfirmacionesPage() {
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoFilter>('ALL');
  const [rangoFiltro, setRangoFiltro] = useState<RangoFilter>('ultimos_30');
  const [soloUltimo, setSoloUltimo] = useState(true);

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
      headerSlot={
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Buscar</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">
                Paciente o consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 pt-0">
              <span className="text-white/50">🔍</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Tipo</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">
                Filtrar recordatorio
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as TipoFilter)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="48h">48 horas</option>
                <option value="24h">24 horas</option>
                <option value="3h">3 horas</option>
                <option value="confirmacion_inicial">Confirmación inicial</option>
              </select>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Rango</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">
                Período de tiempo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <select
                value={rangoFiltro}
                onChange={(e) => setRangoFiltro(e.target.value as RangoFilter)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="ultimos_7">Últimos 7 días</option>
                <option value="ultimos_30">Últimos 30 días</option>
                <option value="todos">Todos</option>
              </select>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Vista</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">
                Agrupar por consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloUltimo}
                  onChange={(e) => setSoloUltimo(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <span className="text-sm text-white/80">Solo último</span>
              </label>
            </CardContent>
          </Card>
        </div>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Pendientes</CardTitle>
            <CardDescription>Aguardando confirmación</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{stats.pendientes}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Enviados</CardTitle>
            <CardDescription>Recordatorios completados</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{stats.enviados}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Errores</CardTitle>
            <CardDescription>Requieren revisión</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{stats.errores}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex-1">
              <CardTitle className="text-base text-white">
                Detalle de confirmaciones {loading && '(cargando...)'}
              </CardTitle>
              <CardDescription>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Flujos automatizados por paciente desde n8n'
                }
              </CardDescription>
            </div>
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 transition-colors"
            >
              ↻
            </button>
            <div className="text-right ml-4">
              <p className="text-2xl font-semibold text-white">{filtered.length}</p>
              <p className="text-xs text-white/50">
                {recordatorios.length !== filtered.length && `de ${recordatorios.length} total`}
                {soloUltimo && ' (último por consulta)'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white">{formatDate(recordatorio.programado_para, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {recordatorio.enviado_en && (
                      <span className="text-xs text-white/50">Enviado: {formatDate(recordatorio.enviado_en, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    )}
                  </div>
                ),
                paciente: (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white/90">{recordatorio.paciente?.nombre_completo || 'Sin paciente'}</span>
                    <span className="text-xs text-white/50">{recordatorio.consulta?.sede || ''}</span>
                  </div>
                ),
                consulta: <span className="font-semibold text-white">{recordatorio.consulta?.consulta_id || 'N/A'}</span>,
                tipo: <Badge label={recordatorio.tipo.replace(/_/g, ' ')} />,
                estado: <Badge label={recordatorio.estado || 'pendiente'} tone={STATE_COLORS[recordatorio.estado || 'pendiente']} />,
                canal: <Badge label={recordatorio.canal || 'whatsapp'} />,
              })), [filtered])}
            empty={filtered.length === 0 ? 'No hay recordatorios para mostrar.' : 'Sin resultados.'}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
