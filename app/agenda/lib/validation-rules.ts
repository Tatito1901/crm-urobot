/**
 * Reglas de validación para formulario de citas
 */

import type { ConsultaTipo, ConsultaSede } from '@/types/consultas';

export interface AppointmentFormData {
  patientId: string;
  patientName: string;
  tipo: string;
  motivoConsulta: string;
  duracionMinutos: number;
  sede: ConsultaSede;
  modalidad: 'presencial' | 'teleconsulta';
  prioridad: 'normal' | 'urgente' | 'alta';
  notasInternas?: string;
}

export type FormErrors = Partial<Record<keyof AppointmentFormData, string>>;

/**
 * Valida el formulario de cita
 */
export function validateAppointmentForm(data: AppointmentFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.patientId) {
    errors.patientId = 'Selecciona un paciente';
  }

  if (!data.tipo) {
    errors.tipo = 'Selecciona el tipo de cita';
  }

  if (!data.motivoConsulta?.trim()) {
    errors.motivoConsulta = 'Ingresa el motivo de consulta';
  }

  if (data.duracionMinutos < 15 || data.duracionMinutos > 120) {
    errors.duracionMinutos = 'La duración debe ser entre 15 y 120 minutos';
  }

  return errors;
}

/**
 * Obtiene la duración por defecto según el tipo de cita
 */
export function getDefaultDuration(tipo: string): number {
  const durations: Record<string, number> = {
    'Primera Vez': 45,
    'Seguimiento': 30,
    'Urgencia': 30,
    'Procedimiento': 60,
    'Valoración': 45,
    // Legacy values
    'primera_vez': 45,
    'subsecuente': 30,
    'urgencia': 30,
    'procedimiento_menor': 60,
    'valoracion_prequirurgica': 45,
  };

  return durations[tipo] || 30;
}
