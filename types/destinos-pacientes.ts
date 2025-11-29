/**
 * ============================================================
 * TIPOS DESTINOS PACIENTES - HISTORIAL DE ACCIONES
 * ============================================================
 * Fuente de verdad: Supabase tabla 'destinos_pacientes'
 * Última sync: 2025-11-28
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
  pacienteId: string;               // BD: paciente_id (FK)
  tipoDestino: TipoDestino;         // BD: tipo_destino
  fechaRegistro: string | null;     // BD: fecha_registro
  observaciones: string | null;     // BD: observaciones
  
  // === Campos específicos Alta ===
  motivoAlta: string | null;        // BD: motivo_alta
  
  // === Campos específicos Presupuesto/Cirugía ===
  tipoCirugia: string | null;       // BD: tipo_cirugia
  monto: number | null;             // BD: monto
  moneda: Moneda;                   // BD: moneda (Default: 'MXN')
  fechaEvento: string | null;       // BD: fecha_evento
  sedeOperacion: string | null;     // BD: sede_operacion
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
    fechaRegistro: row.fecha_registro,
    observaciones: row.observaciones,
    motivoAlta: row.motivo_alta,
    tipoCirugia: row.tipo_cirugia,
    monto: row.monto,
    moneda: isMoneda(row.moneda) ? row.moneda : 'MXN',
    fechaEvento: row.fecha_evento,
    sedeOperacion: row.sede_operacion,
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
  observaciones?: string;
  motivoAlta?: string;
  tipoCirugia?: string;
  monto?: number;
  moneda?: Moneda;
  fechaEvento?: string;
  sedeOperacion?: string;
  notas?: string;
}

export function prepareDestinoForInsert(input: CreateDestinoInput): Partial<DestinoPacienteRow> {
  return {
    paciente_id: input.pacienteId,
    tipo_destino: input.tipoDestino,
    observaciones: input.observaciones ?? null,
    motivo_alta: input.motivoAlta ?? null,
    tipo_cirugia: input.tipoCirugia ?? null,
    monto: input.monto ?? null,
    moneda: input.moneda ?? 'MXN',
    fecha_evento: input.fechaEvento ?? null,
    sede_operacion: input.sedeOperacion ?? null,
    notas: input.notas ?? null,
  };
}
