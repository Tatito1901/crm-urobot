/**
 * ============================================================
 * TIPOS - Sedes y Horarios
 * ============================================================
 * Modelo de datos para la tabla `sedes` de Supabase
 * Usado por el frontend (configuración de horarios) y n8n (disponibilidad)
 */

// ========== HORARIO JSON STRUCTURE ==========
// Formato esperado por n8n CARGAR_HORARIOS / SCHEDULE_GATE

/** Turno: ["HH:MM", "HH:MM"] */
export type Turno = [string, string];

/** Horarios por día de la semana */
export interface HorarioDia {
  lunes: Turno[];
  martes: Turno[];
  miercoles: Turno[];
  jueves: Turno[];
  viernes: Turno[];
  sabado: Turno[];
  domingo: Turno[];
}

/** Estructura completa de horario_json con semanas A/B */
export interface HorarioJson {
  weekA: HorarioDia;
  weekB: HorarioDia;
}

// ========== SEDES ROW (BD) ==========

export interface SedeRow {
  id: string;
  sede: string;
  display_name: string | null;
  direccion: string | null;
  maps_url: string | null;
  calendar_id: string | null;
  horario_json: HorarioJson | null;
  timezone: string | null;
  anchor_date: string | null;
  anchor_week_type: string | null;
  instrucciones_llegada: string | null;
  activo: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// ========== FRONTEND MODEL (camelCase) ==========

export interface Sede {
  id: string;
  sede: string;
  displayName: string;
  direccion: string;
  mapsUrl: string | null;
  calendarId: string | null;
  horarioJson: HorarioJson | null;
  timezone: string;
  anchorDate: string | null;
  anchorWeekType: string | null;
  instruccionesLlegada: string | null;
  activo: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

// ========== MAPPERS ==========

export function mapSedeFromDB(row: SedeRow): Sede {
  return {
    id: row.id,
    sede: row.sede,
    displayName: row.display_name || row.sede,
    direccion: row.direccion || '',
    mapsUrl: row.maps_url,
    calendarId: row.calendar_id,
    horarioJson: row.horario_json,
    timezone: row.timezone || 'America/Mexico_City',
    anchorDate: row.anchor_date,
    anchorWeekType: row.anchor_week_type,
    instruccionesLlegada: row.instrucciones_llegada,
    activo: row.activo ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ========== CONSTANTS ==========

export const DIAS_SEMANA = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const DIAS_LABELS: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

/** Horario vacío por defecto */
export const EMPTY_HORARIO_DIA: HorarioDia = {
  lunes: [],
  martes: [],
  miercoles: [],
  jueves: [],
  viernes: [],
  sabado: [],
  domingo: [],
};

const EMPTY_HORARIO_JSON: HorarioJson = {
  weekA: { ...EMPTY_HORARIO_DIA },
  weekB: { ...EMPTY_HORARIO_DIA },
};
