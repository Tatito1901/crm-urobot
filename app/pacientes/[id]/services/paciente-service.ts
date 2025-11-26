/**
 * ============================================================
 * PACIENTE SERVICE - Servicios para gestión de pacientes
 * ============================================================
 * Maneja operaciones de actualización de datos del paciente
 * incluyendo notas y destino (usando tabla destinos_pacientes)
 */

import { createClient } from '@/lib/supabase/client';
import type { DestinoPaciente } from '@/types/pacientes';

// Instancia del cliente Supabase
const supabase = createClient();

interface UpdateResult {
  success: boolean;
  error?: string;
}

/**
 * Guarda o actualiza el destino de un paciente en la tabla destinos_pacientes
 */
export async function updatePacienteDestino(
  pacienteId: string,
  destino: DestinoPaciente
): Promise<UpdateResult> {
  try {
    // Preparar datos para la BD
    const destinoData: Record<string, unknown> = {
      paciente_id: pacienteId,
      tipo_destino: destino.tipo,
      fecha_registro: destino.fechaRegistro || new Date().toISOString(),
      observaciones: destino.observaciones || null,
    };

    // Campos específicos según el tipo de destino
    if (destino.tipo === 'alta_definitiva' && destino.motivoAlta) {
      destinoData.motivo_alta = destino.motivoAlta;
    }

    if (destino.tipo === 'presupuesto_enviado' && destino.presupuesto) {
      destinoData.tipo_cirugia = destino.presupuesto.tipoCirugia;
      destinoData.monto = destino.presupuesto.monto;
      destinoData.moneda = destino.presupuesto.moneda;
      destinoData.fecha_evento = destino.presupuesto.fechaEnvio;
      destinoData.notas = destino.presupuesto.notas || null;
    }

    if (destino.tipo === 'cirugia_realizada' && destino.cirugia) {
      destinoData.tipo_cirugia = destino.cirugia.tipoCirugia;
      destinoData.monto = destino.cirugia.costo;
      destinoData.moneda = destino.cirugia.moneda;
      destinoData.fecha_evento = destino.cirugia.fechaCirugia;
      destinoData.sede_operacion = destino.cirugia.sedeOperacion || null;
      destinoData.notas = destino.cirugia.notas || null;
    }

    // Primero verificamos si ya existe un registro de destino para este paciente
    // Tabla destinos_pacientes no está en tipos generados aún
    const { data: existingDestino, error: fetchError } = await supabase
      // @ts-expect-error - Tabla destinos_pacientes no está en tipos generados
      .from('destinos_pacientes')
      .select('id')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error al verificar destino existente:', fetchError);
      return { success: false, error: fetchError.message };
    }

    let result;
    if (existingDestino) {
      // Actualizar el registro existente (tabla no está en tipos generados)
      result = await supabase
        // @ts-expect-error - Tabla destinos_pacientes no está en tipos generados
        .from('destinos_pacientes')
        .update(destinoData)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id', (existingDestino as any).id);
    } else {
      // Crear nuevo registro (tabla no está en tipos generados)
      result = await supabase
        // @ts-expect-error - Tabla destinos_pacientes no está en tipos generados
        .from('destinos_pacientes')
        .insert(destinoData);
    }

    if (result.error) {
      console.error('Error al guardar destino:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado al actualizar destino:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Actualiza las notas de texto libre de un paciente
 */
export async function updatePacienteNotas(
  pacienteId: string,
  notas: string
): Promise<UpdateResult> {
  try {
    const { error: updateError } = await supabase
      .from('pacientes')
      .update({ 
        notas: notas,
        updated_at: new Date().toISOString()
      })
      .eq('id', pacienteId);

    if (updateError) {
      console.error('Error al actualizar notas:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado al actualizar notas:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}
