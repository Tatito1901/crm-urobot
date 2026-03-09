/**
 * ============================================================
 * APPOINTMENTS SERVICE - Capa de servicios para citas
 * ============================================================
 * Maneja todas las operaciones CRUD para citas (consultas)
 * Integrado con Supabase y compatible con useConsultas
 * Alinear estrictamente con el esquema de Supabase
 */

import { createClient } from '@/lib/supabase/client';
import { Temporal } from '@js-temporal/polyfill';
import { nanoid } from 'nanoid';
import type { ConsultaRow } from '@/types/consultas';

const supabase = createClient();

// ============================================================
// TIPOS DE RESPUESTA
// ============================================================

interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

type SedeActiva = 'POLANCO' | 'SATELITE';

export interface CreateAppointmentData {
  patientId: string;
  patientName: string;
  slotId: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  timezone: string;
  duracionMinutos: number;
  sede: SedeActiva;
  tipo: string;
  prioridad?: 'normal' | 'alta' | 'urgente';
  modalidad?: 'presencial' | 'teleconsulta' | 'hibrida';
  motivoConsulta?: string;
  notasInternas?: string;
  canalOrigen?: string;
}

export interface UpdateAppointmentData {
  start?: Temporal.ZonedDateTime;
  end?: Temporal.ZonedDateTime;
  duracionMinutos?: number;
  tipo?: string;
  motivoConsulta?: string;
  notasInternas?: string;
  prioridad?: 'normal' | 'alta' | 'urgente';
  modalidad?: 'presencial' | 'teleconsulta' | 'hibrida';
  sede?: SedeActiva;
}

interface CancelAppointmentData {
  reason: string;
  cancelledBy: 'paciente' | 'doctor' | 'asistente' | 'sistema';
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function generateConsultaId(): string {
  const timestamp = Date.now().toString(36);
  const random = nanoid(6);
  return `CONS-${timestamp}-${random}`.toUpperCase();
}

// Helper para obtener el UUID de sede a partir del nombre
async function getSedeId(sedeName: SedeActiva): Promise<string | null> {
  if (!sedeName) return null;
  const { data, error } = await supabase.from('sedes').select('id').eq('sede', sedeName).single();
  if (error || !data) return null;
  return data.id;
}

// Helper para concatenar info extra en motivo_consulta
function buildMotivoConsulta(data: {
  motivo?: string;
  tipo?: string;
  prioridad?: string;
  modalidad?: string;
  notas?: string;
}): string {
  let motivo = data.motivo || 'Sin motivo especificado';
  const extras = [];
  
  if (data.tipo) extras.push(`Tipo: ${data.tipo}`);
  if (data.prioridad) extras.push(`Prioridad: ${data.prioridad}`);
  if (data.modalidad) extras.push(`Modalidad: ${data.modalidad}`);
  if (data.notas) extras.push(`Notas: ${data.notas}`);
  
  if (extras.length > 0) {
    motivo += `\n\n[Detalles: ${extras.join(' | ')}]`;
  }
  return motivo;
}

// ============================================================
// OPERACIONES PRINCIPALES
// ============================================================

/**
 * Crea una nueva cita en la base de datos
 */
export async function createAppointment(
  data: CreateAppointmentData
): Promise<ServiceResponse<{ id: string; uuid: string }>> {
  try {
    // Validar slot ocupado
    const startIso = data.start.toInstant().toString();
    const endIso = data.end.toInstant().toString();

    const sedeId = await getSedeId(data.sede);
    if (!sedeId) return { success: false, error: `Sede '${data.sede}' no encontrada` };

    const { data: conflicts, error: conflictError } = await supabase
      .from('consultas')
      .select('id')
      .eq('sede_id', sedeId)
      .lt('fecha_hora_inicio', endIso)
      .gt('fecha_hora_fin', startIso)
      .in('estado_cita', ['Programada', 'Pendiente', 'En_Curso']);

    if (conflictError) {
      return { success: false, error: `Error al verificar disponibilidad: ${conflictError.message}` };
    }

    if (conflicts && conflicts.length > 0) {
      return { success: false, error: 'El horario seleccionado ya está ocupado' };
    }

    // Preparar payload alineado con BD
    const motivoCompleto = buildMotivoConsulta({
      motivo: data.motivoConsulta,
      tipo: data.tipo,
      prioridad: data.prioridad,
      modalidad: data.modalidad,
      notas: data.notasInternas
    });

    const insertPayload = {
      consulta_id: generateConsultaId(),
      paciente_id: data.patientId,
      sede_id: sedeId,
      fecha_hora_inicio: startIso,
      fecha_hora_fin: endIso,
      estado_cita: 'Programada',
      motivo_consulta: motivoCompleto,
      // Campos opcionales omitidos si no existen en BD
    };

    // Insertar
    const { data: newConsulta, error: insertError } = await supabase
      .from('consultas')
      .insert(insertPayload)
      .select('id, consulta_id, paciente_id, sede_id, fecha_hora_inicio, fecha_hora_fin, estado_cita, motivo_consulta, calendar_event_id, created_at, updated_at')
      .single();

    if (insertError) {
      return { success: false, error: insertError.message || 'Error al crear la cita' };
    }

    const row = newConsulta as unknown as ConsultaRow; // Validar contra nuestro tipo manual

    return {
      success: true,
      data: {
        id: row.consulta_id || row.id,
        uuid: row.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al crear la cita',
    };
  }
}

/**
 * Actualiza una cita existente
 */
export async function updateAppointment(
  appointmentId: string,
  updates: UpdateAppointmentData
): Promise<ServiceResponse> {
  try {
    // Verificar existencia
    const { data: existing, error: fetchError } = await supabase
      .from('consultas')
      .select('id, estado_cita, motivo_consulta')
      .eq('consulta_id', appointmentId)
      .single();

    if (fetchError || !existing) return { success: false, error: 'Cita no encontrada' };
    if (existing.estado_cita === 'Cancelada') return { success: false, error: 'No se puede modificar una cita cancelada' };

    // Preparar update payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.start && updates.end) {
      updatePayload.fecha_hora_inicio = updates.start.toInstant().toString();
      updatePayload.fecha_hora_fin = updates.end.toInstant().toString();
    }

    if (updates.sede) {
      const sedeId = await getSedeId(updates.sede);
      if (!sedeId) return { success: false, error: `Sede '${updates.sede}' no encontrada` };
      updatePayload.sede_id = sedeId;
    }

    // Solo reconstruir motivo si se provee explícitamente
    if (updates.motivoConsulta !== undefined) {
      updatePayload.motivo_consulta = buildMotivoConsulta({
        motivo: updates.motivoConsulta,
        tipo: updates.tipo,
        prioridad: updates.prioridad,
        modalidad: updates.modalidad,
        notas: updates.notasInternas
      });
    }

    const { error: updateError } = await supabase
      .from('consultas')
      .update(updatePayload)
      .eq('consulta_id', appointmentId);

    if (updateError) {
      return { success: false, error: updateError.message || 'Error al actualizar la cita' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Cancela una cita existente
 */
export async function cancelAppointment(
  appointmentId: string,
  cancelData: CancelAppointmentData
): Promise<ServiceResponse> {
  try {
    const { error: updateError } = await supabase
      .from('consultas')
      .update({
        estado_cita: 'Cancelada',
        cancelado_por: `${cancelData.cancelledBy}: ${cancelData.reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('consulta_id', appointmentId);

    if (updateError) {
      return { success: false, error: updateError.message || 'Error al cancelar la cita' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Confirma una cita (Solo cambia estado_cita)
 */
export async function confirmAppointment(appointmentId: string): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from('consultas')
      .update({
        estado_confirmacion: 'Confirmada',
        updated_at: new Date().toISOString(),
      })
      .eq('consulta_id', appointmentId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Marca que el paciente llegó
 */
export async function markPatientArrived(appointmentId: string): Promise<ServiceResponse> {
  try {
    const { data: existing, error } = await supabase
      .from('consultas')
      .select('id, estado_cita')
      .eq('consulta_id', appointmentId)
      .single();

    if (error || !existing) return { success: false, error: 'Cita no encontrada' };

    if (existing.estado_cita !== 'Confirmada' && existing.estado_cita !== 'Programada') {
        return { success: false, error: 'Estado inválido para marcar llegada' };
    }

    const { error: updateError } = await supabase
      .from('consultas')
      .update({
        estado_cita: 'Completada', // Usamos Completada como "Llegó/En consulta" por ahora
        updated_at: new Date().toISOString(),
      })
      .eq('consulta_id', appointmentId);

    if (updateError) return { success: false, error: updateError.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Reagenda una cita
 * Patrón saga: cancela la original y crea la nueva.
 * Si la creación falla, intenta restaurar la original (compensating transaction).
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newData: CreateAppointmentData
): Promise<ServiceResponse<{ id: string; uuid: string }>> {
  try {
    // Snapshot del estado actual para poder restaurar si falla
    const { data: snapshot } = await supabase
      .from('consultas')
      .select('estado_cita, cancelado_por, motivo_consulta')
      .eq('consulta_id', appointmentId)
      .single();

    const cancelResult = await cancelAppointment(appointmentId, {
      reason: 'Reagendada a nueva fecha',
      cancelledBy: 'sistema',
    });

    if (!cancelResult.success) return { success: false, error: cancelResult.error };

    const createResult = await createAppointment(newData);

    if (!createResult.success && snapshot) {
      // Compensating transaction: restaurar estado original
      await supabase
        .from('consultas')
        .update({
          estado_cita: snapshot.estado_cita,
          cancelado_por: snapshot.cancelado_por,
          motivo_consulta: snapshot.motivo_consulta,
          updated_at: new Date().toISOString(),
        })
        .eq('consulta_id', appointmentId);
    }

    return createResult;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
