import type { Database } from "@/types/database";

export type TabKey = "leads" | "pacientes" | "consultas" | "confirmaciones" | "metricas";

export type Lead = {
  id: string;
  nombre: string;
  telefono: string;
  estado: "Nuevo" | "En seguimiento" | "Convertido" | "Descartado";
  primerContacto: string;
  fuente: string;
};

export type Paciente = {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  totalConsultas: number;
  ultimaConsulta: string | null;
  estado: "Activo" | "Inactivo";
};

export type Consulta = {
  id: string;
  paciente: string;
  sede: "POLANCO" | "SATELITE";
  tipo: "Primera vez" | "Seguimiento";
  estado: "Programada" | "Confirmada" | "Reagendada" | "Cancelada";
  fecha: string;
  timezone: string;
  calendarLink: string;
};

export type Recordatorio = {
  id: string;
  consultaId: string;
  paciente: string;
  programado: string;
  tipo: "confirmacion_inicial" | "48h" | "24h" | "3h";
  estado: "pendiente" | "enviado" | "error";
  canal: "whatsapp" | "sms" | "email";
};

export type DashboardMetricas = Database["public"]["Views"]["dashboard_metricas"]["Row"];

export type CRMState = {
  leads: Lead[];
  pacientes: Paciente[];
  consultas: Consulta[];
  recordatorios: Recordatorio[];
  dashboardMetricas: DashboardMetricas;
};

export const STATE_COLORS: Record<string, string> = {
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

export const TAB_LABELS: Record<TabKey, string> = {
  leads: "Leads",
  pacientes: "Pacientes",
  consultas: "Consultas",
  confirmaciones: "Confirmaciones",
  metricas: "Métricas",
};

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(new Date(value));
}

export function toDayKey(input: string | Date, timeZone: string) {
  const reference = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
}

export function formatDayHeader(dayKey: string, timeZone: string) {
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

export function formatTimeSlot(date: string, timeZone: string) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const MOCK_METRICAS: DashboardMetricas = {
  leads_mes: 42,
  leads_convertidos: 18,
  leads_totales: 368,
  total_pacientes: 214,
  pacientes_activos: 167,
  consultas_futuras: 34,
  consultas_hoy: 6,
  pendientes_confirmacion: 9,
  polanco_futuras: 18,
  satelite_futuras: 16,
  tasa_conversion_pct: 43,
};

export const mockData: CRMState = {
  leads: [
    {
      id: "L-1001",
      nombre: "Juan Pérez",
      telefono: "+52 55 1111 2222",
      estado: "Nuevo",
      primerContacto: "2025-10-01T12:44:00Z",
      fuente: "WhatsApp",
    },
    {
      id: "L-1002",
      nombre: "Ana López",
      telefono: "+52 55 1234 5678",
      estado: "Convertido",
      primerContacto: "2025-10-05T13:00:00Z",
      fuente: "Google Ads",
    },
    {
      id: "L-1003",
      nombre: "María Torres",
      telefono: "+52 55 9999 8888",
      estado: "En seguimiento",
      primerContacto: "2025-10-09T10:15:00Z",
      fuente: "Instagram",
    },
    {
      id: "L-1004",
      nombre: "Carlos Ruiz",
      telefono: "+52 55 2222 4444",
      estado: "Nuevo",
      primerContacto: "2025-10-10T11:20:00Z",
      fuente: "Sitio Web",
    },
  ],
  pacientes: [
    {
      id: "P-1001",
      nombre: "Ana López",
      telefono: "+52 55 1234 5678",
      email: "ana@mail.com",
      totalConsultas: 1,
      ultimaConsulta: "2025-10-05T13:00:00Z",
      estado: "Activo",
    },
    {
      id: "P-1002",
      nombre: "Luis Gómez",
      telefono: "+52 55 4444 3333",
      email: "luis@mail.com",
      totalConsultas: 0,
      ultimaConsulta: null,
      estado: "Activo",
    },
    {
      id: "P-1003",
      nombre: "María Torres",
      telefono: "+52 55 9999 8888",
      email: "maria@mail.com",
      totalConsultas: 2,
      ultimaConsulta: "2025-09-25T17:30:00Z",
      estado: "Activo",
    },
  ],
  consultas: [
    {
      id: "C-1001",
      paciente: "Ana López",
      sede: "POLANCO",
      tipo: "Primera vez",
      estado: "Programada",
      fecha: "2025-10-20T11:00:00-06:00",
      timezone: "America/Mexico_City",
      calendarLink: "https://calendar.google.com/event?eid=abc",
    },
    {
      id: "C-1002",
      paciente: "Luis Gómez",
      sede: "SATELITE",
      tipo: "Seguimiento",
      estado: "Confirmada",
      fecha: "2025-10-20T20:30:00-06:00",
      timezone: "America/Mexico_City",
      calendarLink: "https://calendar.google.com/event?eid=def",
    },
    {
      id: "C-1003",
      paciente: "María Torres",
      sede: "POLANCO",
      tipo: "Seguimiento",
      estado: "Reagendada",
      fecha: "2025-10-22T09:00:00-06:00",
      timezone: "America/Mexico_City",
      calendarLink: "https://calendar.google.com/event?eid=ghi",
    },
    {
      id: "C-1004",
      paciente: "Carlos Ruiz",
      sede: "SATELITE",
      tipo: "Primera vez",
      estado: "Cancelada",
      fecha: "2025-10-15T15:00:00-06:00",
      timezone: "America/Mexico_City",
      calendarLink: "https://calendar.google.com/event?eid=jkl",
    },
  ],
  recordatorios: [
    {
      id: "R-1001",
      consultaId: "C-1001",
      paciente: "Ana López",
      programado: "2025-10-18T11:00:00-06:00",
      tipo: "confirmacion_inicial",
      estado: "pendiente",
      canal: "whatsapp",
    },
    {
      id: "R-1002",
      consultaId: "C-1002",
      paciente: "Luis Gómez",
      programado: "2025-10-19T20:30:00-06:00",
      tipo: "24h",
      estado: "enviado",
      canal: "whatsapp",
    },
    {
      id: "R-1003",
      consultaId: "C-1003",
      paciente: "María Torres",
      programado: "2025-10-21T09:00:00-06:00",
      tipo: "48h",
      estado: "pendiente",
      canal: "sms",
    },
  ],
  dashboardMetricas: MOCK_METRICAS,
};
