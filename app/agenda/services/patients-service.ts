/**
 * ============================================================
 * PATIENTS SERVICE - Servicio para gestión de pacientes
 * ============================================================
 * Maneja operaciones CRUD para pacientes desde la agenda
 */

import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';
import type { Insertable } from '@/types/database';
import type { Paciente } from '@/types/pacientes';

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
  notas?: string;
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Genera un paciente_id único
 */
function generatePacienteId(): string {
  const timestamp = Date.now().toString(36);
  const random = nanoid(6);
  return `PAC-${timestamp}-${random}`.toUpperCase();
}

/**
 * Valida que el teléfono tenga un formato válido
 */
function validatePhone(phone: string): boolean {
  // Remover espacios y caracteres especiales
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Debe tener al menos 10 dígitos
  return /^\d{10,}$/.test(cleaned);
}

/**
 * Valida que el email tenga un formato válido
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normaliza el teléfono para almacenamiento
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '');
}

// ============================================================
// OPERACIONES PRINCIPALES
// ============================================================

/**
 * Crea un nuevo paciente en la base de datos
 *
 * @param data - Datos del paciente a crear
 * @returns Respuesta con el paciente creado
 *
 * @example
 * ```typescript
 * const result = await createPatient({
 *   nombre: 'Juan Pérez',
 *   telefono: '5551234567',
 *   email: 'juan@example.com'
 * });
 *
 * if (result.success) {
 *   console.log('Paciente creado:', result.data);
 * }
 * ```
 */
export async function createPatient(
  data: CreatePatientData
): Promise<ServiceResponse<Paciente>> {
  try {
    // Validaciones
    if (!data.nombre || data.nombre.trim().length < 3) {
      return {
        success: false,
        error: 'El nombre debe tener al menos 3 caracteres',
      };
    }

    if (!data.telefono || !validatePhone(data.telefono)) {
      return {
        success: false,
        error: 'El teléfono debe tener al menos 10 dígitos',
      };
    }

    if (data.email && !validateEmail(data.email)) {
      return {
        success: false,
        error: 'El email no tiene un formato válido',
      };
    }

    const normalizedPhone = normalizePhone(data.telefono);

    // Verificar si ya existe un paciente con ese teléfono
    const { data: existingPatient } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email')
      .eq('telefono', normalizedPhone)
      .maybeSingle();

    if (existingPatient) {
      // Retornar el paciente existente
      return {
        success: true,
        data: {
          id: existingPatient.id,
          nombre: existingPatient.nombre_completo,
          telefono: existingPatient.telefono,
          email: existingPatient.email || '',
          totalConsultas: 0,
          ultimaConsulta: null,
          estado: 'Activo',
        },
      };
    }

    // Preparar datos para insertar
    const insertData: Insertable<'pacientes'> = {
      paciente_id: generatePacienteId(),
      nombre_completo: data.nombre.trim(),
      telefono: normalizedPhone,
      email: data.email?.trim() || null,
      notas: data.notas?.trim() || null,
      estado: 'Activo',
      fuente_original: 'Agenda',
      fecha_registro: new Date().toISOString(),
      total_consultas: 0,
    };

    // Insertar el nuevo paciente
    const { data: newPatient, error: insertError } = await supabase
      .from('pacientes')
      .insert(insertData)
      .select('id, paciente_id, nombre_completo, telefono, email, total_consultas, ultima_consulta, estado')
      .single();

    if (insertError) {
      console.error('Error al crear paciente:', insertError);
      return {
        success: false,
        error: insertError.message || 'Error al crear el paciente',
      };
    }

    // Mapear a tipo Paciente
    const paciente: Paciente = {
      id: newPatient.id,
      nombre: newPatient.nombre_completo,
      telefono: newPatient.telefono,
      email: newPatient.email || '',
      totalConsultas: newPatient.total_consultas || 0,
      ultimaConsulta: newPatient.ultima_consulta,
      estado: newPatient.estado as 'Activo' | 'Inactivo',
    };

    return {
      success: true,
      data: paciente,
    };
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
 *
 * @param phone - Teléfono a buscar
 * @returns Paciente si existe, null si no existe
 */
export async function findPatientByPhone(
  phone: string
): Promise<ServiceResponse<Paciente | null>> {
  try {
    const normalizedPhone = normalizePhone(phone);

    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email, total_consultas, ultima_consulta, estado')
      .eq('telefono', normalizedPhone)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: true,
        data: null,
      };
    }

    const paciente: Paciente = {
      id: data.id,
      nombre: data.nombre_completo,
      telefono: data.telefono,
      email: data.email || '',
      totalConsultas: data.total_consultas || 0,
      ultimaConsulta: data.ultima_consulta,
      estado: data.estado as 'Activo' | 'Inactivo',
    };

    return {
      success: true,
      data: paciente,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Busca un paciente por email
 *
 * @param email - Email a buscar
 * @returns Paciente si existe, null si no existe
 */
export async function findPatientByEmail(
  email: string
): Promise<ServiceResponse<Paciente | null>> {
  try {
    if (!validateEmail(email)) {
      return {
        success: false,
        error: 'Email no válido',
      };
    }

    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email, total_consultas, ultima_consulta, estado')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: true,
        data: null,
      };
    }

    const paciente: Paciente = {
      id: data.id,
      nombre: data.nombre_completo,
      telefono: data.telefono,
      email: data.email || '',
      totalConsultas: data.total_consultas || 0,
      ultimaConsulta: data.ultima_consulta,
      estado: data.estado as 'Activo' | 'Inactivo',
    };

    return {
      success: true,
      data: paciente,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Crea un paciente automáticamente o retorna uno existente
 * Útil para crear pacientes desde la agenda de forma rápida
 *
 * @param data - Datos del paciente
 * @returns Paciente creado o encontrado
 */
export async function getOrCreatePatient(
  data: CreatePatientData
): Promise<ServiceResponse<Paciente>> {
  // Primero buscar por teléfono
  const phoneResult = await findPatientByPhone(data.telefono);

  if (phoneResult.success && phoneResult.data) {
    return {
      success: true,
      data: phoneResult.data,
    };
  }

  // Si tiene email, buscar por email
  if (data.email) {
    const emailResult = await findPatientByEmail(data.email);

    if (emailResult.success && emailResult.data) {
      return {
        success: true,
        data: emailResult.data,
      };
    }
  }

  // No existe, crear nuevo
  return createPatient(data);
}
