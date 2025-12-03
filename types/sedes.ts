/**
 * ============================================================
 * TIPOS SEDES - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'sedes'
 * Última sync: 2025-12-01
 */

// ============================================================
// TIPO BD (manual - tipos generados están desactualizados)
// ============================================================
export interface SedeRow {
  sede: string;
  display_name: string | null;
  direccion: string | null;
  maps_url: string | null;
  calendar_id: string | null;
  horario_json: Record<string, unknown> | null;
  timezone: string | null;
  anchor_date: string | null;
  anchor_week_type: string | null;
  updated_at: string | null;
  instrucciones_llegada: string | null;
}

// ============================================================
// CONSTANTES
// ============================================================
export const SEDES = ['POLANCO', 'SATELITE'] as const;
export type SedeId = (typeof SEDES)[number];

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Sede {
  // === Campos directos de BD ===
  id: string;                            // BD: sede (PK)
  displayName: string | null;            // BD: display_name
  direccion: string | null;              // BD: direccion
  mapsUrl: string | null;                // BD: maps_url
  calendarId: string | null;             // BD: calendar_id
  horarioJson: Record<string, unknown> | null; // BD: horario_json
  timezone: string;                      // BD: timezone (default: 'America/Mexico_City')
  anchorDate: string | null;             // BD: anchor_date
  anchorWeekType: string | null;         // BD: anchor_week_type
  instruccionesLlegada: string | null;   // BD: instrucciones_llegada ✅ NUEVO
  updatedAt: string | null;              // BD: updated_at
}

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapSedeFromDB(row: SedeRow): Sede {
  return {
    id: row.sede,
    displayName: row.display_name,
    direccion: row.direccion,
    mapsUrl: row.maps_url,
    calendarId: row.calendar_id,
    horarioJson: row.horario_json as Record<string, unknown> | null,
    timezone: row.timezone || 'America/Mexico_City',
    anchorDate: row.anchor_date,
    anchorWeekType: row.anchor_week_type,
    instruccionesLlegada: row.instrucciones_llegada,
    updatedAt: row.updated_at,
  };
}
