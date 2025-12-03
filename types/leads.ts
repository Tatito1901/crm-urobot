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

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Lead {
  // === Campos directos de BD ===
  id: string;
  pacienteId: string | null;           // BD: paciente_id
  telefono: string;                     // BD: telefono_whatsapp
  nombreCompleto: string | null;        // BD: nombre_completo ✅ NUEVO
  estado: LeadEstado;                   // BD: estado
  fuente: CanalMarketing;                 // BD: fuente_lead (normalizado, usado para badges)
  canalMarketing: string | null;          // BD: canal_marketing (dato adicional)
  notas: string | null;                 // BD: notas_iniciales
  sessionId: string | null;             // BD: session_id
  primerContacto: string | null;        // BD: fecha_primer_contacto
  ultimaInteraccion: string | null;     // BD: ultima_interaccion
  fechaConversion: string | null;       // BD: fecha_conversion
  totalInteracciones: number;           // BD: total_interacciones
  createdAt: string | null;
  updatedAt: string | null;
  
  // === Campos calculados/UI ===
  nombre: string;                       // Display name (telefono o paciente.nombre)
  temperatura: LeadTemperatura;         // Calculado de interacciones
  diasDesdeContacto: number;
  diasDesdeUltimaInteraccion: number | null;
  esCliente: boolean;
  esCaliente: boolean;
  esInactivo: boolean;
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
  
  const diasDesdeContacto = Math.floor((now - primerContacto) / (1000 * 60 * 60 * 24));
  const diasDesdeUltima = ultimaInteraccion ? Math.floor((now - ultimaInteraccion) / (1000 * 60 * 60 * 24)) : null;
  
  // Calcular temperatura basado en interacciones
  const interacciones = row.total_interacciones || 0;
  const temperatura: LeadTemperatura = interacciones > 10 ? 'Caliente' : interacciones > 3 ? 'Tibio' : 'Frio';

  return {
    // Campos directos
    id: row.id,
    pacienteId: row.paciente_id,
    telefono: row.telefono_whatsapp,
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
    
    nombreCompleto: row.nombre_completo,
    
    // Calculados
    nombre: row.nombre_completo || pacienteNombre || row.telefono_whatsapp,
    temperatura,
    diasDesdeContacto,
    diasDesdeUltimaInteraccion: diasDesdeUltima,
    esCliente: !!row.fecha_conversion,
    esCaliente: temperatura === 'Caliente',
    esInactivo: (diasDesdeUltima || 0) > 7,
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
