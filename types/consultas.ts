/**
 * ============================================================
 * TIPOS CONSULTAS - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'consultas'
 * Última sync: 2025-11-28
 */

import type { Tables } from './database';

// ============================================================
// TIPO BD (automático de Supabase)
// ============================================================
export type ConsultaRow = Tables<'consultas'>;

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================

// Estados disponibles en BD (estado_cita)
export const CONSULTA_ESTADOS = ['Programada', 'Confirmada', 'Reagendada', 'Cancelada', 'Completada', 'No Asistió'] as const;

// Sedes disponibles (FK a tabla sedes)
export const CONSULTA_SEDES = ['POLANCO', 'SATELITE'] as const;

// Tipos de cita (tipo_cita) - Default en BD: 'Primera Vez'
export const CONSULTA_TIPOS = ['Primera Vez', 'Seguimiento', 'Urgencia', 'Procedimiento', 'Valoración'] as const;

export type ConsultaEstado = (typeof CONSULTA_ESTADOS)[number];
export type ConsultaSede = (typeof CONSULTA_SEDES)[number];
export type ConsultaTipo = (typeof CONSULTA_TIPOS)[number];

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Consulta {
  // === Campos directos de BD ===
  id: string;
  consultaId: string | null;       // BD: consulta_id
  pacienteId: string | null;       // BD: paciente_id
  sede: ConsultaSede | null;       // BD: sede (FK → sedes)
  fechaHoraInicio: string;         // BD: fecha_hora_inicio (timestamptz)
  fechaHoraFin: string;            // BD: fecha_hora_fin (timestamptz)
  estadoCita: ConsultaEstado;      // BD: estado_cita
  tipoCita: ConsultaTipo | null;   // BD: tipo_cita
  motivoConsulta: string | null;   // BD: motivo_consulta
  calendarEventId: string | null;  // BD: calendar_event_id
  calendarLink: string | null;     // BD: calendar_link
  createdAt: string | null;        // BD: created_at
  updatedAt: string | null;        // BD: updated_at
  
  // === Campos de confirmación/recordatorios ✅ NUEVOS ===
  confirmadoPaciente: boolean;           // BD: confirmado_paciente
  estadoConfirmacion: string | null;     // BD: estado_confirmacion ('Pendiente', 'Confirmada', etc)
  recordatorio24hEnviado: boolean;       // BD: recordatorio_24h_enviado
  recordatorio2hEnviado: boolean;        // BD: recordatorio_2h_enviado
  
  // === Campos calculados/UI ===
  paciente?: string;               // Nombre via JOIN
  duracionMinutos: number;         // Calculado: fin - inicio
  fechaConsulta: string;           // Calculado: YYYY-MM-DD
  horaConsulta: string;            // Calculado: HH:mm
  
  // === Métricas UI ===
  horasHastaConsulta?: number | null;
  diasHastaConsulta?: number | null;
}

// ============================================================
// DEFAULTS
// ============================================================
export const DEFAULT_CONSULTA_ESTADO: ConsultaEstado = 'Programada';
export const DEFAULT_CONSULTA_SEDE: ConsultaSede = 'POLANCO';
export const DEFAULT_CONSULTA_TIPO: ConsultaTipo = 'Primera Vez';

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapConsultaFromDB(row: ConsultaRow, pacienteNombre?: string): Consulta {
  const inicio = new Date(row.fecha_hora_inicio);
  const fin = new Date(row.fecha_hora_fin);
  const duracion = Math.round((fin.getTime() - inicio.getTime()) / 60000);
  
  return {
    // Campos directos
    id: row.id,
    consultaId: row.consulta_id,
    pacienteId: row.paciente_id,
    sede: isConsultaSede(row.sede) ? row.sede : null,
    fechaHoraInicio: row.fecha_hora_inicio,
    fechaHoraFin: row.fecha_hora_fin,
    estadoCita: isConsultaEstado(row.estado_cita) ? row.estado_cita : 'Programada',
    tipoCita: isConsultaTipo(row.tipo_cita) ? row.tipo_cita : 'Primera Vez',
    motivoConsulta: row.motivo_consulta,
    calendarEventId: row.calendar_event_id,
    calendarLink: row.calendar_link,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // Campos de confirmación/recordatorios
    confirmadoPaciente: row.confirmado_paciente ?? false,
    estadoConfirmacion: row.estado_confirmacion,
    recordatorio24hEnviado: row.recordatorio_24h_enviado ?? false,
    recordatorio2hEnviado: row.recordatorio_2h_enviado ?? false,
    
    // Calculados
    paciente: pacienteNombre || '',
    duracionMinutos: duracion,
    fechaConsulta: inicio.toISOString().split('T')[0],
    horaConsulta: inicio.toTimeString().slice(0, 5),
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isConsultaEstado(value: unknown): value is ConsultaEstado {
  return typeof value === 'string' && (CONSULTA_ESTADOS as readonly string[]).includes(value);
}

export function isConsultaSede(value: unknown): value is ConsultaSede {
  return typeof value === 'string' && (CONSULTA_SEDES as readonly string[]).includes(value);
}

export function isConsultaTipo(value: unknown): value is ConsultaTipo {
  return typeof value === 'string' && (CONSULTA_TIPOS as readonly string[]).includes(value);
}

