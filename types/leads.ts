/**
 * ============================================================
 * TIPOS LEADS - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'leads'
 * Última sync: 2025-12-01
 */

import { type CanalMarketing, normalizeCanalMarketing } from './canales-marketing';

// ============================================================
// TIPO BD (manual - tipos generados están incompletos)
// ============================================================
export interface LeadRow {
  id: string;
  paciente_id: string | null;
  telefono_whatsapp: string;
  estado: string | null;
  fuente_lead: string | null;
  canal_marketing: string | null;
  notas_iniciales: string | null;
  session_id: string | null;
  fecha_primer_contacto: string | null;
  ultima_interaccion: string | null;
  fecha_conversion: string | null;
  total_interacciones: number | null;
  created_at: string | null;
  updated_at: string | null;
  nombre_completo: string | null;
  // Nuevos campos de clasificación
  tipo_contacto: string | null;
  motivo_contacto: string | null;
  prioridad: string | null;
  score: number | null;
  etiquetas: string[] | null;
  ultimo_seguimiento: string | null;
  proximo_seguimiento: string | null;
  asignado_a: string | null;
  notas_seguimiento: string | null;
}

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================

// Estados de lead (estado) - Default en BD: 'Nuevo'
export const LEAD_ESTADOS = ['Nuevo', 'Contactado', 'Interesado', 'Calificado', 'Convertido', 'No_Interesado', 'Perdido'] as const;
export type LeadEstado = (typeof LEAD_ESTADOS)[number];

// Temperaturas calculadas (NO existe en BD)
export const LEAD_TEMPERATURAS = ['Frio', 'Tibio', 'Caliente'] as const;
export type LeadTemperatura = (typeof LEAD_TEMPERATURAS)[number];

// Tipo de contacto - Clasificación del lead
export const TIPO_CONTACTO = ['prospecto', 'paciente_existente', 'reenganche', 'referido'] as const;
export type TipoContacto = (typeof TIPO_CONTACTO)[number];

// Motivo de contacto
export const MOTIVO_CONTACTO = ['consulta_nueva', 'duda_medica', 'seguimiento_cita', 'reagendar', 'cancelar', 'resultados', 'cotizacion', 'ubicacion', 'otro'] as const;
export type MotivoContacto = (typeof MOTIVO_CONTACTO)[number];

// Prioridad del lead
export const LEAD_PRIORIDAD = ['baja', 'media', 'alta', 'urgente'] as const;
export type LeadPrioridad = (typeof LEAD_PRIORIDAD)[number];

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Lead {
  // === Campos directos de BD ===
  id: string;
  pacienteId: string | null;           // BD: paciente_id
  telefono: string;                     // BD: telefono_whatsapp
  nombreCompleto: string | null;        // BD: nombre_completo
  estado: LeadEstado;                   // BD: estado
  fuente: CanalMarketing;              // BD: fuente_lead (normalizado)
  canalMarketing: string | null;       // BD: canal_marketing
  notas: string | null;                // BD: notas_iniciales
  sessionId: string | null;            // BD: session_id
  primerContacto: string | null;       // BD: fecha_primer_contacto
  ultimaInteraccion: string | null;    // BD: ultima_interaccion
  fechaConversion: string | null;      // BD: fecha_conversion
  totalInteracciones: number;          // BD: total_interacciones
  createdAt: string | null;
  updatedAt: string | null;
  
  // === Campos de clasificación (NUEVOS) ===
  tipoContacto: TipoContacto;          // BD: tipo_contacto
  motivoContacto: MotivoContacto;      // BD: motivo_contacto
  prioridad: LeadPrioridad;            // BD: prioridad
  score: number;                       // BD: score (0-100)
  etiquetas: string[];                 // BD: etiquetas
  ultimoSeguimiento: string | null;    // BD: ultimo_seguimiento
  proximoSeguimiento: string | null;   // BD: proximo_seguimiento
  asignadoA: string | null;            // BD: asignado_a
  notasSeguimiento: string | null;     // BD: notas_seguimiento
  
  // === Campos calculados/UI ===
  nombre: string;                      // Display name
  temperatura: LeadTemperatura;        // Calculado de interacciones
  diasDesdeContacto: number;
  diasDesdeUltimaInteraccion: number | null;
  esCliente: boolean;                  // true si paciente_id existe
  esPacienteExistente: boolean;        // true si tipo_contacto = 'paciente_existente'
  esCaliente: boolean;
  esInactivo: boolean;
  requiereSeguimiento: boolean;        // true si proximo_seguimiento <= hoy
}

// ============================================================
// DEFAULTS
// ============================================================
export const DEFAULT_LEAD_ESTADO: LeadEstado = 'Nuevo';

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapLeadFromDB(row: LeadRow, pacienteNombre?: string): Lead {
  const now = Date.now();
  const primerContacto = row.fecha_primer_contacto ? new Date(row.fecha_primer_contacto).getTime() : now;
  const ultimaInteraccion = row.ultima_interaccion ? new Date(row.ultima_interaccion).getTime() : null;
  const proximoSeguimiento = row.proximo_seguimiento ? new Date(row.proximo_seguimiento).getTime() : null;
  
  const diasDesdeContacto = Math.floor((now - primerContacto) / (1000 * 60 * 60 * 24));
  const diasDesdeUltima = ultimaInteraccion ? Math.floor((now - ultimaInteraccion) / (1000 * 60 * 60 * 24)) : null;
  
  // Calcular temperatura basado en interacciones
  const interacciones = row.total_interacciones || 0;
  const temperatura: LeadTemperatura = interacciones > 10 ? 'Caliente' : interacciones > 3 ? 'Tibio' : 'Frio';
  
  // Clasificación
  const tipoContacto = isTipoContacto(row.tipo_contacto) ? row.tipo_contacto : 'prospecto';
  const esPacienteExistente = tipoContacto === 'paciente_existente';

  return {
    // Campos directos
    id: row.id,
    pacienteId: row.paciente_id,
    telefono: row.telefono_whatsapp,
    nombreCompleto: row.nombre_completo,
    estado: isLeadEstado(row.estado) ? row.estado : 'Nuevo',
    fuente: normalizeCanalMarketing(row.fuente_lead),
    canalMarketing: row.canal_marketing,
    notas: row.notas_iniciales,
    sessionId: row.session_id,
    primerContacto: row.fecha_primer_contacto,
    ultimaInteraccion: row.ultima_interaccion,
    fechaConversion: row.fecha_conversion,
    totalInteracciones: interacciones,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // Campos de clasificación
    tipoContacto,
    motivoContacto: isMotivoContacto(row.motivo_contacto) ? row.motivo_contacto : 'consulta_nueva',
    prioridad: isLeadPrioridad(row.prioridad) ? row.prioridad : 'media',
    score: row.score || 0,
    etiquetas: row.etiquetas || [],
    ultimoSeguimiento: row.ultimo_seguimiento,
    proximoSeguimiento: row.proximo_seguimiento,
    asignadoA: row.asignado_a,
    notasSeguimiento: row.notas_seguimiento,
    
    // Calculados
    nombre: row.nombre_completo || pacienteNombre || row.telefono_whatsapp,
    temperatura,
    diasDesdeContacto,
    diasDesdeUltimaInteraccion: diasDesdeUltima,
    esCliente: !!row.paciente_id,
    esPacienteExistente,
    esCaliente: temperatura === 'Caliente',
    esInactivo: (diasDesdeUltima || 0) > 7,
    requiereSeguimiento: proximoSeguimiento !== null && proximoSeguimiento <= now,
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isLeadEstado(value: unknown): value is LeadEstado {
  return typeof value === 'string' && (LEAD_ESTADOS as readonly string[]).includes(value);
}

export function isTipoContacto(value: unknown): value is TipoContacto {
  return typeof value === 'string' && (TIPO_CONTACTO as readonly string[]).includes(value);
}

export function isMotivoContacto(value: unknown): value is MotivoContacto {
  return typeof value === 'string' && (MOTIVO_CONTACTO as readonly string[]).includes(value);
}

export function isLeadPrioridad(value: unknown): value is LeadPrioridad {
  return typeof value === 'string' && (LEAD_PRIORIDAD as readonly string[]).includes(value);
}

export function isLeadTemperatura(value: unknown): value is LeadTemperatura {
  return typeof value === 'string' && (LEAD_TEMPERATURAS as readonly string[]).includes(value);
}
