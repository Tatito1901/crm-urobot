/**
 * ============================================================
 * TIPOS CRM - OPTIMIZADOS
 * ============================================================
 * Usa tipos de database.ts como fuente de verdad
 * Solo define enums adicionales y transformaciones necesarias
 */

import type { Tables } from "@/types/database";

// ===== ENUMS Y TIPOS LITERALES =====
export type TabKey = "leads" | "pacientes" | "consultas" | "confirmaciones" | "metricas";

export type LeadEstado = "Nuevo" | "En seguimiento" | "Convertido" | "Descartado";
export type PacienteEstado = "Activo" | "Inactivo";
export type ConsultaEstado = "Programada" | "Confirmada" | "Reagendada" | "Cancelada" | "Completada";
export type RecordatorioTipo = "confirmacion_inicial" | "48h" | "24h" | "3h";
export type RecordatorioEstado = "pendiente" | "procesando" | "enviado" | "error";
export type SedeType = "POLANCO" | "SATELITE";

// ===== TIPOS BASE (desde Supabase) =====
export type LeadRow = Tables<"leads">;
export type PacienteRow = Tables<"pacientes">;
export type ConsultaRow = Tables<"consultas">;
export type RecordatorioRow = Tables<"recordatorios">;

// ===== TIPOS TRANSFORMADOS PARA UI =====
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
  estado: PacienteEstado;
};

export type Consulta = {
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

export type Recordatorio = RecordatorioRow;

export type RecordatorioDetalle = Recordatorio & {
  consulta?: {
    id: string;
    consulta_id: string | null;
    sede: SedeType | null;
    estado_cita: ConsultaEstado | null;
  } | null;
  paciente?: {
    id: string;
    nombre_completo: string;
  } | null;
};

export const STATE_COLORS: Record<string, string> = {
  Nuevo: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/60 dark:bg-blue-500/15 dark:text-blue-100",
  "En seguimiento": "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/60 dark:bg-amber-500/15 dark:text-amber-100",
  Convertido: "border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-400/60 dark:bg-teal-500/15 dark:text-teal-100",
  Descartado: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/60 dark:bg-rose-500/15 dark:text-rose-100",
  Programada: "border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/60 dark:bg-sky-500/15 dark:text-sky-100",
  Confirmada: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-100",
  Reagendada: "border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-400/60 dark:bg-orange-500/15 dark:text-orange-100",
  Cancelada: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/70 dark:bg-rose-600/20 dark:text-rose-100",
  Completada: "border border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-400/60 dark:bg-lime-500/15 dark:text-lime-100",
  procesando: "border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/60 dark:bg-indigo-500/15 dark:text-indigo-100",
  pendiente: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/60 dark:bg-amber-500/15 dark:text-amber-100",
  enviado: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-100",
  error: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/70 dark:bg-rose-600/20 dark:text-rose-100",
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

