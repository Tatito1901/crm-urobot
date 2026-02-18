/**
 * ============================================================
 * TIPOS LEADS - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'leads'
 * Última sync: 2026-02-17 (nueva BD whpnvmquoycvsxcmvtac)
 */

import { type CanalMarketing, normalizeCanalMarketing } from './canales-marketing';

// ============================================================
// TIPO BD (manual - tipos generados están incompletos)
// ============================================================
export interface LeadRow {
  id: string;
  nombre: string;
  telefono: string;
  telefono_normalizado: string | null;
  estado: string;
  fuente: string;
  canal: string | null;
  temperatura: string;
  notas: string | null;
  email: string | null;
  convertido_a_paciente_id: string | null;
  total_mensajes: number | null;
  ultima_interaccion: string | null;
  score_total: number | null;
  scores: Record<string, unknown> | null;
  signals: Record<string, unknown> | null;
  calificacion: string | null;
  etapa_funnel: string | null;
  etapa_funnel_at: string | null;
  subestado: string | null;
  nombre_confirmado: string | null;
  nombre_pendiente_confirmar: boolean | null;
  accion_recomendada: string | null;
  fecha_siguiente_accion: string | null;
  motivo_descarte: string | null;
  motivo_escalado: string | null;
  escalado_at: string | null;
  ultimo_mensaje_bot: string | null;
  ultimo_mensaje_bot_at: string | null;
  ultimo_mensaje_usuario: string | null;
  ultimo_mensaje_usuario_at: string | null;
  campana_id: string | null;
  campana_url: string | null;
  campana_headline: string | null;
  ctwa_clid: string | null;
  referral_data: Record<string, unknown> | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================

// Estados de lead (estado) - Default en BD: 'Nuevo'
export const LEAD_ESTADOS = ['nuevo', 'contactado', 'interesado', 'calificado', 'escalado', 'cita_agendada', 'convertido', 'no_interesado', 'descartado'] as const;
export type LeadEstado = (typeof LEAD_ESTADOS)[number];

// Temperaturas calculadas (NO existe en BD)
export const LEAD_TEMPERATURAS = ['frio', 'tibio', 'caliente', 'muy_caliente'] as const;
export type LeadTemperatura = (typeof LEAD_TEMPERATURAS)[number];


// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Lead {
  // === Campos directos de BD ===
  id: string;
  nombre: string;                      // BD: nombre
  telefono: string;                     // BD: telefono
  estado: LeadEstado;                   // BD: estado
  fuente: CanalMarketing;              // BD: fuente (normalizado)
  canal: string | null;                // BD: canal
  temperatura: LeadTemperatura;        // BD: temperatura
  notas: string | null;                // BD: notas
  email: string | null;                // BD: email
  convertidoAPacienteId: string | null;// BD: convertido_a_paciente_id
  totalMensajes: number;               // BD: total_mensajes
  ultimaInteraccion: string | null;    // BD: ultima_interaccion
  scoreTotal: number;                  // BD: score_total
  calificacion: string | null;         // BD: calificacion
  etapaFunnel: string | null;          // BD: etapa_funnel
  subestado: string | null;            // BD: subestado
  accionRecomendada: string | null;    // BD: accion_recomendada
  fechaSiguienteAccion: string | null; // BD: fecha_siguiente_accion
  createdAt: string;
  updatedAt: string;
  
  // === Campos calculados/UI ===
  nombreDisplay: string;               // Display name
  diasDesdeContacto: number;
  diasDesdeUltimaInteraccion: number | null;
  esCliente: boolean;                  // true si convertido_a_paciente_id existe
  esCaliente: boolean;
  esInactivo: boolean;
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
  
  const temperatura: LeadTemperatura = isLeadTemperatura(row.temperatura) ? row.temperatura : 'frio';
  const esCaliente = temperatura === 'caliente' || temperatura === 'muy_caliente';
  const esInactivo = (diasDesdeUltima || 0) > 7;

  return {
    id: row.id,
    nombre: row.nombre || row.telefono,
    telefono: row.telefono,
    estado: isLeadEstado(row.estado) ? row.estado : 'nuevo',
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
    subestado: row.subestado,
    accionRecomendada: row.accion_recomendada,
    fechaSiguienteAccion: row.fecha_siguiente_accion,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // Calculados
    nombreDisplay: row.nombre || row.telefono,
    diasDesdeContacto,
    diasDesdeUltimaInteraccion: diasDesdeUltima,
    esCliente: !!row.convertido_a_paciente_id,
    esCaliente,
    esInactivo,
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
