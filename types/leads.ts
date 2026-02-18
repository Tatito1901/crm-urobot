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
// Flujo principal: nuevo → interactuando → contactado → cita_propuesta → cita_agendada → show → convertido
// Flujo alterno: (cualquiera) → en_seguimiento | perdido | no_interesado | descartado
// Post-cita: cita_agendada → show | no_show
export const LEAD_ESTADOS = [
  'nuevo', 'interactuando', 'contactado', 'cita_propuesta',
  'en_seguimiento', 'cita_agendada', 'show', 'convertido',
  'no_show', 'perdido', 'no_interesado', 'descartado'
] as const;
export type LeadEstado = (typeof LEAD_ESTADOS)[number];

// Temperaturas - Sincronizado con leads_temperatura_check
export const LEAD_TEMPERATURAS = ['frio', 'tibio', 'caliente', 'muy_caliente', 'urgente'] as const;
export type LeadTemperatura = (typeof LEAD_TEMPERATURAS)[number];

// Subestados - Sincronizado con leads_subestado_check
export const LEAD_SUBESTADOS = [
  'en_espera', 'seguimiento_sugerido', 'listo_para_contactar',
  'requiere_atencion', 'paciente_respondio', 'pregunto_precio',
  'describio_sintomas', 'solicito_cita', 'cita_confirmada', 'escalado_pendiente'
] as const;
export type LeadSubestado = (typeof LEAD_SUBESTADOS)[number];

// Estados terminales (no permiten transiciones)
export const LEAD_ESTADOS_TERMINALES: LeadEstado[] = ['convertido'];

// Estados "activos" en el pipeline
export const LEAD_ESTADOS_ACTIVOS: LeadEstado[] = [
  'nuevo', 'interactuando', 'contactado', 'cita_propuesta',
  'en_seguimiento', 'cita_agendada'
];

// Estados "cerrados" (no activos)
export const LEAD_ESTADOS_CERRADOS: LeadEstado[] = [
  'convertido', 'perdido', 'no_interesado', 'descartado'
];

// Display names para cada estado
export const LEAD_ESTADO_DISPLAY: Record<LeadEstado, string> = {
  nuevo: 'Nuevo',
  interactuando: 'Interactuando',
  contactado: 'Contactado',
  cita_propuesta: 'Cita Propuesta',
  en_seguimiento: 'En Seguimiento',
  cita_agendada: 'Cita Agendada',
  show: 'Asistió',
  convertido: 'Convertido',
  no_show: 'No Asistió',
  perdido: 'Perdido',
  no_interesado: 'No Interesado',
  descartado: 'Descartado',
};


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
  createdAt: string;
  updatedAt: string;
  
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
export const DEFAULT_LEAD_ESTADO: LeadEstado = 'nuevo';

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
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

export function isLeadEstado(value: unknown): value is LeadEstado {
  return typeof value === 'string' && (LEAD_ESTADOS as readonly string[]).includes(value);
}

export function isLeadTemperatura(value: unknown): value is LeadTemperatura {
  return typeof value === 'string' && (LEAD_TEMPERATURAS as readonly string[]).includes(value);
}

export function isLeadSubestado(value: unknown): value is LeadSubestado {
  return typeof value === 'string' && (LEAD_SUBESTADOS as readonly string[]).includes(value);
}
