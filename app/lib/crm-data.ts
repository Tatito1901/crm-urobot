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
  id: string; // consulta_id
  uuid: string; // id (uuid real)
  paciente: string; // nombre del paciente (join)
  pacienteId: string | null; // paciente_id (FK)
  sede: "POLANCO" | "SATELITE";
  tipo: string; // tipo_cita (primera_vez | seguimiento)
  estado: "Programada" | "Confirmada" | "Reagendada" | "Cancelada" | "Completada"; // estado_cita
  estadoConfirmacion: string; // estado_confirmacion
  confirmadoPaciente: boolean; // confirmado_paciente
  fecha: string; // fecha_hora_utc (ISO timestamp)
  fechaConsulta: string; // fecha_consulta (date)
  horaConsulta: string; // hora_consulta (time)
  timezone: string; // timezone
  motivoConsulta: string | null; // motivo_consulta
  duracionMinutos: number; // duracion_minutos
  calendarEventId: string | null; // calendar_event_id
  calendarLink: string | null; // calendar_link
  canalOrigen: string | null; // canal_origen
  createdAt: string; // created_at
  updatedAt: string; // updated_at
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
  const resolvedOptions: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  };

  if (!resolvedOptions.timeZone) {
    resolvedOptions.timeZone = "America/Mexico_City";
  }

  return new Intl.DateTimeFormat("es-MX", resolvedOptions).format(new Date(value));
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

