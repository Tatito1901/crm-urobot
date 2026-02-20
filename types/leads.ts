/**
 * ============================================================
 * TIPOS LEADS - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'leads'
 * Última sync: 2026-02-18 (BD whpnvmquoycvsxcmvtac)
 * 
 * CHECK constraints en BD:
 *   leads_estado_check: nuevo, contactado, interactuando, cita_propuesta,
 *     cita_agendada, en_seguimiento, convertido, descartado, no_interesado,
 *     perdido, show, no_show
 *   leads_temperatura_check: frio, tibio, caliente, muy_caliente, urgente
 *   leads_fuente_check: whatsapp, whatsapp_directo, meta_ads, instagram,
 *     google_ads, referido, sitio_web, doctoralia, otro
 *   leads_subestado_check: en_espera, seguimiento_sugerido, listo_para_contactar,
 *     requiere_atencion, paciente_respondio, pregunto_precio, describio_sintomas,
 *     solicito_cita, cita_confirmada, escalado_pendiente
 */

import type { Tables } from './database';
import { type CanalMarketing, normalizeCanalMarketing } from './canales-marketing';

// ============================================================
// TIPO BD (automático de Supabase)
// ============================================================
export type LeadRow = Tables<'leads'>;

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================

// Estados de lead (estado) - Sincronizado con leads_estado_check
export const LEAD_ESTADOS = [
  'nuevo', 'interactuando', 'contactado', 'cita_propuesta',
  'en_seguimiento', 'cita_agendada', 'show', 'convertido',
  'no_show', 'perdido', 'no_interesado', 'descartado'
] as const;
export type LeadEstado = (typeof LEAD_ESTADOS)[number];

// Temperaturas - Sincronizado con leads_temperatura_check
const LEAD_TEMPERATURAS = ['frio', 'tibio', 'caliente', 'muy_caliente', 'urgente'] as const;
export type LeadTemperatura = (typeof LEAD_TEMPERATURAS)[number];

// Subestados - Sincronizado con leads_subestado_check
const LEAD_SUBESTADOS = [
  'en_espera', 'seguimiento_sugerido', 'listo_para_contactar',
  'requiere_atencion', 'paciente_respondio', 'pregunto_precio',
  'describio_sintomas', 'solicito_cita', 'cita_confirmada', 'escalado_pendiente'
] as const;
export type LeadSubestado = (typeof LEAD_SUBESTADOS)[number];

// ============================================================
// MÁQUINA DE ESTADOS — Fuente de verdad para transiciones
// Mirrors DB function: validate_lead_transition()
// ============================================================
//
// Pipeline (bot automático, lineal):
//   nuevo → interactuando → cita_propuesta → cita_agendada
//
// Humano toma el caso (manual):
//   cualquier_activo → contactado
//
// Post-cita (manual/webhook):
//   cita_agendada → show | no_show
//
// Terminal:
//   show → convertido
//
// Salida (manual, desde cualquier activo):
//   → en_seguimiento | perdido | no_interesado | descartado
//
// Re-entrada (lead vuelve a escribir):
//   en_seguimiento/perdido/no_interesado → interactuando

// Transiciones válidas para HUMANO (CRM manual)
export const LEAD_TRANSITION_MATRIX: Record<LeadEstado, LeadEstado[]> = {
  nuevo:          ['interactuando', 'contactado', 'cita_propuesta', 'cita_agendada', 'en_seguimiento', 'perdido', 'no_interesado', 'descartado'],
  interactuando:  ['contactado', 'cita_propuesta', 'cita_agendada', 'en_seguimiento', 'perdido', 'no_interesado', 'descartado'],
  contactado:     ['cita_propuesta', 'cita_agendada', 'en_seguimiento', 'perdido', 'no_interesado', 'descartado'],
  cita_propuesta: ['cita_agendada', 'contactado', 'en_seguimiento', 'perdido', 'no_interesado', 'descartado'],
  cita_agendada:  ['show', 'no_show', 'en_seguimiento', 'perdido', 'descartado'],
  show:           ['convertido', 'en_seguimiento'],
  no_show:        ['contactado', 'cita_agendada', 'en_seguimiento', 'perdido'],
  convertido:     [],  // Terminal
  descartado:     [],  // Terminal
  en_seguimiento: ['interactuando', 'contactado', 'cita_propuesta', 'cita_agendada', 'perdido', 'no_interesado', 'descartado'],
  perdido:        ['interactuando', 'contactado'],
  no_interesado:  ['interactuando', 'contactado'],
};

// Descripción clara de cada estado para tooltips / documentación
export const LEAD_ESTADO_DESCRIPCION: Record<LeadEstado, string> = {
  nuevo:          'Primer mensaje recibido, sin interacción significativa',
  interactuando:  'Bot está conversando activamente con el paciente',
  contactado:     'Un humano del equipo tomó el caso',
  cita_propuesta: 'Se le ofreció disponibilidad de cita al paciente',
  cita_agendada:  'Cita confirmada en el calendario',
  show:           'Paciente asistió a la cita',
  no_show:        'Paciente no asistió a la cita',
  convertido:     'Se convirtió en paciente activo',
  en_seguimiento: 'Requiere seguimiento futuro (humano)',
  perdido:        'No respondió después de múltiples intentos',
  no_interesado:  'Paciente indicó que no le interesa',
  descartado:     'No es un lead real (spam, número equivocado, etc.)',
};

// Obtener transiciones válidas desde un estado
export function getValidTransitions(from: LeadEstado): LeadEstado[] {
  return LEAD_TRANSITION_MATRIX[from] ?? [];
}

// Validar si una transición es legal
export function isValidTransition(from: LeadEstado, to: LeadEstado): boolean {
  if (from === to) return true; // no-op
  return (LEAD_TRANSITION_MATRIX[from] ?? []).includes(to);
}

// Clasificaciones de estados
export const LEAD_ESTADOS_TERMINALES: LeadEstado[] = ['convertido', 'descartado'];

export const LEAD_ESTADOS_ACTIVOS: LeadEstado[] = [
  'nuevo', 'interactuando', 'contactado', 'cita_propuesta',
  'en_seguimiento', 'cita_agendada'
];

const LEAD_ESTADOS_CERRADOS: LeadEstado[] = [
  'convertido', 'perdido', 'no_interesado', 'descartado'
];

// Display names para cada estado
export const LEAD_ESTADO_DISPLAY: Record<LeadEstado, string> = {
  nuevo: 'Nuevo',
  interactuando: 'Bot activo',
  contactado: 'Contactado por humano',
  cita_propuesta: 'Cita ofrecida',
  en_seguimiento: 'En seguimiento',
  cita_agendada: 'Cita agendada',
  show: 'Asistió',
  convertido: 'Paciente',
  no_show: 'No asistió',
  perdido: 'Perdido',
  no_interesado: 'No interesado',
  descartado: 'Descartado',
};


// ============================================================
// INTERFACES DE DATOS ENRIQUECIDOS
// ============================================================

export interface LeadSignals {
  perfil_paciente: string | null;       // decidido, interesado_dudoso, solo_curiosidad, precio_primero, urgente
  emociones: string[];                   // miedo, ansiedad, frustración, esperanza, etc.
  nivel_compromiso: number | null;       // 1-10
  prediccion_conversion: string | null;  // alta, media, baja, muy_baja
  incentivo_sugerido: string | null;     // urgencia_temporal, prueba_social, reciprocidad, etc.
  barrera_principal?: string | null;     // precio, miedo, tiempo, desconfianza, distancia
  pregunto_precio?: boolean;
}

export interface LeadScores {
  necesidad_clinica: number;   // 0-35: Síntomas, severidad, urgencia
  intencion_agendar: number;   // 0-30: Intención de agendar cita
  compromiso: number;          // 0-20: Engagement (mensajes, actividad)
  perfil_paciente: number;     // 0-15: Fit del paciente (para quién, actitud)
}

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Lead {
  // === Campos directos de BD ===
  id: string;
  nombre: string;                      // BD: nombre
  telefono: string;                     // BD: telefono
  estado: LeadEstado;                   // BD: estado (CHECK constraint)
  fuente: CanalMarketing;              // BD: fuente (normalizado a display)
  canal: string | null;                // BD: canal
  temperatura: LeadTemperatura;        // BD: temperatura (CHECK constraint)
  notas: string | null;                // BD: notas
  email: string | null;                // BD: email
  convertidoAPacienteId: string | null;// BD: convertido_a_paciente_id
  totalMensajes: number;               // BD: total_mensajes
  ultimaInteraccion: string | null;    // BD: ultima_interaccion
  scoreTotal: number;                  // BD: score_total
  calificacion: string | null;         // BD: calificacion
  etapaFunnel: string | null;          // BD: etapa_funnel
  subestado: LeadSubestado | null;     // BD: subestado (CHECK constraint)
  accionRecomendada: string | null;    // BD: accion_recomendada
  fechaSiguienteAccion: string | null; // BD: fecha_siguiente_accion
  citaOfrecidaAt: string | null;       // BD: cita_ofrecida_at (auto-set by upsert_lead_v12)
  citaAgendadaAt: string | null;       // BD: cita_agendada_at (auto-set by upsert_lead_v12)
  createdAt: string;
  updatedAt: string;

  // === Datos behavioral (BD: leads.signals jsonb) ===
  signals: LeadSignals | null;
  scores: LeadScores | null;            // BD: leads.scores jsonb

  // === Meta Ads Attribution (BD: leads.campana_*) ===
  campanaId: string | null;             // BD: campana_id
  campanaHeadline: string | null;       // BD: campana_headline
  campanaUrl: string | null;            // BD: campana_url
  ctwaClid: string | null;              // BD: ctwa_clid
  esMetaAds: boolean;                   // Derivado: true si campana_id o ctwa_clid existen

  // === Datos clínicos (BD: lead_clinico JOIN) ===
  sintomasReportados: string[];        // BD: lead_clinico.sintomas_reportados

  // === Campos calculados/UI ===
  nombreDisplay: string;               // Display name
  estadoDisplay: string;               // LEAD_ESTADO_DISPLAY[estado]
  diasDesdeContacto: number;
  diasDesdeUltimaInteraccion: number | null;
  esCliente: boolean;                  // true si convertido_a_paciente_id existe
  esCaliente: boolean;
  esInactivo: boolean;
  esEnPipeline: boolean;               // true si estado in LEAD_ESTADOS_ACTIVOS
  requiereSeguimiento: boolean;        // true si fecha_siguiente_accion <= hoy
}

// ============================================================
// DEFAULTS
// ============================================================
const DEFAULT_LEAD_ESTADO: LeadEstado = 'nuevo';

// ============================================================
// PARSERS JSONB → TYPED
// ============================================================

function parseSignals(raw: unknown): LeadSignals | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  // Only return if there's at least one meaningful field
  if (!s.perfil_paciente && !s.prediccion_conversion && !s.nivel_compromiso) return null;
  return {
    perfil_paciente: (s.perfil_paciente as string) || null,
    emociones: Array.isArray(s.emociones) ? s.emociones : [],
    nivel_compromiso: typeof s.nivel_compromiso === 'number' ? s.nivel_compromiso : null,
    prediccion_conversion: (s.prediccion_conversion as string) || null,
    incentivo_sugerido: (s.incentivo_sugerido as string) || null,
    barrera_principal: (s.barrera_principal as string) || null,
    pregunto_precio: s.pregunto_precio === true,
  };
}

function parseScores(raw: unknown): LeadScores | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  // Support both v12 (new names) and v11 (old names) for backward compatibility
  const nc = s.necesidad_clinica ?? s.clinical;
  const ia = s.intencion_agendar ?? s.intent;
  if (nc === undefined && ia === undefined) return null;
  return {
    necesidad_clinica: Number(nc) || 0,
    intencion_agendar: Number(ia) || 0,
    compromiso: Number(s.compromiso ?? s.engagement) || 0,
    perfil_paciente: Number(s.perfil_paciente ?? s.bant) || 0,
  };
}

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapLeadFromDB(row: LeadRow): Lead {
  const now = Date.now();
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : now;
  const ultimaInteraccion = row.ultima_interaccion ? new Date(row.ultima_interaccion).getTime() : null;
  const fechaSiguienteAccion = row.fecha_siguiente_accion ? new Date(row.fecha_siguiente_accion).getTime() : null;
  
  const diasDesdeContacto = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  const diasDesdeUltima = ultimaInteraccion ? Math.floor((now - ultimaInteraccion) / (1000 * 60 * 60 * 24)) : null;
  
  const estado: LeadEstado = isLeadEstado(row.estado) ? row.estado : 'nuevo';
  const temperatura: LeadTemperatura = isLeadTemperatura(row.temperatura) ? row.temperatura : 'frio';
  const esCaliente = temperatura === 'caliente' || temperatura === 'muy_caliente' || temperatura === 'urgente';
  const esInactivo = (diasDesdeUltima || 0) > 7;
  const subestado = isLeadSubestado(row.subestado) ? row.subestado : null;

  return {
    id: row.id,
    nombre: row.nombre || row.telefono,
    telefono: row.telefono,
    estado,
    fuente: normalizeCanalMarketing(row.fuente),
    canal: row.canal,
    temperatura,
    notas: row.notas,
    email: row.email,
    convertidoAPacienteId: row.convertido_a_paciente_id,
    totalMensajes: row.total_mensajes || 0,
    ultimaInteraccion: row.ultima_interaccion,
    scoreTotal: row.score_total || 0,
    calificacion: row.calificacion,
    etapaFunnel: row.etapa_funnel,
    subestado,
    accionRecomendada: row.accion_recomendada,
    fechaSiguienteAccion: row.fecha_siguiente_accion,
    citaOfrecidaAt: (row as Record<string, unknown>).cita_ofrecida_at as string | null ?? null,
    citaAgendadaAt: (row as Record<string, unknown>).cita_agendada_at as string | null ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    // Behavioral signals
    signals: parseSignals(row.signals),
    scores: parseScores(row.scores),

    // Meta Ads attribution
    campanaId: (row as Record<string, unknown>).campana_id as string | null ?? null,
    campanaHeadline: (row as Record<string, unknown>).campana_headline as string | null ?? null,
    campanaUrl: (row as Record<string, unknown>).campana_url as string | null ?? null,
    ctwaClid: (row as Record<string, unknown>).ctwa_clid as string | null ?? null,
    esMetaAds: !!((row as Record<string, unknown>).campana_id || (row as Record<string, unknown>).ctwa_clid),

    // Clínicos (not available in single-row mapper, populated by paginated hook)
    sintomasReportados: [],

    // Calculados
    nombreDisplay: row.nombre || row.telefono,
    estadoDisplay: LEAD_ESTADO_DISPLAY[estado] || estado,
    diasDesdeContacto,
    diasDesdeUltimaInteraccion: diasDesdeUltima,
    esCliente: !!row.convertido_a_paciente_id,
    esCaliente,
    esInactivo,
    esEnPipeline: (LEAD_ESTADOS_ACTIVOS as readonly string[]).includes(estado),
    requiereSeguimiento: fechaSiguienteAccion !== null && fechaSiguienteAccion <= now,
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

function isLeadEstado(value: unknown): value is LeadEstado {
  return typeof value === 'string' && (LEAD_ESTADOS as readonly string[]).includes(value);
}

function isLeadTemperatura(value: unknown): value is LeadTemperatura {
  return typeof value === 'string' && (LEAD_TEMPERATURAS as readonly string[]).includes(value);
}

function isLeadSubestado(value: unknown): value is LeadSubestado {
  return typeof value === 'string' && (LEAD_SUBESTADOS as readonly string[]).includes(value);
}
