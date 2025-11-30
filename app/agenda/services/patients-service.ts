/**
 * ============================================================
 * PATIENTS SERVICE - Capa de servicios para pacientes
 * ============================================================
 * Maneja operaciones CRUD para pacientes desde la agenda
 * Alinear estrictamente con el esquema de Supabase
 */

import { createClient } from '@/lib/supabase/client';
import type { Paciente, PacienteRow } from '@/types/pacientes';
import { mapPacienteFromDB } from '@/lib/mappers';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreatePatientData {
  nombre: string;
  telefono: string;
  email?: string;
  notas?: string; // No existe en BD, se ignorará por ahora
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\d{10,}$/.test(cleaned);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '');
}

// ============================================================
// OPERACIONES PRINCIPALES
// ============================================================

/**
 * Crea un nuevo paciente en la base de datos
 */
export async function createPatient(
  data: CreatePatientData
): Promise<ServiceResponse<Paciente>> {
  try {
    // Validaciones
    if (!data.nombre || data.nombre.trim().length < 3) {
      return { success: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }

    if (!data.telefono || !validatePhone(data.telefono)) {
      return { success: false, error: 'El teléfono debe tener al menos 10 dígitos' };
    }

    if (data.email && !validateEmail(data.email)) {
      return { success: false, error: 'El email no tiene un formato válido' };
    }

    const normalizedPhone = normalizePhone(data.telefono);

    // Verificar si ya existe un paciente con ese teléfono
    const { data: existingPatient } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email, fecha_nacimiento, origen_lead, created_at, updated_at')
      .eq('telefono', normalizedPhone)
      .maybeSingle();

    if (existingPatient) {
      // Mapear y retornar existente usando mappers centrales
      const paciente = mapPacienteFromDB(existingPatient as unknown as PacienteRow);
      return { success: true, data: paciente };
    }

    // Preparar datos para insertar (SOLO columnas existentes)
    const insertPayload = {
      nombre_completo: data.nombre.trim(),
      telefono: normalizedPhone,
      email: data.email?.trim() || null,
      origen_lead: 'Agenda', // Default
      // Notas y Estado no existen en la tabla 'pacientes' actual
    };

    // Insertar el nuevo paciente
    // Casting as any para evitar errores de tipos desactualizados en types/supabase.ts
    const { data: newPatient, error: insertError } = await supabase
      .from('pacientes')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertPayload as any)
      .select('id, nombre_completo, telefono, email, fecha_nacimiento, origen_lead, created_at, updated_at')
      .single();

    if (insertError) {
      console.error('Error al crear paciente:', insertError);
      return { success: false, error: insertError.message || 'Error al crear el paciente' };
    }

    // Actualizar Lead asociado si existe
    try {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('telefono_whatsapp', normalizedPhone)
        .maybeSingle();

      if (existingLead) {
        await supabase
          .from('leads')
          .update({
            estado: 'Convertido',
            paciente_id: newPatient.id,
            fecha_conversion: new Date().toISOString()
          })
          .eq('id', existingLead.id);
      }
    } catch (leadError) {
      // No bloqueamos la creación del paciente si falla la actualización del lead
      console.warn('Error al actualizar lead asociado:', leadError);
    }

    // Mapear a tipo Paciente
    const paciente = mapPacienteFromDB(newPatient as unknown as PacienteRow);

    return { success: true, data: paciente };
  } catch (error) {
    console.error('Error inesperado al crear paciente:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al crear el paciente',
    };
  }
}

/**
 * Busca un paciente por teléfono
 */
export async function findPatientByPhone(
  phone: string
): Promise<ServiceResponse<Paciente | null>> {
  try {
    const normalizedPhone = normalizePhone(phone);

    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email, fecha_nacimiento, origen_lead, created_at, updated_at')
      .eq('telefono', normalizedPhone)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: true, data: null };

    const paciente = mapPacienteFromDB(data as unknown as PacienteRow);
    return { success: true, data: paciente };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Busca un paciente por email
 */
export async function findPatientByEmail(
  email: string
): Promise<ServiceResponse<Paciente | null>> {
  try {
    if (!validateEmail(email)) return { success: false, error: 'Email no válido' };

    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email, fecha_nacimiento, origen_lead, created_at, updated_at')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: true, data: null };

    const paciente = mapPacienteFromDB(data as unknown as PacienteRow);
    return { success: true, data: paciente };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Crea un paciente automáticamente o retorna uno existente
 */
export async function getOrCreatePatient(
  data: CreatePatientData
): Promise<ServiceResponse<Paciente>> {
  const phoneResult = await findPatientByPhone(data.telefono);
  if (phoneResult.success && phoneResult.data) {
    return { success: true, data: phoneResult.data };
  }

  if (data.email) {
    const emailResult = await findPatientByEmail(data.email);
    if (emailResult.success && emailResult.data) {
      return { success: true, data: emailResult.data };
    }
  }

  return createPatient(data);
}
