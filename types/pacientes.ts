/**
 * ============================================================
 * TIPOS PACIENTES - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'pacientes'
 * Última sync: 2026-02-18 (BD whpnvmquoycvsxcmvtac)
 * CHECK constraint: activo, inactivo, alta, seguimiento
 */

import type { Tables } from './database';

// ============================================================
// TIPO BD (automático de Supabase)
// ============================================================
export type PacienteRow = Tables<'pacientes'>;

// Stats ahora están en la tabla pacientes directamente
export interface PacienteStatsRow {
  paciente_id: string;
  total_consultas: number | null;
  ultima_consulta: string | null;
}

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================
export const PACIENTE_ESTADOS = ['activo', 'inactivo', 'alta', 'seguimiento'] as const;
export type PacienteEstado = (typeof PACIENTE_ESTADOS)[number];

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Paciente {
  // === Campos directos de BD ===
  id: string;
  nombre: string;                     // BD: nombre
  apellido: string | null;            // BD: apellido
  telefono: string;                   // BD: telefono (UNIQUE)
  email: string | null;               // BD: email
  fechaNacimiento: string | null;     // BD: fecha_nacimiento
  genero: string | null;              // BD: genero
  fuente: string | null;              // BD: fuente
  origenLead: string | null;          // BD: origen_lead
  estado: PacienteEstado;             // BD: estado
  esActivo: boolean;                  // BD: es_activo
  observaciones: string | null;       // BD: observaciones
  leadId: string | null;              // BD: lead_id
  createdAt: string | null;           // BD: created_at
  updatedAt: string | null;           // BD: updated_at
  
  // === Campos calculados/UI ===
  nombreDisplay: string;              // Display name
  totalConsultas?: number;            // BD: total_consultas
  ultimaConsulta?: string | null;     // BD: ultima_consulta
}

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapPacienteFromDB(
  row: PacienteRow, 
  stats?: PacienteStatsRow | null
): Paciente {
  const nombre = (row as Record<string, unknown>).nombre as string ?? row.telefono;
  const apellido = (row as Record<string, unknown>).apellido as string | null ?? null;
  const esActivo = (row as Record<string, unknown>).es_activo as boolean ?? true;
  const observaciones = (row as Record<string, unknown>).observaciones as string | null ?? null;
  const leadId = (row as Record<string, unknown>).lead_id as string | null ?? null;
  const fuente = (row as Record<string, unknown>).fuente as string | null ?? null;
  const genero = (row as Record<string, unknown>).genero as string | null ?? null;
  const totalConsultasBD = (row as Record<string, unknown>).total_consultas as number | null ?? null;
  const ultimaConsultaBD = (row as Record<string, unknown>).ultima_consulta as string | null ?? null;
  
  return {
    id: row.id,
    nombre,
    apellido,
    telefono: row.telefono,
    email: row.email,
    fechaNacimiento: row.fecha_nacimiento,
    genero,
    fuente,
    origenLead: row.origen_lead,
    estado: isPacienteEstado(row.estado) ? row.estado : 'activo',
    esActivo,
    observaciones,
    leadId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // Calculados
    nombreDisplay: nombre || row.telefono,
    totalConsultas: stats?.total_consultas ?? totalConsultasBD ?? undefined,
    ultimaConsulta: stats?.ultima_consulta ?? ultimaConsultaBD,
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isPacienteEstado(value: unknown): value is PacienteEstado {
  return typeof value === 'string' && (PACIENTE_ESTADOS as readonly string[]).includes(value);
}
