'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
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

type SedeFilter = 'ALL' | 'POLANCO' | 'SATELITE';

function AgendaView({ consultas }: { consultas: Consulta[] }) {
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
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/50">
        No hay citas programadas.
      </div>
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
          <div
            key={dayKey}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-inner shadow-black/30"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{weekday}</p>
                <p className="text-lg font-semibold text-white">{dateLabel}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                {items.length} {items.length === 1 ? 'cita' : 'citas'}
              </span>
            </div>
            <div className="space-y-3">
              {items.map((consulta) => (
                <div
                  key={consulta.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-inner backdrop-blur"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {formatTimeSlot(consulta.fecha, consulta.timezone ?? TIMEZONE)} · {consulta.paciente}
                      </p>
                      <p className="text-xs text-white/50">
                        {consulta.tipo} · {consulta.id}
                      </p>
                    </div>
                    <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <Badge label={consulta.sede.toLowerCase()} />
                    <a
                      href={consulta.calendarLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-200 hover:text-blue-100"
                    >
                      Ver evento <span aria-hidden>↗</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#101c3b,_#02040a_70%)] text-white">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-24 pt-10">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">Agenda</p>
            <h1 className="text-3xl font-semibold text-white">Consultas programadas</h1>
            <p className="text-sm text-white/60">
              Control total de citas confirmadas, pendientes y reagendadas en ambas sedes.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70 shadow-inner">
              <span className="text-white/40">🔍</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por paciente o folio"
                className="w-64 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
            <select
              value={sede}
              onChange={(event) => setSede(event.target.value as SedeFilter)}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80 shadow-inner"
            >
              <option value="ALL">Todas las sedes</option>
              <option value="POLANCO">Polanco</option>
              <option value="SATELITE">Satélite</option>
            </select>
          </div>
        </header>

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

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/80">Agenda visual</h2>
          <AgendaView consultas={filteredConsultas} />
        </section>
      </div>
    </div>
  );
}
