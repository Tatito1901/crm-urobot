'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  mockData,
  Consulta,
  STATE_COLORS,
  formatDate,
  formatTimeSlot,
  toDayKey,
  formatDayHeader,
} from '@/app/lib/crm-data';

const TIMEZONE = 'America/Mexico_City';

const VIEW_OPTIONS = [
  { value: 'list', label: 'Lista' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
] as const;

type AgendaMode = (typeof VIEW_OPTIONS)[number]['value'];
type SedeFilter = 'ALL' | 'POLANCO' | 'SATELITE';

function AgendaListView({ consultas }: { consultas: Consulta[] }) {
  const grouped = useMemo(() => {
    return consultas.reduce<Record<string, Consulta[]>>((acc, consulta) => {
      const key = toDayKey(consulta.fecha, consulta.timezone ?? TIMEZONE);
      if (!acc[key]) acc[key] = [];
      acc[key].push(consulta);
      return acc;
    }, {});
  }, [consultas]);

  const days = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  if (days.length === 0) {
    return (
      <Card className="bg-white/[0.03] text-sm text-white/60">
        <CardContent className="py-10 text-center">No hay citas programadas.</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {days.map((dayKey) => {
        const { weekday, dateLabel } = formatDayHeader(dayKey, TIMEZONE);
        const items = grouped[dayKey]
          .slice()
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        return (
          <Card key={dayKey} className="bg-white/[0.03]">
            <CardHeader className="flex items-baseline justify-between pb-4">
              <div>
                <CardTitle className="text-sm text-white">{weekday}</CardTitle>
                <CardDescription>{dateLabel}</CardDescription>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                {items.length} {items.length === 1 ? 'cita' : 'citas'}
              </span>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {items.map((consulta) => (
                <div
                  key={consulta.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 shadow-inner shadow-black/30 sm:flex-row sm:items-start sm:gap-6"
                >
                  <div className="flex w-full items-center gap-3 sm:w-48 sm:flex-col sm:items-start sm:gap-2">
                    <div className="flex h-12 min-w-[4.5rem] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                      {formatTimeSlot(consulta.fecha, consulta.timezone ?? TIMEZONE)}
                    </div>
                    <div className="flex flex-col text-xs text-white/60 sm:text-sm">
                      <p className="font-semibold text-white">{consulta.paciente}</p>
                      <p>{consulta.tipo}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge label={`Folio ${consulta.id}`} variant="outline" className="text-[0.6rem]" />
                      <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
                      <Badge label={consulta.sede.toLowerCase()} />
                    </div>
                    <p className="text-xs text-white/50 sm:text-sm">
                      {formatDate(consulta.fecha)} · {consulta.sede === 'POLANCO' ? 'Sucursal Polanco' : 'Sucursal Satélite'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <a
                        href={consulta.calendarLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-blue-200 transition hover:border-blue-300/40 hover:text-blue-100"
                      >
                        Ver evento <span aria-hidden>↗</span>
                      </a>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 font-medium text-white/70 transition hover:border-blue-300/30 hover:text-white"
                      >
                        Marcar seguimiento
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AgendaWeekView({ weekDays, weekMap }: { weekDays: Date[]; weekMap: Record<string, Consulta[]> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {weekDays.map((day) => {
          const key = toDayKey(day.toISOString(), TIMEZONE);
          const header = formatDayHeader(key, TIMEZONE);
          const consultas = weekMap[key] ?? [];
          return (
            <div key={key} className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">{header.weekday}</p>
              <p className="text-sm font-semibold text-white">{header.dateLabel}</p>
              <div className="mt-3 space-y-3 text-xs text-white/70">
                {consultas.length === 0 ? (
                  <p className="text-white/40">Sin consultas</p>
                ) : (
                  consultas.map((consulta) => (
                    <div key={consulta.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <p className="font-semibold text-white">
                        {formatTimeSlot(consulta.fecha, consulta.timezone ?? TIMEZONE)} · {consulta.paciente}
                      </p>
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">{consulta.sede.toLowerCase()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaMonthView({ monthDays, monthMap }: { monthDays: Date[]; monthMap: Record<number, Consulta[]> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="grid grid-cols-1 gap-px bg-white/10 text-xs text-white/70 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {monthDays.map((date) => {
          const dayNumber = date.getDate();
          const consultas = monthMap[dayNumber] ?? [];
          return (
            <div key={dayNumber} className="flex flex-col gap-2 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
                  {date.toLocaleDateString('es-MX', { weekday: 'short' })}
                </span>
                <span className="text-sm font-semibold text-white">{dayNumber}</span>
              </div>
              <div className="space-y-2">
                {consultas.length === 0 ? (
                  <p className="text-white/30">Sin citas</p>
                ) : (
                  consultas.slice(0, 3).map((consulta) => (
                    <div key={consulta.id} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
                      <p className="text-xs font-semibold text-white">
                        {formatTimeSlot(consulta.fecha, consulta.timezone ?? TIMEZONE)} · {consulta.paciente}
                      </p>
                      <p className="text-[0.68rem] uppercase tracking-[0.2em] text-white/40">{consulta.estado}</p>
                    </div>
                  ))
                )}
                {consultas.length > 3 && (
                  <p className="text-center text-[0.68rem] text-blue-200">+{consultas.length - 3} más</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ConsultasPage() {
  const [search, setSearch] = useState('');
  const [sede, setSede] = useState<SedeFilter>('ALL');
  const [mode, setMode] = useState<AgendaMode>('list');

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

  const firstConsultaDate = filteredConsultas.length
    ? new Date(filteredConsultas[0].fecha)
    : new Date();

  const startOfWeek = useMemo(() => {
    const date = new Date(firstConsultaDate);
    const day = date.getUTCDay();
    const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setUTCDate(diff));
  }, [firstConsultaDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setUTCDate(startOfWeek.getUTCDate() + index);
      return date;
    });
  }, [startOfWeek]);

  const weekMap = useMemo(() => {
    return weekDays.reduce<Record<string, Consulta[]>>((acc, date) => {
      const key = toDayKey(date.toISOString(), TIMEZONE);
      acc[key] = filteredConsultas.filter((consulta) => toDayKey(consulta.fecha, consulta.timezone ?? TIMEZONE) === key);
      return acc;
    }, {});
  }, [filteredConsultas, weekDays]);

  const monthStart = useMemo(() => {
    const date = new Date(firstConsultaDate);
    date.setUTCDate(1);
    return date;
  }, [firstConsultaDate]);

  const monthDays = useMemo(() => {
    const start = new Date(monthStart);
    const end = new Date(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0);
    const totalDays = end.getUTCDate();
    return Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(index + 1);
      return date;
    });
  }, [monthStart]);

  const monthMap = useMemo(() => {
    return monthDays.reduce<Record<number, Consulta[]>>((acc, date) => {
      const day = date.getUTCDate();
      acc[day] = filteredConsultas.filter(
        (consulta) => new Date(consulta.fecha).getUTCDate() === day && new Date(consulta.fecha).getUTCMonth() === date.getUTCMonth(),
      );
      return acc;
    }, {});
  }, [filteredConsultas, monthDays]);

  return (
    <PageShell
      accent
      eyebrow="Agenda"
      title="Consultas programadas"
      description="Control total de citas confirmadas, pendientes y reagendadas en ambas sedes."
      headerSlot={
        <>
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Buscar</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">Paciente o folio</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center">
              <span className="text-white/40">🔍</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por paciente o folio"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-300/40 sm:border-none sm:bg-transparent sm:px-0 sm:py-0"
              />
            </CardContent>
          </Card>
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Sede</CardTitle>
              <CardDescription className="text-[0.68rem] text-white/40">Filtra por ubicación</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <select
                value={sede}
                onChange={(event) => setSede(event.target.value as SedeFilter)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-blue-300/40 sm:bg-white/[0.05] sm:shadow-inner"
              >
                <option value="ALL">Todas las sedes</option>
                <option value="POLANCO">Polanco</option>
                <option value="SATELITE">Satélite</option>
              </select>
            </CardContent>
          </Card>
        </>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Consultas filtradas</CardTitle>
            <CardDescription>Resultado actual del tablero</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className="text-3xl font-semibold text-white">{total}</p>
            <span className="text-xs uppercase tracking-[0.2em] text-white/40">Total</span>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Confirmadas</CardTitle>
            <CardDescription>Pacientes listos</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className="text-3xl font-semibold text-white">{confirmadas}</p>
            <Badge label="confirmadas" variant="outline" className="hidden text-[0.6rem] sm:flex" />
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Programadas</CardTitle>
            <CardDescription>En espera de confirmación</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className="text-3xl font-semibold text-white">{pendientes}</p>
            <Badge label="programadas" variant="outline" className="hidden text-[0.6rem] sm:flex" />
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Reagendadas</CardTitle>
            <CardDescription>Requieren seguimiento</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className="text-3xl font-semibold text-white">{reagendadas}</p>
            <Badge label="reagendadas" variant="outline" className="hidden text-[0.6rem] sm:flex" />
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Listado de consultas</CardTitle>
          <CardDescription>Detalle operativo por paciente y sede</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden pt-0">
          <DataTable
            headers={[
              { key: 'consulta', label: 'Consulta' },
              { key: 'paciente', label: 'Paciente' },
              { key: 'sede', label: 'Sede' },
              { key: 'estado', label: 'Estado' },
              { key: 'fecha', label: 'Fecha' },
              { key: 'acciones', label: 'Acciones' },
            ]}
            rows={filteredConsultas.map((consulta) => ({
              id: consulta.id,
              consulta: (
                <div className="flex flex-col">
                  <span className="font-medium text-white">{consulta.id}</span>
                  <span className="text-xs text-white/40">{consulta.tipo}</span>
                </div>
              ),
              paciente: <span className="text-white/80">{consulta.paciente}</span>,
              sede: <Badge label={consulta.sede.toLowerCase()} />,
              estado: <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />,
              fecha: <span>{formatDate(consulta.fecha)}</span>,
              acciones: (
                <a
                  href={consulta.calendarLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-200 hover:text-blue-100"
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
        </CardContent>
      </Card>

      <section className="space-y-4">
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base text-white">Agenda visual</CardTitle>
                <CardDescription>Elige la vista que mejor se adapte a tu consulta</CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.05] p-1">
                {VIEW_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      mode === option.value
                        ? 'bg-blue-500/20 text-white shadow-inner shadow-blue-500/30'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {mode === 'list' && <AgendaListView consultas={filteredConsultas} />}
            {mode === 'week' && <AgendaWeekView weekDays={weekDays} weekMap={weekMap} />}
            {mode === 'month' && <AgendaMonthView monthDays={monthDays} monthMap={monthMap} />}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
