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
}

export const DEFAULT_LEAD_ESTADO: LeadEstado = 'Nuevo';

export function isLeadEstado(value: unknown): value is LeadEstado {
  return typeof value === 'string' && (LEAD_ESTADOS as readonly string[]).includes(value);
}
