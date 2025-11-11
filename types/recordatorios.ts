import type { ConsultaEstado, ConsultaSede } from './consultas';

export const RECORDATORIO_TIPOS = ['confirmacion_inicial', '48h', '24h', '3h'] as const;
export const RECORDATORIO_ESTADOS = ['pendiente', 'procesando', 'enviado', 'error'] as const;
export const RECORDATORIO_CANALES = ['whatsapp', 'sms', 'email'] as const;

export type RecordatorioTipo = (typeof RECORDATORIO_TIPOS)[number];
export type RecordatorioEstado = (typeof RECORDATORIO_ESTADOS)[number];
export type RecordatorioCanal = (typeof RECORDATORIO_CANALES)[number];

export interface Recordatorio {
  id: string;
  recordatorio_id: string | null;
  consulta_id: string | null;
  tipo: RecordatorioTipo;
  programado_para: string;
  enviado_en: string | null;
  estado: RecordatorioEstado;
  canal: RecordatorioCanal | null;
  mensaje_enviado?: string | null;
  plantilla_usada?: string | null;
  entregado?: boolean | null;
  leido?: boolean | null;
  respondido?: boolean | null;
  respuesta_texto?: string | null;
  intentos?: number | null;
  error_mensaje?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RecordatorioDetalle extends Recordatorio {
  consulta: {
    id: string;
    consulta_id: string | null;
    sede: ConsultaSede | null;
    estado_cita: ConsultaEstado | null;
  } | null;
  paciente: {
    id: string;
    nombre_completo: string;
  } | null;
}

export const DEFAULT_RECORDATORIO_ESTADO: RecordatorioEstado = 'pendiente';
export const DEFAULT_RECORDATORIO_TIPO: RecordatorioTipo = 'confirmacion_inicial';
export const DEFAULT_RECORDATORIO_CANAL: RecordatorioCanal = 'whatsapp';

export function isRecordatorioEstado(value: unknown): value is RecordatorioEstado {
  return typeof value === 'string' && (RECORDATORIO_ESTADOS as readonly string[]).includes(value);
}

export function isRecordatorioTipo(value: unknown): value is RecordatorioTipo {
  return typeof value === 'string' && (RECORDATORIO_TIPOS as readonly string[]).includes(value);
}

export function isRecordatorioCanal(value: unknown): value is RecordatorioCanal {
  return typeof value === 'string' && (RECORDATORIO_CANALES as readonly string[]).includes(value);
}
