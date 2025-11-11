'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import { useConsultas } from '@/hooks/useConsultas';

type SedeFilter = 'ALL' | 'POLANCO' | 'SATELITE';

const SEDE_COLORS: Record<'POLANCO' | 'SATELITE', string> = {
  POLANCO: 'border border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-100',
  SATELITE: 'border border-cyan-400/60 bg-cyan-500/15 text-cyan-100',
};

export default function ConsultasPage() {
  const [search, setSearch] = useState('');
  const [sede, setSede] = useState<SedeFilter>('ALL');

  // ✅ Datos reales de Supabase
  const { consultas, loading, error, refetch } = useConsultas();

  const filteredConsultas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return consultas.filter((consulta) => {
      if (sede !== 'ALL' && consulta.sede !== sede) return false;
      if (!term) return true;
      return [consulta.paciente, consulta.id].some((field) => field.toLowerCase().includes(term));
    });
  }, [search, sede, consultas]);

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
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.04] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.28em] text-white/70">Buscar</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">Paciente o folio</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 pt-0">
              <span aria-hidden className="text-white/40">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por paciente o folio"
                className="w-full rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              />
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.28em] text-white/70">Sede</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">Filtra por ubicación</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                <select
                  value={sede}
                  onChange={(e) => setSede(e.target.value as SedeFilter)}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                >
                  <option className="bg-slate-900" value="ALL">Todas las sedes</option>
                  <option className="bg-slate-900" value="POLANCO">Polanco</option>
                  <option className="bg-slate-900" value="SATELITE">Satélite</option>
                </select>
                <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-white/40">
                  ▼
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Card className="border-white/10 bg-white/[0.02]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Agenda centralizada</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/60">
            Planea por semana o día con filtros avanzados y comparte el enlace con tu equipo.
          </p>
          <Link
            href="/agenda"
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-500"
          >
            Abrir agenda
          </Link>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <section className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-4">
        <MetricCard title="Consultas filtradas" value={total} hint="Total" />
        <MetricCard title="Confirmadas" value={confirmadas} badge="confirmadas" />
        <MetricCard title="Programadas" value={pendientes} badge="programadas" />
        <MetricCard title="Reagendadas" value={reagendadas} badge="reagendadas" />
      </section>

      {/* Tabla */}
      <Card className="border-white/10 bg-white/[0.02]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-white">
                Listado de consultas {loading && '(cargando...)'}
              </CardTitle>
              <CardDescription className="text-white/60">
                {error
                  ? `Error: ${error.message}`
                  : 'Detalle operativo por paciente y sede'}
              </CardDescription>
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="rounded-lg bg-sky-600/20 px-3 py-1.5 text-sm font-medium text-sky-300 hover:bg-sky-600/30 disabled:opacity-50 transition-colors"
            >
              ↻
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {loading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="h-24 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          )}
          <DataTable
            headers={[
              { key: 'paciente', label: 'Paciente' },
              { key: 'sede', label: 'Sede' },
              { key: 'estado', label: 'Estado' },
              { key: 'programacion', label: 'Programación' },
              { key: 'detalle', label: 'Detalle' },
              { key: 'acciones', label: 'Acciones', align: 'right' },
            ]}
            rows={filteredConsultas.map((c) => ({
              id: c.id,
              paciente: (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-white">{c.paciente}</span>
                  <span className="text-xs text-white/50">{c.tipo}</span>
                </div>
              ),
              sede: (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge label={c.sede} tone={SEDE_COLORS[c.sede]} />
                  {c.confirmadoPaciente ? (
                    <span className="text-[11px] font-medium text-emerald-300">✓ Confirmado</span>
                  ) : null}
                </div>
              ),
              estado: <Badge label={c.estado} tone={STATE_COLORS[c.estado]} />, 
              programacion: (
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white">
                    {formatDate(c.fecha, {
                      timeZone: c.timezone ?? 'America/Mexico_City',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              ),
              detalle: (
                <div className="flex flex-col gap-1 text-sm text-white/70">
                  <span>{c.motivoConsulta || 'Sin motivo registrado'}</span>
                  <span className="text-xs text-white/40">Duración: {c.duracionMinutos} min · {c.canalOrigen || 'WhatsApp'}</span>
                </div>
              ),
              acciones: (
                <Link
                  href="/agenda"
                  className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 hover:text-sky-300"
                >
                  Ver en calendario <span aria-hidden>→</span>
                </Link>
              ),
            }))}
            empty={
              filteredConsultas.length === 0
                ? 'No hay consultas para los filtros seleccionados.'
                : 'Sin resultados.'
            }
          />
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
