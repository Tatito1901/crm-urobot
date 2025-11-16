export const LEAD_ESTADOS = ['Nuevo', 'En seguimiento', 'Convertido', 'Descartado'] as const;

export type LeadEstado = (typeof LEAD_ESTADOS)[number];

export interface Lead {
  id: string;
  leadId?: string | null;
  nombre: string;
  telefono: string;
  estado: LeadEstado;
  primerContacto: string;
  fuente: string;
  ultimaInteraccion?: string | null;
  
  // Métricas de engagement
  totalInteracciones: number;
  diasDesdeContacto: number;
  diasDesdeUltimaInteraccion: number | null;
  
  // Datos de conversión
  esCliente: boolean;
  fechaConversion: string | null;
  diasDesdeConversion: number | null;
  
  // Relación con paciente (si ya fue convertido)
  paciente: {
    id: string;
    pacienteId: string;
    nombre: string;
    telefono: string;
    email: string | null;
    totalConsultas: number;
    ultimaConsulta: string | null;
  } | null;
  
  // Metadata
  sessionId: string | null;
  notas: string | null;
  
  // Indicadores visuales
  esCaliente: boolean; // Muchas interacciones, reciente
  esInactivo: boolean; // Sin interacción en 7+ días
}

export const DEFAULT_LEAD_ESTADO: LeadEstado = 'Nuevo';

export function isLeadEstado(value: unknown): value is LeadEstado {
  return typeof value === 'string' && (LEAD_ESTADOS as readonly string[]).includes(value);
}
