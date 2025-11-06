export type TabKey = "leads" | "pacientes" | "consultas" | "confirmaciones" | "metricas";

export type LeadEstado = "Nuevo" | "En seguimiento" | "Convertido" | "Descartado";

export type Lead = {
  id: string;
  leadId?: string | null;
  nombre: string;
  telefono: string;
  estado: LeadEstado;
  primerContacto: string;
  fuente: string;
  ultimaInteraccion?: string | null;
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

export type ConsultaEstado =
  | "Programada"
  | "Confirmada"
  | "Reagendada"
  | "Cancelada"
  | "Completada";

export type Consulta = {
  id: string; // consulta_id (folio público)
  uuid: string; // id (uuid real)
  paciente: string;
  pacienteId: string | null;
  sede: "POLANCO" | "SATELITE";
  tipo: string;
  estado: ConsultaEstado;
  estadoConfirmacion: string;
  confirmadoPaciente: boolean;
  fecha: string;
  fechaConsulta: string;
  horaConsulta: string;
  timezone: string;
  motivoConsulta: string | null;
  duracionMinutos: number;
  calendarEventId: string | null;
  calendarLink: string | null;
  canalOrigen: string | null;
  canceladoPor?: string | null;
  motivoCancelacion?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecordatorioTipo = "confirmacion_inicial" | "48h" | "24h" | "3h";

export type RecordatorioEstado = "pendiente" | "procesando" | "enviado" | "error";

export type Recordatorio = {
  id: string;
  recordatorio_id: string | null;
  consulta_id: string | null;
  tipo: RecordatorioTipo;
  programado_para: string;
  enviado_en: string | null;
  estado: RecordatorioEstado;
  canal: "whatsapp" | "sms" | "email" | null;
  mensaje_enviado?: string | null;
  plantilla_usada?: string | null;
  intentos?: number | null;
  error_mensaje?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RecordatorioDetalle = Recordatorio & {
  consulta?: {
    id: string;
    consulta_id: string | null;
    sede: Consulta["sede"] | null;
    estado_cita: ConsultaEstado | null;
  } | null;
  paciente?: {
    id: string;
    nombre_completo: string;
  } | null;
};

export const STATE_COLORS: Record<string, string> = {
  Nuevo: "border border-blue-400/60 bg-blue-500/15 text-blue-100",
  "En seguimiento": "border border-amber-400/60 bg-amber-500/15 text-amber-100",
  Convertido: "border border-teal-400/60 bg-teal-500/15 text-teal-100",
  Descartado: "border border-rose-400/60 bg-rose-500/15 text-rose-100",
  Programada: "border border-sky-400/60 bg-sky-500/15 text-sky-100",
  Confirmada: "border border-emerald-400/60 bg-emerald-500/15 text-emerald-100",
  Reagendada: "border border-orange-400/60 bg-orange-500/15 text-orange-100",
  Cancelada: "border border-rose-500/70 bg-rose-600/20 text-rose-100",
  Completada: "border border-lime-400/60 bg-lime-500/15 text-lime-100",
  procesando: "border border-indigo-400/60 bg-indigo-500/15 text-indigo-100",
  pendiente: "border border-amber-400/60 bg-amber-500/15 text-amber-100",
  enviado: "border border-emerald-400/60 bg-emerald-500/15 text-emerald-100",
  error: "border border-rose-500/70 bg-rose-600/20 text-rose-100",
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

