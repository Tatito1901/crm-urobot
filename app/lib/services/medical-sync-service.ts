/**
 * ============================================================
 * MEDICAL SYNC SERVICE - Servicio de sincronización médica
 * ============================================================
 * Sincroniza la agenda con fichas clínicas, historial médico
 * y otras herramientas internas del sistema Urobot
 */

import { createClient } from '@/lib/supabase/client';
import type { Consulta } from '@/types/consultas';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export interface MedicalRecord {
  id: string;
  pacienteId: string;
  appointmentId?: string;
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  notasMedicas: string;
  estudios?: string[];
  recetas?: string[];
}

export interface PatientHistory {
  pacienteId: string;
  totalConsultas: number;
  ultimaConsulta: string | null;
  proximaConsulta: string | null;
  diagnosticos: string[];
  alergias: string[];
  medicamentosActuales: string[];
}

export interface SyncStatus {
  lastSync: Date;
  status: 'success' | 'pending' | 'error';
  recordsSynced: number;
  errors: string[];
}

// ============================================================
// SINCRONIZACIÓN CON FICHAS CLÍNICAS
// ============================================================

/**
 * Sincroniza una cita con la ficha clínica del paciente
 */
export async function syncAppointmentWithMedicalRecord(
  appointment: Consulta
): Promise<SyncStatus> {
  const startTime = new Date();
  const errors: string[] = [];
  let recordsSynced = 0;

  try {
    // TODO: La tabla 'fichas_clinicas' aún no existe en la BD
    // Descomentar cuando se cree la tabla en Supabase

    // 1. Verificar si el paciente tiene ficha clínica
    // const { data: existingRecord, error: fetchError } = await supabase
    //   .from('fichas_clinicas')
    //   .select('*')
    //   .eq('paciente_id', appointment.pacienteId)
    //   .single();

    // if (fetchError && fetchError.code !== 'PGRST116') {
    //   // Error diferente a "no encontrado"
    //   errors.push(`Error al buscar ficha clínica: ${fetchError.message}`);
    // }

    // 2. Si no existe ficha clínica, crear una nueva
    // if (!existingRecord) {
    //   const { error: insertError } = await supabase.from('fichas_clinicas').insert({
    //     paciente_id: appointment.pacienteId,
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString(),
    //   });

    //   if (insertError) {
    //     errors.push(`Error al crear ficha clínica: ${insertError.message}`);
    //   } else {
    //     recordsSynced++;
    //   }
    // }

    // 3. Actualizar historial de consultas del paciente
    if (appointment.pacienteId) {
      await updatePatientConsultHistory(appointment.pacienteId, appointment);
      recordsSynced++;
    }

    // 4. Si la cita está completada, crear entrada en historial médico
    if (appointment.estado === 'Completada') {
      await createMedicalHistoryEntry(appointment);
      recordsSynced++;
    }

    return {
      lastSync: startTime,
      status: errors.length > 0 ? 'error' : 'success',
      recordsSynced,
      errors,
    };
  } catch (error) {
    console.error('Error en sincronización médica:', error);
    return {
      lastSync: startTime,
      status: 'error',
      recordsSynced,
      errors: [...errors, error instanceof Error ? error.message : 'Error desconocido'],
    };
  }
}

/**
 * Actualiza el historial de consultas del paciente
 */
async function updatePatientConsultHistory(
  pacienteId: string,
  appointment: Consulta
): Promise<void> {
  try {
    // Contar total de consultas del paciente
    const { count } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .eq('paciente_id', pacienteId)
      .in('estado_cita', ['Completada', 'Confirmada', 'Programada']);

    // Actualizar tabla de pacientes con estadísticas
    await supabase
      .from('pacientes')
      .update({
        total_consultas: count || 0,
        ultima_consulta: appointment.fechaConsulta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pacienteId);
  } catch (error) {
    console.error('Error actualizando historial de consultas:', error);
  }
}

/**
 * Crea entrada en historial médico cuando se completa una cita
 */
async function createMedicalHistoryEntry(appointment: Consulta): Promise<void> {
  try {
    // TODO: Implementar creación de entrada en tabla 'historial_medico'
    // Esta tabla debe contener:
    // - appointment_id
    // - paciente_id
    // - fecha
    // - diagnostico (opcional, agregar después)
    // - tratamiento (opcional)
    // - notas_medicas (del campo motivoConsulta)

    console.log('Creando entrada en historial médico para cita:', appointment.id);
  } catch (error) {
    console.error('Error creando entrada de historial médico:', error);
  }
}

// ============================================================
// OBTENCIÓN DE HISTORIAL DEL PACIENTE
// ============================================================

/**
 * Obtiene el historial médico completo de un paciente
 */
export async function getPatientMedicalHistory(
  pacienteId: string
): Promise<PatientHistory | null> {
  try {
    // 1. Obtener todas las consultas del paciente
    const { data: consultas } = await supabase
      .from('consultas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('fecha_consulta', { ascending: false });

    if (!consultas || consultas.length === 0) {
      return null;
    }

    // 2. Obtener datos del paciente (para futuras mejoras)
    // const { data: paciente } = await supabase
    //   .from('pacientes')
    //   .select('*')
    //   .eq('id', pacienteId)
    //   .single();

    // 3. Construir historial
    const consultasCompletadas = consultas.filter(
      (c) => c.estado_cita === 'Completada'
    );

    const consultasFuturas = consultas.filter(
      (c) =>
        c.estado_cita === 'Programada' || c.estado_cita === 'Confirmada'
    );

    return {
      pacienteId,
      totalConsultas: consultasCompletadas.length,
      ultimaConsulta:
        consultasCompletadas.length > 0
          ? consultasCompletadas[0].fecha_consulta
          : null,
      proximaConsulta:
        consultasFuturas.length > 0 ? consultasFuturas[0].fecha_consulta : null,
      diagnosticos: [], // TODO: Extraer de historial médico
      alergias: [], // TODO: Extraer de ficha clínica
      medicamentosActuales: [], // TODO: Extraer de ficha clínica
    };
  } catch (error) {
    console.error('Error obteniendo historial médico:', error);
    return null;
  }
}

// ============================================================
// INTEGRACIÓN CON OTROS SISTEMAS
// ============================================================

/**
 * Sincroniza citas con Google Calendar (si está configurado)
 */
export async function syncWithGoogleCalendar(
  appointment: Consulta
): Promise<boolean> {
  try {
    // TODO: Implementar integración con Google Calendar API
    // 1. Verificar si hay credenciales de Google Calendar
    // 2. Crear/actualizar evento en calendario
    // 3. Guardar calendar_event_id en la cita

    console.log('Sincronizando con Google Calendar:', appointment.id);
    return true;
  } catch (error) {
    console.error('Error sincronizando con Google Calendar:', error);
    return false;
  }
}

/**
 * Exporta la agenda a formato iCal/CSV para integración externa
 */
export async function exportAgendaToFormat(
  format: 'ical' | 'csv',
  startDate?: string,
  endDate?: string
): Promise<string | null> {
  try {
    let query = supabase.from('consultas').select('*');

    if (startDate) {
      query = query.gte('fecha_consulta', startDate);
    }

    if (endDate) {
      query = query.lte('fecha_consulta', endDate);
    }

    const { data: appointments } = await query.order('fecha_consulta', {
      ascending: true,
    });

    if (!appointments) return null;

    if (format === 'csv') {
      return generateCSV(appointments);
    } else if (format === 'ical') {
      return generateICal();
    }

    return null;
  } catch (error) {
    console.error('Error exportando agenda:', error);
    return null;
  }
}

// ============================================================
// FUNCIONES DE EXPORTACIÓN
// ============================================================

function generateCSV(appointments: unknown[]): string {
  const headers = [
    'ID',
    'Paciente',
    'Fecha',
    'Hora',
    'Duración',
    'Sede',
    'Tipo',
    'Estado',
    'Motivo',
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = appointments.map((apt: any) => [
    apt.consulta_id,
    apt.paciente?.nombre_completo || 'N/A',
    apt.fecha_consulta,
    apt.hora_consulta,
    apt.duracion_minutos,
    apt.sede,
    apt.tipo_cita,
    apt.estado_cita,
    apt.motivo_consulta || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

function generateICal(): string {
  // TODO: Implementar generación de archivo iCal
  // Formato estándar para sincronización con calendarios
  return 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Urobot CRM//ES\nEND:VCALENDAR';
}

// ============================================================
// SINCRONIZACIÓN BIDIRECCIONAL
// ============================================================

/**
 * Sincroniza cambios desde sistemas externos hacia Urobot
 */
export async function syncFromExternalSources(): Promise<SyncStatus> {
  const startTime = new Date();
  const recordsSynced = 0;
  const errors: string[] = [];

  try {
    // TODO: Implementar lógica de sincronización desde:
    // - Google Calendar
    // - Sistema de expedientes electrónicos
    // - Otros sistemas integrados

    return {
      lastSync: startTime,
      status: 'success',
      recordsSynced,
      errors,
    };
  } catch (error) {
    return {
      lastSync: startTime,
      status: 'error',
      recordsSynced,
      errors: [error instanceof Error ? error.message : 'Error desconocido'],
    };
  }
}

/**
 * Verifica conflictos antes de sincronizar
 */
export async function detectSyncConflicts(
  appointment: Consulta
): Promise<string[]> {
  const conflicts: string[] = [];

  try {
    // 1. Verificar conflictos de horario
    const { data: overlappingAppointments } = await supabase
      .from('consultas')
      .select('*')
      .eq('fecha_consulta', appointment.fechaConsulta)
      .eq('sede', appointment.sede)
      .neq('id', appointment.uuid)
      .in('estado_cita', ['Programada', 'Confirmada', 'En_Curso']);

    if (overlappingAppointments && overlappingAppointments.length > 0) {
      // Verificar solapamiento de horarios
      const aptStart = new Date(
        `${appointment.fechaConsulta}T${appointment.horaConsulta}`
      );
      const aptEnd = new Date(
        aptStart.getTime() + appointment.duracionMinutos * 60000
      );

      overlappingAppointments.forEach((existing) => {
        const existingStart = new Date(
          `${existing.fecha_consulta}T${existing.hora_consulta}`
        );
        const existingEnd = new Date(
          existingStart.getTime() + (existing.duracion_minutos || 30) * 60000
        );

        if (
          (aptStart >= existingStart && aptStart < existingEnd) ||
          (aptEnd > existingStart && aptEnd <= existingEnd) ||
          (aptStart <= existingStart && aptEnd >= existingEnd)
        ) {
          conflicts.push(
            `Conflicto de horario con cita existente a las ${existing.hora_consulta}`
          );
        }
      });
    }

    return conflicts;
  } catch (error) {
    console.error('Error detectando conflictos:', error);
    return ['Error al verificar conflictos'];
  }
}
