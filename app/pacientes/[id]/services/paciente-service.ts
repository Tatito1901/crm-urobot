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
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error) {
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
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('consultas_notas')
      .select('nota')
      .eq('consulta_id', consultaId)
      .maybeSingle();

    if (error) {
      // Si el error es que no existe la tabla, retornar null sin error (caso normal de primera nota)
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return { nota: null };
      }
      return { nota: null, error: error.message };
    }

    return { nota: data?.nota || null };
  } catch {
    return { nota: null, error: 'Error desconocido' };
  }
}

/**
 * Guarda o actualiza la nota clínica de una consulta
 * Usa UPSERT para simplificar la lógica
 */
export async function saveNotaConsulta(consultaId: string, nota: string): Promise<UpdateResult> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('consultas_notas')
      .upsert(
        {
          consulta_id: consultaId,
          nota,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'consulta_id',
          ignoreDuplicates: false 
        }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Error desconocido' };
  }
}

// ============================================================
// CONVERSACIONES
// ============================================================

/**
 * Guarda un mensaje en la tabla de conversaciones usando RPC
 * Útil para enviar mensajes desde el CRM (futura funcionalidad)
 */
export async function guardarMensaje(
  telefono: string,
  rol: 'usuario' | 'asistente',
  mensaje: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('guardar_mensaje', {
      p_telefono: telefono,
      p_rol: rol,
      p_mensaje: mensaje,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data as string };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Obtiene el contexto completo de UroBot para un paciente
 * Incluye historial, cita pendiente e información del paciente
 */
export async function obtenerContextoUrobot(telefono: string): Promise<{
  success: boolean;
  contexto?: {
    historialConversacion: string;
    tieneCitaPendiente: boolean;
    infoCita: string;
    nombrePaciente: string;
    esPacienteConocido: boolean;
  };
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('obtener_contexto_urobot', {
      p_telefono: telefono,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // La RPC puede retornar un objeto o null
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { 
        success: true, 
        contexto: {
          historialConversacion: 'Primera conversación con este paciente.',
          tieneCitaPendiente: false,
          infoCita: '',
          nombrePaciente: '',
          esPacienteConocido: false,
        }
      };
    }

    // El RPC retorna un array o un objeto directo - castear a tipo esperado
    type ContextoRow = {
      historial_conversacion?: string;
      tiene_cita_pendiente?: boolean;
      info_cita?: string;
      nombre_paciente?: string;
      es_paciente_conocido?: boolean;
    };
    const rawRow = Array.isArray(data) ? data[0] : data;
    const row = rawRow as ContextoRow | null;
    
    if (!row) {
      return { 
        success: true, 
        contexto: {
          historialConversacion: 'Primera conversación con este paciente.',
          tieneCitaPendiente: false,
          infoCita: '',
          nombrePaciente: '',
          esPacienteConocido: false,
        }
      };
    }
    
    return {
      success: true,
      contexto: {
        historialConversacion: row.historial_conversacion || '',
        tieneCitaPendiente: row.tiene_cita_pendiente || false,
        infoCita: row.info_cita || '',
        nombrePaciente: row.nombre_paciente || '',
        esPacienteConocido: row.es_paciente_conocido || false,
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}
