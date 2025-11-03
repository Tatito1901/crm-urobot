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

  // ✅ Datos reales de Supabase con real-time
  const { recordatorios, loading, error } = useRecordatorios();

  const filtered = useMemo(() => {
    let result = recordatorios;

    // Filtro por rango de fechas
    const now = new Date();
    if (rangoFiltro === 'ultimos_7') {
      const hace7Dias = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(r => new Date(r.programado_para) >= hace7Dias);
    } else if (rangoFiltro === 'ultimos_30') {
      const hace30Dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(r => new Date(r.programado_para) >= hace30Dias);
    }

    // Filtro por tipo de recordatorio
    if (tipoFiltro !== 'ALL') {
      result = result.filter((r) => r.tipo === tipoFiltro);
    }

    // Filtro por búsqueda
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((recordatorio) => {
        const nombrePaciente = recordatorio.paciente?.nombre_completo || '';
        const consultaId = recordatorio.consulta?.consulta_id || '';
        return [nombrePaciente, consultaId].some((field) => field.toLowerCase().includes(term));
      });
    }

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
      result = Array.from(consultaMap.values());
    }

    return result;
  }, [search, recordatorios, tipoFiltro, rangoFiltro, soloUltimo]);

  const pendientes = filtered.filter((item) => item.estado === 'pendiente').length;
  const enviados = filtered.filter((item) => item.estado === 'enviado').length;
  const errores = filtered.filter((item) => item.estado === 'error').length;

  return (
    <PageShell
      accent
      eyebrow="Orquestación n8n"
      title="Confirmaciones y recordatorios"
      description="Automatización de follow-ups multicanal para reducir no-shows y asegurar la agenda del día."
      headerSlot={
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Buscar</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">
                Paciente o consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 pt-0">
              <span className="text-white/40">🔍</span>
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
      <section className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-3">
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Pendientes</CardTitle>
            <CardDescription>Aguardando confirmación</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{pendientes}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Enviados</CardTitle>
            <CardDescription>Recordatorios completados</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{enviados}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Errores</CardTitle>
            <CardDescription>Requieren revisión</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{errores}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">
                Detalle de confirmaciones {loading && '(cargando...)'}
              </CardTitle>
              <CardDescription>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Flujos automatizados por paciente · Datos en tiempo real desde n8n'
                }
              </CardDescription>
            </div>
            <div className="text-right">
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
            rows={filtered
              .slice()
              .sort((a, b) => new Date(b.programado_para).getTime() - new Date(a.programado_para).getTime())
              .map((recordatorio) => ({
                id: recordatorio.id,
                programado: (
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{formatDate(recordatorio.programado_para, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {recordatorio.enviado_en && (
                      <span className="text-xs text-white/50">Enviado: {formatDate(recordatorio.enviado_en, { dateStyle: 'short', timeStyle: 'short' })}</span>
                    )}
                  </div>
                ),
                paciente: (
                  <div className="flex flex-col">
                    <span className="text-white/90 font-medium">{recordatorio.paciente?.nombre_completo || 'Sin paciente'}</span>
                    <span className="text-xs text-white/50">{recordatorio.consulta?.sede || ''}</span>
                  </div>
                ),
                consulta: <span className="font-semibold text-white">{recordatorio.consulta?.consulta_id || 'N/A'}</span>,
                tipo: <Badge label={recordatorio.tipo.replace(/_/g, ' ')} />,
                estado: <Badge label={recordatorio.estado || 'pendiente'} tone={STATE_COLORS[recordatorio.estado || 'pendiente']} />,
                canal: <Badge label={recordatorio.canal || 'whatsapp'} />,
              }))}
            empty={filtered.length === 0 ? 'No hay recordatorios para mostrar.' : 'Sin resultados.'}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
