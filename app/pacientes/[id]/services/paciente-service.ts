/**
 * ============================================================
 * PACIENTE SERVICE - Servicios para gestión de pacientes
 * ============================================================
 * Maneja operaciones de actualización de datos del paciente
 * incluyendo notas y destino (usando tabla destinos_pacientes)
 */

import { createClient } from '@/lib/supabase/client';
import { type TipoDestino } from '@/types/destinos-pacientes';

// Tipo local para destino desde el modal de UI
interface DestinoPacienteUI {
  tipo: TipoDestino;
  fechaRegistro?: string;
  observaciones?: string;
  motivoAlta?: string;
  presupuesto?: {
    tipoCirugia: string;
    monto: number;
    moneda: string;
    fechaEnvio?: string;
    notas?: string;
  };
  cirugia?: {
    tipoCirugia: string;
    costo: number;
    moneda: string;
    fechaCirugia?: string;
    sedeOperacion?: string;
    notas?: string;
  };
}

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
  destino: DestinoPacienteUI
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

    // Insertar SIEMPRE un nuevo registro para mantener el historial
    // Esto permite tener un timeline completo de acciones y seguimiento financiero
    const { error: insertError } = await supabase
      .from('destinos_pacientes')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(destinoData as any);

    if (insertError) {
      console.error('Error al guardar historial de destino:', insertError);
      return { success: false, error: insertError.message };
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

/**
 * Obtiene la nota clínica de una consulta específica
 */
export async function getNotaConsulta(consultaId: string): Promise<{ nota: string | null; error?: string }> {
  try {
    const { data, error } = await supabase
      // @ts-expect-error - Tabla consultas_notas no está en tipos generados
      .from('consultas_notas')
      .select('nota')
      .eq('consulta_id', consultaId)
      .maybeSingle();

    if (error) {
      console.error('Error al obtener nota de consulta:', error);
      return { nota: null, error: error.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notaData = data as any;
    return { nota: notaData?.nota || null };
  } catch (error) {
    console.error('Error inesperado al obtener nota:', error);
    return { nota: null, error: 'Error desconocido' };
  }
}

/**
 * Guarda o actualiza la nota clínica de una consulta
 */
export async function saveNotaConsulta(consultaId: string, nota: string): Promise<UpdateResult> {
  try {
    // Verificar si ya existe
    const { data: existing } = await supabase
      // @ts-expect-error - Tabla consultas_notas no está en tipos generados
      .from('consultas_notas')
      .select('id')
      .eq('consulta_id', consultaId)
      .maybeSingle();

    let error;

    if (existing) {
      const { error: updateError } = await supabase
        // @ts-expect-error - Tabla consultas_notas no está en tipos generados
        .from('consultas_notas')
        .update({ 
          nota, 
          updated_at: new Date().toISOString() 
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id', (existing as any).id);
      error = updateError;
    } else {
      // Tabla consultas_notas no está en tipos generados de Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('consultas_notas')
        .insert({
          consulta_id: consultaId,
          nota,
          created_at: new Date().toISOString()
        });
      error = insertError;
    }

    if (error) {
      console.error('Error al guardar nota de consulta:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado al guardar nota:', error);
    return { success: false, error: 'Error desconocido' };
  }
}
