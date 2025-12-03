/**
 * ============================================================
 * TIPOS CONSULTAS NOTAS - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'consultas_notas'
 * Última sync: 2025-12-01
 */

import type { Tables, Insertable, Updatable } from './database';

// ============================================================
// TIPO BD (automático de Supabase)
// ============================================================
export type ConsultaNotaRow = Tables<'consultas_notas'>;
export type ConsultaNotaInsert = Insertable<'consultas_notas'>;
export type ConsultaNotaUpdate = Updatable<'consultas_notas'>;

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface ConsultaNota {
  id: string;
  consultaId: string | null;     // BD: consulta_id (FK → consultas.id) - puede ser null para episodios independientes
  nota: string;                  // BD: nota (texto libre con observaciones)
  createdAt: string | null;      // BD: created_at
  updatedAt: string | null;      // BD: updated_at
}

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapConsultaNotaFromDB(row: ConsultaNotaRow): ConsultaNota {
  return {
    id: row.id,
    consultaId: row.consulta_id,
    nota: row.nota,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// HELPER PARA CREAR/ACTUALIZAR
// ============================================================

export function prepareNotaForInsert(consultaId: string, nota: string): ConsultaNotaInsert {
  return {
    consulta_id: consultaId,
    nota,
  };
}

export function prepareNotaForUpdate(nota: string): ConsultaNotaUpdate {
  return {
    nota,
    updated_at: new Date().toISOString(),
  };
}
