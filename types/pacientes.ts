/**
 * ============================================================
 * TIPOS PACIENTES - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'pacientes'
 * Última sync: 2025-12-01
 */

import type { Tables, Views } from './database';

// ============================================================
// TIPO BD (automático de Supabase)
// ============================================================
export type PacienteRow = Tables<'pacientes'>;
export type PacienteStatsRow = Views<'paciente_stats'>;

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================
export const PACIENTE_ESTADOS = ['Activo', 'Inactivo', 'Alta'] as const;
export type PacienteEstado = (typeof PACIENTE_ESTADOS)[number];

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Paciente {
  // === Campos directos de BD ===
  id: string;
  nombreCompleto: string | null;     // BD: nombre_completo
  telefono: string;                   // BD: telefono (UNIQUE)
  email: string | null;               // BD: email
  fechaNacimiento: string | null;     // BD: fecha_nacimiento
  origenLead: string | null;          // BD: origen_lead (Default: 'WhatsApp')
  estado: PacienteEstado;             // BD: estado (Default: 'Activo') ✅ NUEVO
  notas: string | null;               // BD: notas ✅ NUEVO
  createdAt: string | null;           // BD: created_at
  updatedAt: string | null;           // BD: updated_at
  
  // === Campos calculados/UI (de vista paciente_stats) ===
  nombre: string;                     // Display name
  totalConsultas?: number;            // Vista: paciente_stats.total_consultas
  ultimaConsulta?: string | null;     // Vista: paciente_stats.ultima_consulta
  consultasCompletadas?: number;      // Vista: paciente_stats.consultas_completadas
  consultasCanceladas?: number;       // Vista: paciente_stats.consultas_canceladas
  consultasProgramadas?: number;      // Vista: paciente_stats.consultas_programadas
}

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapPacienteFromDB(
  row: PacienteRow, 
  stats?: PacienteStatsRow | null
): Paciente {
  return {
    // Campos directos
    id: row.id,
    nombreCompleto: row.nombre_completo,
    telefono: row.telefono,
    email: row.email,
    fechaNacimiento: row.fecha_nacimiento,
    origenLead: row.origen_lead,
    estado: isPacienteEstado(row.estado) ? row.estado : 'Activo',
    notas: row.notas,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // Calculados
    nombre: row.nombre_completo || row.telefono,
    
    // De vista paciente_stats (opcional)
    totalConsultas: stats?.total_consultas ?? undefined,
    ultimaConsulta: stats?.ultima_consulta,
    consultasCompletadas: stats?.consultas_completadas ?? undefined,
    consultasCanceladas: stats?.consultas_canceladas ?? undefined,
    consultasProgramadas: stats?.consultas_programadas ?? undefined,
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isPacienteEstado(value: unknown): value is PacienteEstado {
  return typeof value === 'string' && (PACIENTE_ESTADOS as readonly string[]).includes(value);
}
