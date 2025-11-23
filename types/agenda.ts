/**
 * ============================================================
 * TIPOS Y MODELOS MEJORADOS PARA AGENDA UROLÓGICA
 * ============================================================
 * Modelo de datos extendido con campos específicos de urología
 * Compatible con el modelo actual de Consulta
 */

import { Temporal } from '@js-temporal/polyfill';
import { 
  type ConsultaEstado, 
  type ConsultaSede, 
  type ConsultaTipo,
  CONSULTA_TIPOS 
} from './consultas';

// ========== ENUMS Y CONSTANTES ==========

// Re-exportamos para compatibilidad, pero usando la fuente de verdad en consultas.ts
export { CONSULTA_TIPOS as CONSULT_TYPES };

export const APPOINTMENT_PRIORITIES = ['normal', 'alta', 'urgente'] as const;

export const APPOINTMENT_MODALITIES = ['presencial', 'teleconsulta', 'hibrida'] as const;

export const BLOCK_TYPES = [
  'comida',
  'quirofano',
  'procedimientos',
  'administrativo',
  'urgencias_reservadas',
  'personal',
] as const;

export type ConsultType = ConsultaTipo; // Alias para compatibilidad
export type AppointmentPriority = (typeof APPOINTMENT_PRIORITIES)[number];
export type AppointmentModality = (typeof APPOINTMENT_MODALITIES)[number];
export type BlockType = (typeof BLOCK_TYPES)[number];

// ========== INTERFACES ==========

/**
 * Modelo extendido de Cita
 * Compatible con el tipo Consulta existente, pero con campos adicionales
 */
export interface Appointment {
  // IDs
  id: string; // consulta_id
  uuid: string;

  // Paciente
  pacienteId: string;
  paciente: string;
  telefono: string | null;
  email: string | null;

  // Fecha y hora (usando Temporal para timezone-safety)
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  timezone: string;
  duracionMinutos: number;

  // Ubicación
  sede: ConsultaSede;
  consultorio: string | null;

  // Tipo y clasificación
  tipo: ConsultaTipo; // Usamos el tipo estricto de Consulta
  prioridad: AppointmentPriority;
  modalidad: AppointmentModality;

  // Motivo y contexto
  motivoConsulta: string | null;
  notasInternas: string | null;
  requisitosEspeciales: string[] | null;

  // Estado
  estado: ConsultaEstado; // Usamos el tipo estricto de Consulta
  estadoConfirmacion: string;
  confirmadoPaciente: boolean;
  confirmadoEn: string | null; // ISO string

  // Cancelación
  canceladoPor: string | null;
  motivoCancelacion: string | null;
  canceladoEn: string | null;

  // Integración Google Calendar
  calendarEventId: string | null;
  calendarLink: string | null;

  // Metadata
  canalOrigen: string | null;
  creadoPor: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Slot de tiempo (unidad básica del calendario)
 */
export interface TimeSlot {
  id: string; // "slot_2025-11-13_1030_polanco"
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  timezone: string; // Default: "America/Mexico_City"
  sede: ConsultaSede;
  duracionMinutos: number;

  // Estado
  available: boolean;
  occupied: boolean;
  blocked: boolean;

  // Restricciones
  restrictions: string[];
  reason: string | null;

  // Referencias
  appointmentId: string | null;
  blockId: string | null;
}

/**
 * Bloque de tiempo reservado
 */
export interface CalendarBlock {
  id: string;
  tipo: BlockType;
  titulo: string;
  descripcion: string | null;

  // Fecha y hora
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  timezone: string;

  // Ubicación
  sede: ConsultaSede | 'AMBAS';

  // Recurrencia
  recurrente: boolean;
  recurrenciaRegla: string | null;

  // Metadata
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Regla de duración por tipo de consulta
 */
export interface ConsultDurationRule {
  tipo: ConsultaTipo;
  duracionDefecto: number;
  duracionMinima: number;
  duracionMaxima: number;
  bufferPre: number;
  bufferPost: number;
}

// ========== CONFIGURACIÓN DE DURACIONES ==========

export const CONSULT_DURATION_RULES: Record<ConsultaTipo, Omit<ConsultDurationRule, 'tipo'>> = {
  primera_vez: {
    duracionDefecto: 45,
    duracionMinima: 30,
    duracionMaxima: 60,
    bufferPre: 0,
    bufferPost: 5,
  },
  subsecuente: {
    duracionDefecto: 30,
    duracionMinima: 15,
    duracionMaxima: 45,
    bufferPre: 0,
    bufferPost: 0,
  },
  control_post_op: {
    duracionDefecto: 30,
    duracionMinima: 15,
    duracionMaxima: 45,
    bufferPre: 0,
    bufferPost: 5,
  },
  urgencia: {
    duracionDefecto: 30,
    duracionMinima: 15,
    duracionMaxima: 60,
    bufferPre: 0,
    bufferPost: 0,
  },
  procedimiento_menor: {
    duracionDefecto: 60,
    duracionMinima: 45,
    duracionMaxima: 120,
    bufferPre: 15,
    bufferPost: 15,
  },
  valoracion_prequirurgica: {
    duracionDefecto: 45,
    duracionMinima: 30,
    duracionMaxima: 60,
    bufferPre: 0,
    bufferPost: 5,
  },
  teleconsulta: {
    duracionDefecto: 30,
    duracionMinima: 15,
    duracionMaxima: 45,
    bufferPre: 0,
    bufferPost: 0,
  },
};

/**
 * Límites de citas por día
 */
export const DAILY_LIMITS = {
  POLANCO: {
    maxCitas: 12,
    maxUrgencias: 3,
    maxProcedimientos: 2,
  },
  SATELITE: {
    maxCitas: 10,
    maxUrgencias: 2,
    maxProcedimientos: 1,
  },
} as const;

// ========== TIPOS PARA FORMULARIOS ==========

export interface CreateAppointmentDTO {
  patientId: string;
  slotId: string;
  tipo: ConsultaTipo;
  motivoConsulta: string;
  duracionMinutos: number;
  sede: ConsultaSede;
  modalidad: AppointmentModality;
  prioridad: AppointmentPriority;
  notasInternas?: string;
  requisitosEspeciales?: string[];
}

export interface UpdateAppointmentDTO {
  motivoConsulta?: string;
  notasInternas?: string;
  duracionMinutos?: number;
  prioridad?: AppointmentPriority;
  modalidad?: AppointmentModality;
}

export interface RescheduleAppointmentDTO {
  newSlotId: string;
  reason?: string;
}

export interface CancelAppointmentDTO {
  reason: string;
  cancelledBy: string;
}

// ========== TIPOS PARA DISPONIBILIDAD ==========

export interface AvailabilityParams {
  startDate: string; // ISO date string
  endDate: string;
  sede: ConsultaSede | 'ANY';
  consultType?: string;
  duration?: number;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
  metadata: {
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    blockedSlots: number;
    occupancyRate: number;
  };
}
