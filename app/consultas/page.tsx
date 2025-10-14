'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { mockData, STATE_COLORS, formatDate } from '@/app/lib/crm-data';

type SedeFilter = 'ALL' | 'POLANCO' | 'SATELITE';

export default function ConsultasPage() {
  const [search, setSearch] = useState('');
  const [sede, setSede] = useState<SedeFilter>('ALL');

  const filteredConsultas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mockData.consultas.filter((consulta) => {
      if (sede !== 'ALL' && consulta.sede !== sede) return false;
      if (!term) return true;
      return [consulta.paciente, consulta.id].some((field) => field.toLowerCase().includes(term));
    });
  }, [search, sede]);

  const total = filteredConsultas.length;
  const confirmadas = filteredConsultas.filter((c) => c.estado === 'Confirmada').length;
  const pendientes = filteredConsultas.filter((c) => c.estado === 'Programada').length;
  const reagendadas = filteredConsultas.filter((c) => c.estado === 'Reagendada').length;

  return (
    <PageShell
      accent={false}
      eyebrow="Consultas"
      title="Consultas programadas"
      description="Controla el pipeline de citas: filtra, revisa KPIs y comparte el detalle operativo."
      headerSlot={
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em]">Buscar</CardTitle>
              <CardDescription className="text-[0.68rem]">Paciente o folio</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 pt-0">
              <span className="text-slate-500">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por paciente o folio"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em]">Sede</CardTitle>
              <CardDescription className="text-[0.68rem]">Filtra por ubicación</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <select
                value={sede}
                onChange={(e) => setSede(e.target.value as SedeFilter)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <option value="ALL">Todas las sedes</option>
                <option value="POLANCO">Polanco</option>
                <option value="SATELITE">Satélite</option>
              </select>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Agenda centralizada</CardTitle>
          <CardDescription>Administra la disponibilidad completa desde una vista dedicada.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Accede a la agenda estilo Doctoralia para planear por semana o día con filtros avanzados.
          </p>
          <Link
            href="/agenda"
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
          >
            Abrir agenda
          </Link>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Consultas filtradas" value={total} hint="Total" />
        <MetricCard title="Confirmadas" value={confirmadas} badge="confirmadas" />
        <MetricCard title="Programadas" value={pendientes} badge="programadas" />
        <MetricCard title="Reagendadas" value={reagendadas} badge="reagendadas" />
      </section>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado de consultas</CardTitle>
          <CardDescription>Detalle operativo por paciente y sede</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="hidden overflow-hidden md:block">
            <DataTable
              headers={[
                { key: 'consulta', label: 'Consulta' },
                { key: 'paciente', label: 'Paciente' },
                { key: 'sede', label: 'Sede' },
                { key: 'estado', label: 'Estado' },
                { key: 'fecha', label: 'Fecha' },
                { key: 'acciones', label: 'Acciones' },
              ]}
              rows={filteredConsultas.map((c) => ({
                id: c.id,
                consulta: (
                  <div className="flex flex-col">
                    <span className="font-medium">{c.id}</span>
                    <span className="text-xs text-slate-500">{c.tipo}</span>
                  </div>
                ),
                paciente: <span className="text-slate-800">{c.paciente}</span>,
                sede: <Badge label={c.sede.toLowerCase()} />,
                estado: <Badge label={c.estado} tone={STATE_COLORS[c.estado]} />,
                fecha: <span>{formatDate(c.fecha)}</span>,
                acciones: (
                  <a
                    href={c.calendarLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-600"
                  >
                    Ver en calendario <span aria-hidden>↗</span>
                  </a>
                ),
              }))}
              empty={
                filteredConsultas.length === 0
                  ? 'No hay consultas para los filtros seleccionados.'
                  : 'Sin resultados.'
              }
            />
          </div>

          <div className="md:hidden">
            {filteredConsultas.length === 0 ? (
              <p className="rounded-xl border bg-slate-50 px-4 py-6 text-center text-slate-500">
                No hay consultas para los filtros seleccionados.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredConsultas.map((c) => (
                  <article key={c.id} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
                    <header className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Consulta</p>
                        <p className="text-lg font-semibold">{c.id}</p>
                      </div>
                      <Badge label={c.estado} tone={STATE_COLORS[c.estado]} className="text-[0.65rem]" />
                    </header>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Paciente:</span> {c.paciente}
                      </p>
                      <p className="flex items-center gap-2">
                        <Badge label={c.sede.toLowerCase()} className="text-[0.65rem]" />
                        <span className="text-slate-500">{c.tipo}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">Fecha:</span> {formatDate(c.fecha)}
                      </p>
                    </div>
                    <footer>
                      <a
                        href={c.calendarLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-600"
                      >
                        Ver en calendario <span aria-hidden>↗</span>
                      </a>
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </PageShell>
  );
}

/* ---------- Auxiliares UI ---------- */
function MetricCard({ title, value, hint, badge }: { title: string; value: number; hint?: string; badge?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription>{hint ?? ''}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-baseline justify-between gap-2 pt-0">
        <p className="text-3xl font-semibold">{value}</p>
        {badge ? <Badge label={badge} variant="outline" className="hidden text-[0.6rem] sm:flex" /> : null}
      </CardContent>
    </Card>
  );
}
