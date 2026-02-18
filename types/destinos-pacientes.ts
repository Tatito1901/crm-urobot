/**
 * ============================================================
 * TIPOS DESTINOS PACIENTES - HISTORIAL DE ACCIONES
 * ============================================================
 * Fuente de verdad: Supabase tabla 'destinos_pacientes'
 * Última sync: 2026-02-18
 * BD columns: id, paciente_id, tipo_destino, tipo_cirugia, monto,
 *   fecha_programada, estado, notas, created_at, updated_at
 */

import type { Tables } from './database';

// ============================================================
// TIPO BD (automático de Supabase)
// ============================================================
export type DestinoPacienteRow = Tables<'destinos_pacientes'>;

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================

export const TIPOS_DESTINO = [
  'alta_definitiva',
  'presupuesto_enviado', 
  'cirugia_realizada',
  'seguimiento',
  'pendiente'
] as const;

export const TIPOS_CIRUGIA = [
  'Prostatectomía',
  'Cistoscopía',
  'Vasectomía',
  'Circuncisión',
  'RTU Próstata',
  'Litotricia',
  'Nefrectomía',
  'Otro'
] as const;

export const MONEDAS = ['MXN', 'USD'] as const;

export type TipoDestino = (typeof TIPOS_DESTINO)[number];
export type TipoCirugia = (typeof TIPOS_CIRUGIA)[number];
export type Moneda = (typeof MONEDAS)[number];

// Labels para UI
export const DESTINO_LABELS: Record<TipoDestino, string> = {
  alta_definitiva: 'Alta Definitiva',
  presupuesto_enviado: 'Presupuesto Enviado',
  cirugia_realizada: 'Cirugía Realizada',
  seguimiento: 'En Seguimiento',
  pendiente: 'Pendiente'
};

export const DESTINO_COLORS: Record<TipoDestino, string> = {
  alta_definitiva: 'bg-green-500',
  presupuesto_enviado: 'bg-blue-500',
  cirugia_realizada: 'bg-purple-500',
  seguimiento: 'bg-yellow-500',
  pendiente: 'bg-gray-500'
};

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface DestinoPaciente {
  // === Campos directos de BD ===
  id: string;
  pacienteId: string | null;         // BD: paciente_id (FK)
  tipoDestino: TipoDestino;         // BD: tipo_destino
  tipoCirugia: string | null;       // BD: tipo_cirugia
  monto: number | null;             // BD: monto (numeric)
  fechaProgramada: string | null;   // BD: fecha_programada (date)
  estado: string | null;            // BD: estado (default 'pendiente')
  notas: string | null;             // BD: notas
  createdAt: string | null;         // BD: created_at
  updatedAt: string | null;         // BD: updated_at
  
  // === UI helpers ===
  label: string;                    // Label para mostrar
  color: string;                    // Color badge
}

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapDestinoPacienteFromDB(row: DestinoPacienteRow): DestinoPaciente {
  const tipoDestino = isTipoDestino(row.tipo_destino) ? row.tipo_destino : 'pendiente';
  
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    tipoDestino,
    tipoCirugia: row.tipo_cirugia,
    monto: row.monto,
    fechaProgramada: row.fecha_programada,
    estado: row.estado,
    notas: row.notas,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // UI helpers
    label: DESTINO_LABELS[tipoDestino],
    color: DESTINO_COLORS[tipoDestino],
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isTipoDestino(value: unknown): value is TipoDestino {
  return typeof value === 'string' && (TIPOS_DESTINO as readonly string[]).includes(value);
}

export function isMoneda(value: unknown): value is Moneda {
  return typeof value === 'string' && (MONEDAS as readonly string[]).includes(value);
}

// ============================================================
// HELPERS PARA CREAR
// ============================================================

export interface CreateDestinoInput {
  pacienteId: string;
  tipoDestino: TipoDestino;
  tipoCirugia?: string;
  monto?: number;
  fechaProgramada?: string;
  notas?: string;
}

export function prepareDestinoForInsert(input: CreateDestinoInput): Record<string, unknown> {
  return {
    paciente_id: input.pacienteId,
    tipo_destino: input.tipoDestino,
    tipo_cirugia: input.tipoCirugia ?? null,
    monto: input.monto ?? null,
    fecha_programada: input.fechaProgramada ?? null,
    notas: input.notas ?? null,
  };
}
