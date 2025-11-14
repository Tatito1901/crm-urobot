/**
 * ============================================================
 * REGLAS DE VALIDACIÓN - Validaciones para formularios
 * ============================================================
 * Funciones de validación para crear/editar citas
 */

import type { TimeSlot } from '@/types/agenda';

export interface AppointmentFormData {
  patientId: string;
  patientName: string;
  tipo: string;
  motivoConsulta: string;
  duracionMinutos: number;
  sede: 'POLANCO' | 'SATELITE';
  modalidad: 'presencial' | 'teleconsulta' | 'hibrida';
  prioridad: 'normal' | 'alta' | 'urgente';
  notasInternas: string;
}

export interface FormErrors {
  [key: string]: string;
}

/**
 * Valida el formulario de cita
 */
export function validateAppointmentForm(
  data: AppointmentFormData,
  slot?: TimeSlot
): FormErrors {
  const errors: FormErrors = {};

  // Validar paciente
  if (!data.patientId || !data.patientName) {
    errors.patient = 'Debe seleccionar un paciente';
  }

  // Validar tipo de consulta
  if (!data.tipo || data.tipo.trim() === '') {
    errors.tipo = 'Debe seleccionar un tipo de consulta';
  }

  // Validar motivo (opcional pero recomendado)
  if (data.motivoConsulta && data.motivoConsulta.length > 500) {
    errors.motivoConsulta = 'El motivo no puede exceder 500 caracteres';
  }

  // Validar duración
  const validDurations = [15, 30, 45, 60, 90, 120];
  if (!validDurations.includes(data.duracionMinutos)) {
    errors.duracionMinutos = 'Duración inválida';
  }

  // Validar sede
  if (!['POLANCO', 'SATELITE'].includes(data.sede)) {
    errors.sede = 'Sede inválida';
  }

  // Validar slot si se proporciona
  if (slot && !slot.available) {
    errors.slot = 'El horario seleccionado ya no está disponible';
  }

  return errors;
}

/**
 * Obtiene duraciones válidas según tipo de consulta
 */
export function getValidDurations(tipo: string): number[] {
  const defaultDurations = [15, 30, 45, 60];

  const durationsByType: Record<string, number[]> = {
    primera_vez: [30, 45, 60],
    subsecuente: [15, 30, 45],
    urgencia: [15, 30, 45],
    procedimiento_menor: [45, 60, 90, 120],
    control_post_op: [15, 30, 45],
    teleconsulta: [15, 30, 45],
    valoracion_prequirurgica: [30, 45, 60],
  };

  return durationsByType[tipo] || defaultDurations;
}

/**
 * Obtiene duración por defecto según tipo de consulta
 */
export function getDefaultDuration(tipo: string): number {
  const defaultByType: Record<string, number> = {
    primera_vez: 45,
    subsecuente: 30,
    urgencia: 30,
    procedimiento_menor: 60,
    control_post_op: 30,
    teleconsulta: 30,
    valoracion_prequirurgica: 45,
  };

  return defaultByType[tipo] || 45;
}
