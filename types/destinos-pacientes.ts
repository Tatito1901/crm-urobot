/**
 * ============================================================
 * TIPOS DESTINOS PACIENTES - HISTORIAL DE ACCIONES
 * ============================================================
 * Fuente de verdad: Supabase tabla 'destinos_pacientes'
 * Última sync: 2025-12-01
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
  // Safe access for columns that may differ between old/new schema
  const r = row as Record<string, unknown>;
  
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    tipoDestino,
    fechaRegistro: (r.fecha_registro as string | null) ?? (r.fecha_programada as string | null) ?? null,
    observaciones: (r.observaciones as string | null) ?? (row.notas as string | null) ?? null,
    motivoAlta: (r.motivo_alta as string | null) ?? null,
    tipoCirugia: row.tipo_cirugia,
    monto: row.monto,
    moneda: isMoneda(r.moneda) ? r.moneda as Moneda : 'MXN',
    fechaEvento: (r.fecha_evento as string | null) ?? (r.fecha_programada as string | null) ?? null,
    sedeOperacion: (r.sede_operacion as string | null) ?? null,
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

export function prepareDestinoForInsert(input: CreateDestinoInput): Record<string, unknown> {
  // Build notas combining observaciones, motivoAlta, sedeOperacion into single field
  const notasParts: string[] = [];
  if (input.observaciones) notasParts.push(input.observaciones);
  if (input.motivoAlta) notasParts.push(`Motivo alta: ${input.motivoAlta}`);
  if (input.sedeOperacion) notasParts.push(`Sede: ${input.sedeOperacion}`);
  if (input.notas) notasParts.push(input.notas);
  
  return {
    paciente_id: input.pacienteId,
    tipo_destino: input.tipoDestino,
    tipo_cirugia: input.tipoCirugia ?? null,
    monto: input.monto ?? null,
    fecha_programada: input.fechaEvento ?? null,
    notas: notasParts.length > 0 ? notasParts.join(' | ') : null,
  };
}
