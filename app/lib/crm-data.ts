/**
 * ============================================================
 * TIPOS CRM - OPTIMIZADOS
 * ============================================================
 * Usa tipos de database.ts como fuente de verdad
 * Solo define enums adicionales y transformaciones necesarias
 */

import type { Tables } from "@/types/database";

// ===== ENUMS Y TIPOS LITERALES =====
type TabKey = "leads" | "pacientes" | "consultas" | "confirmaciones" | "metricas";

type LeadEstado = "nuevo" | "contactado" | "interesado" | "calificado" | "escalado" | "cita_agendada" | "convertido" | "no_interesado" | "descartado";
type PacienteEstado = "Activo" | "Inactivo";
type ConsultaEstado = "Programada" | "Confirmada" | "Reagendada" | "Cancelada" | "Completada";
type RecordatorioTipo = "confirmacion_inicial" | "48h" | "24h" | "3h";
type RecordatorioEstado = "pendiente" | "procesando" | "enviado" | "error";
type SedeType = "POLANCO" | "SATELITE";

// ===== TIPOS BASE (desde Supabase) =====
type LeadRow = Tables<"leads">;
type PacienteRow = Tables<"pacientes">;
type ConsultaRow = Tables<"consultas">;
// RecordatorioRow se importa desde types/recordatorios.ts si es necesario

// ===== TIPOS TRANSFORMADOS PARA UI =====
type Lead = {
  id: string;
  leadId?: string | null;
  nombre: string;
  telefono: string;
  estado: LeadEstado;
  primerContacto: string;
  fuente: string;
  ultimaInteraccion?: string | null;
};

type Paciente = {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  totalConsultas: number;
  ultimaConsulta: string | null;
  estado: PacienteEstado;
};

type Consulta = {
  id: string; // consulta_id (folio público)
  uuid: string; // id (uuid real)
  paciente: string;
  pacienteId: string | null;
  sede: SedeType;
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

// Tipo para notification_queue (no generado automáticamente)
type Recordatorio = {
  id: string;
  consulta_id: string | null;
  phone_number: string;
  message_body: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  attempt_count: number;
  next_attempt_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  error_log: string | null;
  priority: number;
  reminder_type: string | null;
  sent_at: string | null;
};

type RecordatorioDetalle = Recordatorio & {
  consulta?: {
    id: string;
    consulta_id: string | null;
    sede: SedeType | null;
    estado_cita: ConsultaEstado | null;
  } | null;
  paciente?: {
    id: string;
    nombre: string;
  } | null;
};

export const STATE_COLORS: Record<string, string> = {
  // Estados de Leads
  nuevo: "border border-blue-400/60 bg-blue-500/15 text-blue-100",
  interactuando: "border border-sky-400/60 bg-sky-500/15 text-sky-100",
  contactado: "border border-cyan-400/60 bg-cyan-500/15 text-cyan-100",
  interesado: "border border-purple-400/60 bg-purple-500/15 text-purple-100",
  calificado: "border border-emerald-400/60 bg-emerald-500/15 text-emerald-100",
  escalado: "border border-orange-400/60 bg-orange-500/15 text-orange-100",
  cita_propuesta: "border border-purple-400/60 bg-purple-500/15 text-purple-100",
  en_seguimiento: "border border-amber-400/60 bg-amber-500/15 text-amber-100",
  cita_agendada: "border border-teal-400/60 bg-teal-500/15 text-teal-100",
  show: "border border-emerald-400/60 bg-emerald-500/15 text-emerald-100",
  convertido: "border border-teal-400/60 bg-teal-500/15 text-teal-100",
  no_show: "border border-red-400/60 bg-red-500/15 text-red-100",
  perdido: "border border-slate-400/60 bg-slate-500/15 text-slate-100",
  no_interesado: "border border-slate-400/60 bg-slate-500/15 text-slate-100",
  descartado: "border border-rose-400/60 bg-rose-500/15 text-rose-100",
  // Estados de Pacientes
  Activo: "border border-emerald-400/60 bg-emerald-500/15 text-emerald-100",
  Inactivo: "border border-slate-400/60 bg-slate-500/15 text-slate-100",
  Alta: "border border-cyan-400/60 bg-cyan-500/15 text-cyan-100",
  // Estados de Consultas
  Programada: "border border-sky-400/60 bg-sky-500/15 text-sky-100",
  Pendiente: "border border-amber-400/60 bg-amber-500/15 text-amber-100",
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

