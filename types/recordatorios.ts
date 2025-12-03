/**
 * ============================================================
 * TIPOS NOTIFICACIONES/RECORDATORIOS - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'notification_queue'
 * Última sync: 2025-12-01
 * 
 * NOTA: La BD usa 'notification_queue' en lugar de 'recordatorios'.
 * Los recordatorios son generados por funciones RPC:
 * - procesar_recordatorios_batch(ventana_inicio, ventana_fin, tipo)
 * - get_recordatorios_pendientes(p_inicio, p_fin, p_tipo)
 */

// ============================================================
// TIPO BD (definido manualmente - no está en tipos generados)
// ============================================================
export type NotificationStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

export interface NotificationQueueRow {
  id: string;
  consulta_id: string | null;
  phone_number: string;
  message_body: string;
  status: NotificationStatus | null;
  attempt_count: number | null;
  next_attempt_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  error_log: string | null;
  priority: number | null;
  reminder_type: string | null;
  sent_at: string | null;
}

// ============================================================
// CONSTANTES Y ENUMS
// ============================================================

// Estados de notification_queue (enum en BD)
export const NOTIFICATION_ESTADOS = ['pending', 'processing', 'sent', 'failed', 'cancelled'] as const;

// Tipos de recordatorio (usado en reminder_type)
export const RECORDATORIO_TIPOS = ['24h', '2h', '48h', 'confirmacion'] as const;

// Canales (siempre WhatsApp para este CRM)
export const RECORDATORIO_CANALES = ['whatsapp'] as const;

export type RecordatorioTipo = (typeof RECORDATORIO_TIPOS)[number];
export type RecordatorioCanal = (typeof RECORDATORIO_CANALES)[number];

// Alias para compatibilidad con código existente
export type RecordatorioEstado = NotificationStatus;

// ============================================================
// INTERFACE FRONTEND (camelCase)
// ============================================================

export interface Notificacion {
  id: string;
  consultaId: string | null;        // BD: consulta_id
  phoneNumber: string;               // BD: phone_number
  messageBody: string;               // BD: message_body
  status: NotificationStatus;        // BD: status
  attemptCount: number;              // BD: attempt_count
  nextAttemptAt: string | null;      // BD: next_attempt_at
  metadata: Record<string, unknown> | null; // BD: metadata (JSONB)
  errorLog: string | null;           // BD: error_log
  priority: number | null;           // BD: priority ✅ NUEVO
  reminderType: string | null;       // BD: reminder_type ✅ NUEVO
  sentAt: string | null;             // BD: sent_at ✅ NUEVO
  createdAt: string | null;          // BD: created_at
  updatedAt: string | null;          // BD: updated_at
}

// Alias para compatibilidad
export type Recordatorio = Notificacion;

export interface RecordatorioDetalle extends Notificacion {
  // Datos enriquecidos via JOIN
  pacienteNombre?: string;
  sede?: string;
  fechaConsulta?: string;
}

// ============================================================
// DEFAULTS
// ============================================================
export const DEFAULT_RECORDATORIO_ESTADO: NotificationStatus = 'pending';
export const DEFAULT_RECORDATORIO_TIPO: RecordatorioTipo = '24h';
export const DEFAULT_RECORDATORIO_CANAL: RecordatorioCanal = 'whatsapp';

// ============================================================
// MAPPER BD → FRONTEND
// ============================================================

export function mapNotificacionFromDB(row: NotificationQueueRow): Notificacion {
  return {
    id: row.id,
    consultaId: row.consulta_id,
    phoneNumber: row.phone_number,
    messageBody: row.message_body,
    status: row.status ?? 'pending',
    attemptCount: row.attempt_count ?? 0,
    nextAttemptAt: row.next_attempt_at,
    metadata: row.metadata as Record<string, unknown> | null,
    errorLog: row.error_log,
    priority: row.priority,
    reminderType: row.reminder_type,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isRecordatorioEstado(value: unknown): value is NotificationStatus {
  return typeof value === 'string' && (NOTIFICATION_ESTADOS as readonly string[]).includes(value);
}

export function isRecordatorioTipo(value: unknown): value is RecordatorioTipo {
  return typeof value === 'string' && (RECORDATORIO_TIPOS as readonly string[]).includes(value);
}

export function isRecordatorioCanal(value: unknown): value is RecordatorioCanal {
  return typeof value === 'string' && (RECORDATORIO_CANALES as readonly string[]).includes(value);
}
