/**
 * ============================================================
 * APPOINTMENTS SERVICE - Capa de servicios para citas
 * ============================================================
 * Maneja todas las operaciones CRUD para citas (consultas)
 * Integrado con Supabase y compatible con useConsultas
 */

import { createClient } from '@/lib/supabase/client';
import { Temporal } from '@js-temporal/polyfill';
import type { Appointment } from '@/types/agenda';
import type { Tables } from '@/types/database';
import { nanoid } from 'nanoid';

const supabase = createClient();

// ============================================================
// TIPOS DE RESPUESTA
// ============================================================

export interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateAppointmentData {
  // Paciente
  patientId: string;
  patientName: string;

  // Fecha y hora
  slotId: string; // Para referencia al slot seleccionado
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  timezone: string;
  duracionMinutos: number;

  // Ubicación
  sede: 'POLANCO' | 'SATELITE';

  // Tipo y clasificación
  tipo: string;
  prioridad?: 'normal' | 'alta' | 'urgente';
  modalidad?: 'presencial' | 'teleconsulta' | 'hibrida';

  // Motivo y notas
  motivoConsulta?: string;
  notasInternas?: string;

  // Origen
  canalOrigen?: string;
}

export interface UpdateAppointmentData {
  // Campos opcionales que se pueden actualizar
  start?: Temporal.ZonedDateTime;
  end?: Temporal.ZonedDateTime;
  duracionMinutos?: number;
  tipo?: string;
  motivoConsulta?: string;
  notasInternas?: string;
  prioridad?: 'normal' | 'alta' | 'urgente';
  modalidad?: 'presencial' | 'teleconsulta' | 'hibrida';
  sede?: 'POLANCO' | 'SATELITE';
}

export interface CancelAppointmentData {
  reason: string;
  cancelledBy: 'paciente' | 'doctor' | 'asistente' | 'sistema';
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Genera un consulta_id único
 */
function generateConsultaId(): string {
  const timestamp = Date.now().toString(36);
  const random = nanoid(6);
  return `CONS-${timestamp}-${random}`.toUpperCase();
}

/**
 * Convierte Appointment a formato de base de datos
 */
function appointmentToDbInsert(data: CreateAppointmentData): Tables<'consultas'>['Insert'] {
  const fechaConsulta = data.start.toPlainDate().toString();
  const horaConsulta = data.start.toPlainTime().toString();
  const fechaHoraUtc = data.start.toInstant().toString();

  return {
    consulta_id: generateConsultaId(),
    paciente_id: data.patientId,
    fecha_hora_utc: fechaHoraUtc,
    fecha_consulta: fechaConsulta,
    hora_consulta: horaConsulta,
    timezone: data.timezone,
    sede: data.sede,
    tipo_cita: data.tipo,
    motivo_consulta: data.motivoConsulta || null,
    duracion_minutos: data.duracionMinutos,
    estado_cita: 'Programada',
    estado_confirmacion: 'Pendiente',
    confirmado_paciente: false,
    canal_origen: data.canalOrigen || 'Sistema',
    // Generar idempotency key para evitar duplicados
    idempotency_key: `${data.patientId}-${fechaHoraUtc}`,
  };
}

/**
 * Convierte campos de actualización a formato de base de datos
 */
function updateToDbUpdate(data: UpdateAppointmentData): Tables<'consultas'>['Update'] {
  const update: Tables<'consultas'>['Update'] = {};

  if (data.start && data.end) {
    const fechaConsulta = data.start.toPlainDate().toString();
    const horaConsulta = data.start.toPlainTime().toString();
    const fechaHoraUtc = data.start.toInstant().toString();

    update.fecha_hora_utc = fechaHoraUtc;
    update.fecha_consulta = fechaConsulta;
    update.hora_consulta = horaConsulta;
  }

  if (data.duracionMinutos) update.duracion_minutos = data.duracionMinutos;
  if (data.tipo) update.tipo_cita = data.tipo;
  if (data.motivoConsulta !== undefined) update.motivo_consulta = data.motivoConsulta || null;
  if (data.sede) update.sede = data.sede;

  // Actualizar timestamp
  update.updated_at = new Date().toISOString();

  return update;
}

// ============================================================
// OPERACIONES PRINCIPALES
// ============================================================

/**
 * Crea una nueva cita en la base de datos
 *
 * @param data - Datos de la cita a crear
 * @returns Respuesta con el ID de la cita creada
 *
 * @example
 * ```typescript
 * const result = await createAppointment({
 *   patientId: 'pac-123',
 *   patientName: 'Juan Pérez',
 *   start: zonedDateTime,
 *   end: zonedDateTime.add({ minutes: 45 }),
 *   timezone: 'America/Mexico_City',
 *   duracionMinutos: 45,
 *   sede: 'POLANCO',
 *   tipo: 'primera_vez',
 *   motivoConsulta: 'Dolor en...'
 * });
 *
 * if (result.success) {
 *   console.log('Cita creada:', result.data.id);
 * }
 * ```
 */
export async function createAppointment(
  data: CreateAppointmentData
): Promise<ServiceResponse<{ id: string; uuid: string }>> {
  try {
    // Validar que el paciente existe
    const { data: patient, error: patientError } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', data.patientId)
      .single();

    if (patientError || !patient) {
      return {
        success: false,
        error: 'Paciente no encontrado',
      };
    }

    // Validar que el slot no esté ocupado (verificar conflictos)
    const { data: conflicts, error: conflictError } = await supabase
      .from('consultas')
      .select('id')
      .eq('sede', data.sede)
      .gte('fecha_hora_utc', data.start.toInstant().toString())
      .lt('fecha_hora_utc', data.end.toInstant().toString())
      .in('estado_cita', ['Programada', 'Confirmada', 'En_Curso']);

    if (conflictError) {
      return {
        success: false,
        error: 'Error al validar disponibilidad',
      };
    }

    if (conflicts && conflicts.length > 0) {
      return {
        success: false,
        error: 'El horario seleccionado ya está ocupado',
      };
    }

    // Insertar la nueva cita
    const insertData = appointmentToDbInsert(data);

    const { data: newConsulta, error: insertError } = await supabase
      .from('consultas')
      .insert(insertData)
      .select('id, consulta_id')
      .single();

    if (insertError) {
      console.error('Error al crear cita:', insertError);
      return {
        success: false,
        error: insertError.message || 'Error al crear la cita',
      };
    }

    return {
      success: true,
      data: {
        id: newConsulta.consulta_id,
        uuid: newConsulta.id,
      },
    };
  } catch (error) {
    console.error('Error inesperado al crear cita:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al crear la cita',
    };
  }
}

/**
 * Actualiza una cita existente
 *
 * @param appointmentId - ID de la cita (consulta_id)
 * @param updates - Campos a actualizar
 * @returns Respuesta indicando éxito o error
 *
 * @example
 * ```typescript
 * const result = await updateAppointment('CONS-123', {
 *   motivoConsulta: 'Motivo actualizado',
 *   duracionMinutos: 60
 * });
 * ```
 */
export async function updateAppointment(
  appointmentId: string,
  updates: UpdateAppointmentData
): Promise<ServiceResponse> {
  try {
    // Verificar que la cita existe y no está cancelada
    const { data: existing, error: fetchError } = await supabase
      .from('consultas')
      .select('id, estado_cita')
      .eq('consulta_id', appointmentId)
      .single();

    if (fetchError || !existing) {
      return {
        success: false,
        error: 'Cita no encontrada',
      };
    }

    if (existing.estado_cita === 'Cancelada') {
      return {
        success: false,
        error: 'No se puede modificar una cita cancelada',
      };
    }

    // Si se está actualizando la fecha/hora, validar conflictos
    if (updates.start && updates.end) {
      const { data: conflicts, error: conflictError } = await supabase
        .from('consultas')
        .select('id')
        .neq('id', existing.id) // Excluir la cita actual
        .gte('fecha_hora_utc', updates.start.toInstant().toString())
        .lt('fecha_hora_utc', updates.end.toInstant().toString())
        .in('estado_cita', ['Programada', 'Confirmada', 'En_Curso']);

      if (conflictError) {
        return {
          success: false,
          error: 'Error al validar disponibilidad',
        };
      }

      if (conflicts && conflicts.length > 0) {
        return {
          success: false,
          error: 'El nuevo horario ya está ocupado',
        };
      }
    }

    // Actualizar la cita
    const updateData = updateToDbUpdate(updates);

    const { error: updateError } = await supabase
      .from('consultas')
      .update(updateData)
      .eq('consulta_id', appointmentId);

    if (updateError) {
      console.error('Error al actualizar cita:', updateError);
      return {
        success: false,
        error: updateError.message || 'Error al actualizar la cita',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error inesperado al actualizar cita:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al actualizar la cita',
    };
  }
}

/**
 * Cancela una cita existente
 *
 * @param appointmentId - ID de la cita (consulta_id)
 * @param cancelData - Motivo y quién cancela
 * @returns Respuesta indicando éxito o error
 *
 * @example
 * ```typescript
 * const result = await cancelAppointment('CONS-123', {
 *   reason: 'Solicitado por paciente',
 *   cancelledBy: 'asistente'
 * });
 * ```
 */
export async function cancelAppointment(
  appointmentId: string,
  cancelData: CancelAppointmentData
): Promise<ServiceResponse> {
  try {
    // Verificar que la cita existe
    const { data: existing, error: fetchError } = await supabase
      .from('consultas')
      .select('id, estado_cita')
      .eq('consulta_id', appointmentId)
      .single();

    if (fetchError || !existing) {
      return {
        success: false,
        error: 'Cita no encontrada',
      };
    }

    if (existing.estado_cita === 'Cancelada') {
      return {
        success: false,
        error: 'La cita ya está cancelada',
      };
    }

    if (existing.estado_cita === 'Completada') {
      return {
        success: false,
        error: 'No se puede cancelar una cita completada',
      };
    }

    // Cancelar la cita
    const { error: updateError } = await supabase
      .from('consultas')
      .update({
        estado_cita: 'Cancelada',
        motivo_cancelacion: cancelData.reason,
        cancelado_por: cancelData.cancelledBy,
        fecha_cancelacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('consulta_id', appointmentId);

    if (updateError) {
      console.error('Error al cancelar cita:', updateError);
      return {
        success: false,
        error: updateError.message || 'Error al cancelar la cita',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error inesperado al cancelar cita:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al cancelar la cita',
    };
  }
}

/**
 * Confirma una cita (marca confirmado_paciente = true)
 *
 * @param appointmentId - ID de la cita (consulta_id)
 * @returns Respuesta indicando éxito o error
 */
export async function confirmAppointment(appointmentId: string): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('consultas')
      .update({
        confirmado_paciente: true,
        fecha_confirmacion: new Date().toISOString(),
        estado_confirmacion: 'Confirmada',
        updated_at: new Date().toISOString(),
      })
      .eq('consulta_id', appointmentId);

    if (error) {
      return {
        success: false,
        error: error.message || 'Error al confirmar la cita',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error inesperado al confirmar cita:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al confirmar la cita',
    };
  }
}

/**
 * Reagenda una cita (cancela la actual y crea una nueva)
 *
 * @param appointmentId - ID de la cita a reagendar
 * @param newData - Datos para la nueva cita
 * @returns Respuesta con el ID de la nueva cita
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newData: CreateAppointmentData
): Promise<ServiceResponse<{ id: string; uuid: string }>> {
  try {
    // Cancelar la cita actual
    const cancelResult = await cancelAppointment(appointmentId, {
      reason: 'Reagendada a nueva fecha',
      cancelledBy: 'sistema',
    });

    if (!cancelResult.success) {
      return cancelResult;
    }

    // Crear la nueva cita
    const createResult = await createAppointment(newData);

    if (!createResult.success) {
      return createResult;
    }

    // Marcar la cita original como reagendada
    await supabase
      .from('consultas')
      .update({
        estado_cita: 'Reagendada',
      })
      .eq('consulta_id', appointmentId);

    return createResult;
  } catch (error) {
    console.error('Error inesperado al reagendar cita:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al reagendar la cita',
    };
  }
}
