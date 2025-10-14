'use client';

import { useMemo, useState } from "react";

type TabKey = "leads" | "pacientes" | "consultas" | "confirmaciones" | "metricas";

type Lead = {
  id: string;
  nombre: string;
  telefono: string;
  estado: "Nuevo" | "En seguimiento" | "Convertido" | "Descartado";
  primerContacto: string;
  fuente: string;
};

type Paciente = {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  totalConsultas: number;
  ultimaConsulta: string | null;
  estado: "Activo" | "Inactivo";
};

type Consulta = {
  id: string;
  paciente: string;
  sede: "POLANCO" | "SATELITE";
  tipo: "Primera vez" | "Seguimiento";
  estado: "Programada" | "Confirmada" | "Reagendada" | "Cancelada";
  fecha: string;
  timezone: string;
  calendarLink: string;
};

type Recordatorio = {
  id: string;
  consultaId: string;
  paciente: string;
  programado: string;
  tipo: "confirmacion_inicial" | "48h" | "24h" | "3h";
  estado: "pendiente" | "enviado" | "error";
  canal: "whatsapp" | "sms" | "email";
};

const MOCK = {
  leads: [
    {
      id: "L-1001",
      nombre: "Juan Pérez",
      telefono: "+52 55 1111 2222",
      estado: "Nuevo" as const,
      primerContacto: "2025-10-01T12:44:00Z",
      fuente: "WhatsApp",
    },
    {
      id: "L-1002",
      nombre: "Ana López",
      telefono: "+52 55 1234 5678",
      estado: "Convertido" as const,
      primerContacto: "2025-10-05T13:00:00Z",
      fuente: "Google Ads",
    },
    {
      id: "L-1003",
      nombre: "María Torres",
      telefono: "+52 55 9999 8888",
      estado: "En seguimiento" as const,
      primerContacto: "2025-10-09T10:15:00Z",
      fuente: "Instagram",
    },
    {
      id: "L-1004",
      nombre: "Carlos Ruiz",
      telefono: "+52 55 2222 4444",
      estado: "Nuevo" as const,
      primerContacto: "2025-10-10T11:20:00Z",
      fuente: "Sitio Web",
    },
  ] satisfies Lead[],
  pacientes: [
    {
      id: "P-1001",
      nombre: "Ana López",
      telefono: "+52 55 1234 5678",
      email: "ana@mail.com",
      totalConsultas: 1,
      ultimaConsulta: "2025-10-05T13:00:00Z",
      estado: "Activo" as const,
    },
    {
      id: "P-1002",
      nombre: "Luis Gómez",
      telefono: "+52 55 4444 3333",
      email: "luis@mail.com",
      totalConsultas: 0,
      ultimaConsulta: null,
      estado: "Activo" as const,
    },
    {
      id: "P-1003",
      nombre: "María Torres",
      telefono: "+52 55 9999 8888",
      email: "maria@mail.com",
      totalConsultas: 2,
      ultimaConsulta: "2025-09-25T17:30:00Z",
      estado: "Activo" as const,
    },
  ] satisfies Paciente[],
  consultas: [
    {
      id: "C-1001",
      paciente: "Ana López",
      sede: "POLANCO" as const,
      tipo: "Primera vez" as const,
      estado: "Programada" as const,
      fecha: "2025-10-20T11:00:00-06:00",
      timezone: "America/Mexico_City",
      calendarLink: "https://calendar.google.com/event?eid=abc",
    },
    {
      id: "C-1002",
      paciente: "Luis Gómez",
      sede: "SATELITE" as const,
      tipo: "Seguimiento" as const,
      estado: "Confirmada" as const,
      fecha: "2025-10-20T20:30:00-06:00",
      timezone: "America/Mexico_City",
      calendarLink: "https://calendar.google.com/event?eid=def",
    },
    {
      id: "C-1003",
      paciente: "María Torres",
      sede: "POLANCO" as const,
      tipo: "Seguimiento" as const,
      estado: "Reagendada" as const,
      fecha: "2025-10-22T09:00:00-06:00",
      timezone: "America/Mexico_City",
      calendarLink: "https://calendar.google.com/event?eid=ghi",
    },
  ] satisfies Consulta[],
  recordatorios: [
    {
      id: "R-1001",
      consultaId: "C-1001",
      paciente: "Ana López",
      programado: "2025-10-18T11:00:00-06:00",
      tipo: "confirmacion_inicial" as const,
      estado: "pendiente" as const,
      canal: "whatsapp" as const,
    },
    {
      id: "R-1002",
      consultaId: "C-1002",
      paciente: "Luis Gómez",
      programado: "2025-10-19T20:30:00-06:00",
      tipo: "24h" as const,
      estado: "enviado" as const,
      canal: "whatsapp" as const,
    },
    {
      id: "R-1003",
      consultaId: "C-1003",
      paciente: "María Torres",
      programado: "2025-10-21T09:00:00-06:00",
      tipo: "48h" as const,
      estado: "pendiente" as const,
      canal: "sms" as const,
    },
  ] satisfies Recordatorio[],
};

const TAB_LABELS: Record<TabKey, string> = {
  leads: "Leads",
  pacientes: "Pacientes",
  consultas: "Consultas",
  confirmaciones: "Confirmaciones",
  metricas: "Métricas",
};

const STATE_COLORS: Record<string, string> = {
  Nuevo: "bg-blue-500/10 text-blue-200 border-blue-500/30",
  "En seguimiento": "bg-amber-500/10 text-amber-200 border-amber-500/30",
  Convertido: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
  Descartado: "bg-rose-500/10 text-rose-200 border-rose-500/30",
  Programada: "bg-sky-500/10 text-sky-200 border-sky-500/30",
  Confirmada: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
  Reagendada: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  Cancelada: "bg-rose-500/10 text-rose-200 border-rose-500/30",
  pendiente: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  enviado: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
  error: "bg-rose-500/10 text-rose-200 border-rose-500/30",
};

function toDayKey(input: string | Date, timeZone: string) {
  const reference = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
}

function formatDayHeader(dayKey: string, timeZone: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const weekdayRaw = new Intl.DateTimeFormat("es-MX", {
    timeZone,
    weekday: "long",
  }).format(utcDate);
  const weekday = weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1);
  const dateLabel = new Intl.DateTimeFormat("es-MX", {
    timeZone,
    day: "numeric",
    month: "short",
  }).format(utcDate);
  return { weekday, dateLabel };
}

function formatTimeSlot(date: string, timeZone: string) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(new Date(value));
}

function Badge({ label, tone }: { label: string; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        tone ?? "border-neutral-700 bg-neutral-900 text-neutral-300"
      }`}
    >
      {label}
    </span>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 shadow-lg shadow-black/20 backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
    </div>
  );
}

function Toolbar({
  search,
  onSearch,
  sede,
  onSede,
}: {
  search: string;
  onSearch: (value: string) => void;
  sede: "ALL" | "POLANCO" | "SATELITE";
  onSede: (value: "ALL" | "POLANCO" | "SATELITE") => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mt-8 mb-8 flex flex-col gap-3 rounded-2xl border border-white/8 bg-neutral-950/80 p-4 shadow-lg shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">MVP CRM · Preview</p>
          <h1 className="text-2xl font-semibold text-white">Dr. Mario Martínez Thomas</h1>
          <p className="text-sm text-white/60">
            Leads · Pacientes · Consultas · Confirmaciones · Métricas
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 shadow-inner">
            <span className="text-white/40">🔍</span>
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Buscar por nombre o teléfono"
              className="w-56 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <select
            value={sede}
            onChange={(event) => onSede(event.target.value as typeof sede)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 shadow-inner"
          >
            <option value="ALL">Todas las sedes</option>
            <option value="POLANCO">Polanco</option>
            <option value="SATELITE">Satélite</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Tabs({ active, onChange }: { active: TabKey; onChange: (key: TabKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "border-blue-400/70 bg-blue-500/20 text-white shadow-inner shadow-blue-950"
                : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/30"
            }`}
          >
            {TAB_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}

function DataTable({
  headers,
  rows,
  empty,
  onRowClick,
}: {
  headers: { key: string; label: string; align?: "left" | "right" }[];
  rows: (Record<string, React.ReactNode> & { id: string })[];
  empty: string;
  onRowClick?: (rowId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] shadow-lg shadow-black/30">
      <table className="min-w-full text-sm text-white/80">
        <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-[0.2em] text-white/40">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                className={`px-4 py-3 text-${header.align ?? "left"}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-white/40">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.id)}
                className={`border-b border-white/5 transition-all ${
                  onRowClick ? "cursor-pointer hover:bg-white/[0.04]" : ""
                } ${index % 2 === 0 ? "bg-white/[0.015]" : "bg-transparent"}`}
              >
                {headers.map((header) => (
                  <td key={header.key} className={`px-4 py-3 text-${header.align ?? "left"}`}>
                    {row[header.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DetailDrawer({
  open,
  title,
  subtitle,
  sections,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  sections: { heading: string; items: { label: string; value: string }[] }[];
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-md border-l border-white/10 bg-neutral-950/95 p-6 shadow-[0_0_40px_-10px_rgba(15,23,42,0.8)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-white/60 hover:border-white/30"
          >
            Cerrar
          </button>
        </div>
        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <div key={section.heading}>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                {section.heading}
              </p>
              <dl className="mt-2 space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm text-white/70">
                    <dt className="text-white/50">{item.label}</dt>
                    <dd className="text-right text-white/80">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Acciones rápidas</p>
          <div className="grid grid-cols-1 gap-2">
            <button className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-100 transition hover:border-blue-400/70">
              Confirmar cita con paciente
            </button>
            <button className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-400/60">
              Reagendar / proponer nuevo horario
            </button>
            <button className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:border-rose-400/60">
              Escalar a humano (n8n)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaView({ consultas }: { consultas: Consulta[] }) {
  const timeZone = "America/Mexico_City";
  const grouped = useMemo(() => {
    return consultas.reduce<Record<string, Consulta[]>>((acc, consulta) => {
      const key = toDayKey(consulta.fecha, consulta.timezone ?? timeZone);
      if (!acc[key]) acc[key] = [];
      acc[key].push(consulta);
      return acc;
    }, {});
  }, [consultas]);

  const sortedDays = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  if (sortedDays.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/50">
        No hay citas programadas en la agenda.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sortedDays.map((dayKey) => {
        const { weekday, dateLabel } = formatDayHeader(dayKey, timeZone);
        const items = grouped[dayKey].slice().sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
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
                {items.length} {items.length === 1 ? "cita" : "citas"}
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
                        {formatTimeSlot(consulta.fecha, consulta.timezone ?? timeZone)} · {consulta.paciente}
                      </p>
                      <p className="text-xs text-white/50">{consulta.tipo} · {consulta.id}</p>
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

export default function CRMPreview() {
  const [activeTab, setActiveTab] = useState<TabKey>("leads");
  const [search, setSearch] = useState("");
  const [sede, setSede] = useState<"ALL" | "POLANCO" | "SATELITE">("ALL");
  const [drawer, setDrawer] = useState<
    | { type: "lead"; payload: Lead }
    | { type: "paciente"; payload: Paciente }
    | { type: "consulta"; payload: Consulta }
    | { type: "recordatorio"; payload: Recordatorio }
    | null
  >(null);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MOCK.leads;
    return MOCK.leads.filter((lead) =>
      [lead.nombre, lead.telefono, lead.fuente].some((field) => field.toLowerCase().includes(term))
    );
  }, [search]);

  const filteredPacientes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MOCK.pacientes;
    return MOCK.pacientes.filter((paciente) =>
      [paciente.nombre, paciente.telefono, paciente.email ?? ""].some((field) =>
        field.toLowerCase().includes(term)
      )
    );
  }, [search]);

  const filteredConsultas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return MOCK.consultas.filter((consulta) => {
      if (sede !== "ALL" && consulta.sede !== sede) return false;
      if (!term) return true;
      return [consulta.paciente, consulta.id].some((field) => field.toLowerCase().includes(term));
    });
  }, [search, sede]);

  const filteredRecordatorios = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return MOCK.recordatorios;
    return MOCK.recordatorios.filter((recordatorio) =>
      [recordatorio.paciente, recordatorio.consultaId].some((field) => field.toLowerCase().includes(term))
    );
  }, [search]);

  const metrics = useMemo(() => {
    const conversionRate = Math.round(
      (MOCK.leads.filter((lead) => lead.estado === "Convertido").length / MOCK.leads.length) * 100
    );
    return [
      {
        title: "Leads activos",
        value: `${MOCK.leads.length}`,
        hint: "Seguimiento en los últimos 7 días",
      },
      {
        title: "Tasa de conversión",
        value: `${conversionRate}%`,
        hint: "Objetivo mensual 32%",
      },
      {
        title: "Consultas confirmadas",
        value: `${MOCK.consultas.filter((c) => c.estado === "Confirmada").length}`,
        hint: "Próximas 72 horas",
      },
      {
        title: "Confirmaciones pendientes",
        value: `${MOCK.recordatorios.filter((r) => r.estado === "pendiente").length}`,
        hint: "Enviar recordatorios hoy",
      },
    ];
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#123456,_#050b1a_60%,_#03060f)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-blue-500/40 blur-[160px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 pb-16 pt-12">
        <Toolbar search={search} onSearch={setSearch} sede={sede} onSede={setSede} />

        <Tabs active={activeTab} onChange={setActiveTab} />

        {activeTab === "metricas" && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard key={metric.title} title={metric.title} value={metric.value} hint={metric.hint} />
            ))}
          </section>
        )}

        {activeTab === "leads" && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90">Leads activos</h2>
            <DataTable
              headers={[
                { key: "nombre", label: "Nombre" },
                { key: "telefono", label: "Teléfono" },
                { key: "estado", label: "Estado" },
                { key: "primerContacto", label: "Primer contacto" },
                { key: "fuente", label: "Fuente" },
              ]}
              rows={filteredLeads.map((lead) => ({
                id: lead.id,
                nombre: (
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{lead.nombre}</span>
                    <span className="text-xs text-white/40">ID: {lead.id}</span>
                  </div>
                ),
                telefono: <span className="text-white/80">{lead.telefono}</span>,
                estado: <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />,
                primerContacto: <span>{formatDate(lead.primerContacto)}</span>,
                fuente: <Badge label={lead.fuente} />,
              }))}
              empty="No se encontraron leads con el criterio aplicado."
              onRowClick={(rowId: string) => {
                const lead = MOCK.leads.find((item) => item.id === rowId);
                if (lead) setDrawer({ type: "lead", payload: lead });
              }}
            />
          </section>
        )}

        {activeTab === "pacientes" && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90">Pacientes</h2>
            <DataTable
              headers={[
                { key: "nombre", label: "Nombre" },
                { key: "contacto", label: "Contacto" },
                { key: "estado", label: "Estado" },
                { key: "consultas", label: "Consultas", align: "right" },
                { key: "ultimaConsulta", label: "Última consulta" },
              ]}
              rows={filteredPacientes.map((paciente) => ({
                id: paciente.id,
                nombre: (
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{paciente.nombre}</span>
                    <span className="text-xs text-white/40">ID: {paciente.id}</span>
                  </div>
                ),
                contacto: (
                  <div className="space-y-1 text-sm">
                    <p className="text-white/80">{paciente.telefono}</p>
                    <p className="text-white/40">{paciente.email}</p>
                  </div>
                ),
                estado: <Badge label={paciente.estado} tone={STATE_COLORS[paciente.estado]} />,
                consultas: <span className="font-medium text-white">{paciente.totalConsultas}</span>,
                ultimaConsulta: (
                  <span>
                    {paciente.ultimaConsulta ? formatDate(paciente.ultimaConsulta) : "Sin consulta previa"}
                  </span>
                ),
              }))}
              empty="Sin pacientes registrados."
              onRowClick={(rowId: string) => {
                const paciente = MOCK.pacientes.find((item) => item.id === rowId);
                if (paciente) setDrawer({ type: "paciente", payload: paciente });
              }}
            />
          </section>
        )}

        {activeTab === "consultas" && (
          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white/90">Consultas programadas</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Zona horaria: CDMX</p>
            </div>
            <DataTable
              headers={[
                { key: "consulta", label: "Consulta" },
                { key: "paciente", label: "Paciente" },
                { key: "sede", label: "Sede" },
                { key: "estado", label: "Estado" },
                { key: "fecha", label: "Fecha" },
                { key: "acciones", label: "Agenda" },
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
              empty="No hay consultas para mostrar."
              onRowClick={(rowId: string) => {
                const consulta = MOCK.consultas.find((item) => item.id === rowId);
                if (consulta) setDrawer({ type: "consulta", payload: consulta });
              }}
            />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/80">Agenda visual</h3>
              <AgendaView consultas={filteredConsultas} />
            </div>
          </section>
        )}

        {activeTab === "confirmaciones" && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90">Confirmaciones y recordatorios</h2>
            <DataTable
              headers={[
                { key: "programado", label: "Programado" },
                { key: "paciente", label: "Paciente" },
                { key: "consultaId", label: "Consulta" },
                { key: "tipo", label: "Tipo" },
                { key: "estado", label: "Estado" },
                { key: "canal", label: "Canal" },
              ]}
              rows={filteredRecordatorios
                .slice()
                .sort((a, b) => new Date(a.programado).getTime() - new Date(b.programado).getTime())
                .map((recordatorio) => ({
                  id: recordatorio.id,
                  programado: <span>{formatDate(recordatorio.programado)}</span>,
                  paciente: <span className="text-white/80">{recordatorio.paciente}</span>,
                  consultaId: <span className="font-medium text-white">{recordatorio.consultaId}</span>,
                  tipo: <Badge label={recordatorio.tipo.replace(/_/g, " ")} />,
                  estado: <Badge label={recordatorio.estado} tone={STATE_COLORS[recordatorio.estado]} />,
                  canal: <Badge label={recordatorio.canal} />,
                }))}
              empty="No hay recordatorios programados."
              onRowClick={(rowId: string) => {
                const recordatorio = MOCK.recordatorios.find((item) => item.id === rowId);
                if (recordatorio) setDrawer({ type: "recordatorio", payload: recordatorio });
              }}
            />
          </section>
        )}

        <footer className="border-t border-white/10 pt-6 text-xs text-white/40">
          <p>
            MVP conceptual para CRM del Dr. Mario Martínez Thomas · Integrable con Supabase, n8n y routing de LLMs.
          </p>
        </footer>
      </div>

      <DetailDrawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        title={
          drawer?.type === "lead"
            ? drawer.payload.nombre
            : drawer?.type === "paciente"
            ? drawer.payload.nombre
            : drawer?.type === "consulta"
            ? drawer.payload.id
            : drawer?.type === "recordatorio"
            ? drawer.payload.paciente
            : ""
        }
        subtitle={
          drawer?.type === "lead"
            ? `Lead ${drawer.payload.estado}`
            : drawer?.type === "paciente"
            ? `Paciente ${drawer.payload.estado}`
            : drawer?.type === "consulta"
            ? `Consulta ${drawer.payload.tipo}`
            : drawer?.type === "recordatorio"
            ? `Recordatorio ${drawer.payload.tipo}`
            : undefined
        }
        sections={(() => {
          if (!drawer) return [];
          if (drawer.type === "lead") {
            return [
              {
                heading: "Información del lead",
                items: [
                  { label: "Teléfono", value: drawer.payload.telefono },
                  { label: "Fuente", value: drawer.payload.fuente },
                  { label: "Primer contacto", value: formatDate(drawer.payload.primerContacto) },
                ],
              },
            ];
          }
          if (drawer.type === "paciente") {
            return [
              {
                heading: "Datos de contacto",
                items: [
                  { label: "Teléfono", value: drawer.payload.telefono },
                  { label: "Email", value: drawer.payload.email },
                ],
              },
              {
                heading: "Seguimiento",
                items: [
                  {
                    label: "Última consulta",
                    value: drawer.payload.ultimaConsulta
                      ? formatDate(drawer.payload.ultimaConsulta)
                      : "Sin registro",
                  },
                  { label: "Consultas totales", value: `${drawer.payload.totalConsultas}` },
                  { label: "Estado", value: drawer.payload.estado },
                ],
              },
            ];
          }
          if (drawer.type === "consulta") {
            return [
              {
                heading: "Ficha de consulta",
                items: [
                  { label: "Paciente", value: drawer.payload.paciente },
                  { label: "Sede", value: drawer.payload.sede },
                  { label: "Tipo", value: drawer.payload.tipo },
                  { label: "Estado", value: drawer.payload.estado },
                ],
              },
              {
                heading: "Agenda",
                items: [
                  { label: "Fecha y hora", value: formatDate(drawer.payload.fecha) },
                  { label: "Zona horaria", value: drawer.payload.timezone },
                  { label: "Calendario", value: "Abrir evento" },
                ],
              },
            ];
          }
          if (drawer.type === "recordatorio") {
            return [
              {
                heading: "Recordatorio",
                items: [
                  { label: "Consulta", value: drawer.payload.consultaId },
                  { label: "Programado", value: formatDate(drawer.payload.programado) },
                  { label: "Estado", value: drawer.payload.estado },
                  { label: "Tipo", value: drawer.payload.tipo },
                  { label: "Canal", value: drawer.payload.canal.toUpperCase() },
                ],
              },
            ];
          }
          return [];
        })()}
      />
    </div>
  );
}
