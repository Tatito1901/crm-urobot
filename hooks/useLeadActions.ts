/**
 * ============================================================
 * HOOK: useLeadActions
 * ============================================================
 * Sistema inteligente de gestión de acciones para leads
 * - Registra cada acción tomada
 * - Calcula recomendaciones basadas en historial
 * - Determina cuándo dejar de contactar
 */

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import type { Lead, LeadEstado } from '@/types/leads';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export type TipoAccion = 
  | 'mensaje_enviado'
  | 'llamada_realizada'
  | 'etapa_cambiada'
  | 'cita_agendada'
  | 'nota_agregada'
  | 'reactivacion_intentada';

export interface AccionLead {
  id: string;
  leadId: string;
  tipo: TipoAccion;
  descripcion: string;
  plantillaUsada?: string;
  etapaAnterior?: LeadEstado;
  etapaNueva?: LeadEstado;
  creadoEn: Date;
}

export interface RecomendacionLead {
  accion: 'contactar' | 'esperar' | 'descartar' | 'urgente';
  razon: string;
  diasEsperar?: number;
  plantillaSugerida?: string;
  prioridad: 'alta' | 'media' | 'baja' | 'no_contactar';
  alertas: string[];
}

export interface HistorialContacto {
  totalMensajesEnviados: number;
  totalMensajesRecibidos: number;
  ultimoMensajeEnviado?: Date;
  ultimoMensajeRecibido?: Date;
  diasSinRespuesta: number;
  intentosSeguimiento: number;
  respondioAlguna: boolean;
  tasaRespuesta: number; // 0-100
}

// ============================================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================================

const CONFIG = {
  // Máximo de intentos antes de marcar como "no molestar"
  MAX_INTENTOS_SIN_RESPUESTA: 3,
  
  // Días entre cada intento de seguimiento
  DIAS_ENTRE_SEGUIMIENTOS: 3,
  
  // Días sin respuesta para considerar "frío"
  DIAS_LEAD_FRIO: 7,
  
  // Días sin respuesta para considerar "perdido"
  DIAS_LEAD_PERDIDO: 14,
  
  // Tasa de respuesta mínima para seguir contactando (%)
  TASA_RESPUESTA_MINIMA: 10,
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Analiza el historial de conversación de un lead
 */
async function analizarHistorialConversacion(telefono: string): Promise<HistorialContacto> {
  const { data: mensajes, error } = await supabase
    .from('conversaciones')
    .select('rol, created_at, mensaje')
    .eq('telefono', telefono)
    .order('created_at', { ascending: true });

  if (error || !mensajes) {
    return {
      totalMensajesEnviados: 0,
      totalMensajesRecibidos: 0,
      diasSinRespuesta: 999,
      intentosSeguimiento: 0,
      respondioAlguna: false,
      tasaRespuesta: 0,
    };
  }

  const enviados = mensajes.filter(m => m.rol === 'asistente');
  const recibidos = mensajes.filter(m => m.rol === 'usuario');
  
  const ultimoEnviado = enviados.length > 0 
    ? new Date(enviados[enviados.length - 1].created_at!) 
    : undefined;
  const ultimoRecibido = recibidos.length > 0 
    ? new Date(recibidos[recibidos.length - 1].created_at!) 
    : undefined;

  // Calcular días sin respuesta
  let diasSinRespuesta = 999;
  if (ultimoEnviado) {
    if (ultimoRecibido && ultimoRecibido > ultimoEnviado) {
      diasSinRespuesta = 0; // Respondió después de nuestro mensaje
    } else {
      diasSinRespuesta = Math.floor(
        (Date.now() - ultimoEnviado.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  }

  // Contar intentos de seguimiento (mensajes enviados sin respuesta intermedia)
  let intentosSeguimiento = 0;
  let esperandoRespuesta = false;
  
  for (const msg of mensajes) {
    if (msg.rol === 'asistente') {
      if (esperandoRespuesta) {
        intentosSeguimiento++;
      }
      esperandoRespuesta = true;
    } else {
      esperandoRespuesta = false;
    }
  }

  // Tasa de respuesta
  const tasaRespuesta = enviados.length > 0 
    ? Math.round((recibidos.length / enviados.length) * 100)
    : 0;

  return {
    totalMensajesEnviados: enviados.length,
    totalMensajesRecibidos: recibidos.length,
    ultimoMensajeEnviado: ultimoEnviado,
    ultimoMensajeRecibido: ultimoRecibido,
    diasSinRespuesta,
    intentosSeguimiento,
    respondioAlguna: recibidos.length > 0,
    tasaRespuesta,
  };
}

/**
 * Genera recomendación inteligente basada en historial
 */
function generarRecomendacion(
  lead: Lead,
  historial: HistorialContacto
): RecomendacionLead {
  const alertas: string[] = [];
  
  // === CASO 1: Lead ya convertido ===
  if (lead.estado === 'Convertido') {
    return {
      accion: 'esperar',
      razon: '✅ Este lead ya es paciente',
      prioridad: 'baja',
      alertas: [],
    };
  }

  // === CASO 2: Demasiados intentos sin respuesta ===
  if (historial.intentosSeguimiento >= CONFIG.MAX_INTENTOS_SIN_RESPUESTA && !historial.respondioAlguna) {
    return {
      accion: 'descartar',
      razon: `⛔ ${historial.intentosSeguimiento} intentos sin respuesta. Recomendamos no insistir.`,
      prioridad: 'no_contactar',
      alertas: ['Este lead nunca ha respondido', 'Considerar marcar como Perdido'],
    };
  }

  // === CASO 3: Lead nuevo sin contactar ===
  if (lead.estado === 'Nuevo' && historial.totalMensajesEnviados === 0) {
    return {
      accion: 'urgente',
      razon: '🚨 Lead nuevo sin contactar. Responder en menos de 1 hora aumenta 7x la conversión.',
      plantillaSugerida: 'saludo-inicial',
      prioridad: 'alta',
      alertas: ['Primera respuesta pendiente'],
    };
  }

  // === CASO 4: Respondió pero no hemos dado seguimiento ===
  if (historial.diasSinRespuesta === 0 && historial.ultimoMensajeRecibido) {
    const ultimoMensaje = new Date(historial.ultimoMensajeRecibido);
    const horasSinResponder = Math.floor(
      (Date.now() - ultimoMensaje.getTime()) / (1000 * 60 * 60)
    );
    
    if (horasSinResponder < 24) {
      return {
        accion: 'urgente',
        razon: `⚡ El lead respondió hace ${horasSinResponder}h. Momento ideal para avanzar.`,
        plantillaSugerida: lead.estado === 'Contactado' ? 'info-servicios' : 'confirmar-interes',
        prioridad: 'alta',
        alertas: ['Respuesta reciente pendiente de atender'],
      };
    }
  }

  // === CASO 5: Esperando respuesta, evaluar si dar seguimiento ===
  if (historial.diasSinRespuesta > 0) {
    // Mucho tiempo sin respuesta
    if (historial.diasSinRespuesta >= CONFIG.DIAS_LEAD_PERDIDO) {
      if (historial.intentosSeguimiento >= 2) {
        return {
          accion: 'descartar',
          razon: `💤 ${historial.diasSinRespuesta} días sin respuesta después de ${historial.intentosSeguimiento} seguimientos.`,
          prioridad: 'no_contactar',
          alertas: ['Considerar marcar como Perdido o No_Interesado'],
        };
      }
      return {
        accion: 'contactar',
        razon: `🔄 Último intento de reactivación (${historial.diasSinRespuesta} días sin respuesta)`,
        plantillaSugerida: 'reactivar-lead',
        prioridad: 'baja',
        alertas: ['Este será el último intento recomendado'],
      };
    }

    // Tiempo moderado sin respuesta
    if (historial.diasSinRespuesta >= CONFIG.DIAS_ENTRE_SEGUIMIENTOS) {
      if (historial.intentosSeguimiento < CONFIG.MAX_INTENTOS_SIN_RESPUESTA) {
        return {
          accion: 'contactar',
          razon: `📅 Han pasado ${historial.diasSinRespuesta} días. Seguimiento #${historial.intentosSeguimiento + 1} de ${CONFIG.MAX_INTENTOS_SIN_RESPUESTA}.`,
          plantillaSugerida: 'seguimiento-sin-respuesta',
          prioridad: 'media',
          alertas: historial.intentosSeguimiento >= 2 
            ? ['Penúltimo intento antes de marcar como frío'] 
            : [],
        };
      }
    }

    // Poco tiempo, esperar
    return {
      accion: 'esperar',
      razon: `⏳ Esperar ${CONFIG.DIAS_ENTRE_SEGUIMIENTOS - historial.diasSinRespuesta} días más antes del siguiente contacto.`,
      diasEsperar: CONFIG.DIAS_ENTRE_SEGUIMIENTOS - historial.diasSinRespuesta,
      prioridad: 'baja',
      alertas: [],
    };
  }

  // === CASO DEFAULT: Contactar según etapa ===
  const plantillasPorEtapa: Record<LeadEstado, string> = {
    'Nuevo': 'saludo-inicial',
    'Contactado': 'info-servicios',
    'Interesado': 'enviar-costos',
    'Calificado': 'agendar-cita',
    'Convertido': 'preparacion-cita',
    'No_Interesado': 'reactivar-lead',
    'Perdido': 'reactivar-lead',
  };

  return {
    accion: 'contactar',
    razon: `📬 Continuar conversación según etapa "${lead.estado}"`,
    plantillaSugerida: plantillasPorEtapa[lead.estado],
    prioridad: 'media',
    alertas,
  };
}

// ============================================================
// ACCIONES DE BASE DE DATOS
// ============================================================

/**
 * Registra una acción tomada con un lead
 */
async function registrarAccion(
  leadId: string,
  tipo: TipoAccion,
  descripcion: string,
  metadata?: {
    plantillaUsada?: string;
    etapaAnterior?: LeadEstado;
    etapaNueva?: LeadEstado;
  }
): Promise<void> {
  // Actualizar notas_seguimiento del lead con la acción
  const timestamp = new Date().toISOString();
  const accionTexto = `[${timestamp.split('T')[0]}] ${descripcion}`;
  
  // Obtener notas actuales
  const { data: leadData } = await supabase
    .from('leads')
    .select('notas_seguimiento, ultimo_seguimiento')
    .eq('id', leadId)
    .single();

  // Type assertion - estos campos existen en BD
  const lead = leadData as { notas_seguimiento: string | null; ultimo_seguimiento: string | null } | null;
  const notasActuales = lead?.notas_seguimiento || '';
  const nuevasNotas = notasActuales 
    ? `${accionTexto}\n---\n${notasActuales}`
    : accionTexto;

  // Actualizar lead
  await supabase
    .from('leads')
    .update({
      notas_seguimiento: nuevasNotas.substring(0, 2000), // Limitar tamaño
      ultimo_seguimiento: timestamp,
      updated_at: timestamp,
    })
    .eq('id', leadId);
}

/**
 * Cambia el estado de un lead y registra la acción
 */
async function cambiarEstadoLead(
  leadId: string,
  nuevoEstado: LeadEstado,
  estadoAnterior: LeadEstado
): Promise<void> {
  const timestamp = new Date().toISOString();
  
  await supabase
    .from('leads')
    .update({
      estado: nuevoEstado,
      updated_at: timestamp,
      // Si se convierte, registrar fecha
      ...(nuevoEstado === 'Convertido' && { fecha_conversion: timestamp }),
    })
    .eq('id', leadId);

  await registrarAccion(
    leadId,
    'etapa_cambiada',
    `Cambio de etapa: ${estadoAnterior} → ${nuevoEstado}`
  );
}

/**
 * Genera URL de WhatsApp con mensaje pre-llenado
 */
function generarWhatsAppURL(telefono: string, mensaje: string): string {
  // Limpiar teléfono (solo números)
  const telefonoLimpio = telefono.replace(/\D/g, '');
  
  // Agregar código de país si no lo tiene
  const telefonoCompleto = telefonoLimpio.length === 10 
    ? `52${telefonoLimpio}` 
    : telefonoLimpio;
  
  // Encodear mensaje para URL
  const mensajeEncoded = encodeURIComponent(mensaje);
  
  return `https://wa.me/${telefonoCompleto}?text=${mensajeEncoded}`;
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

interface UseLeadActionsReturn {
  // Datos
  historial: HistorialContacto | null;
  recomendacion: RecomendacionLead | null;
  isLoading: boolean;
  
  // Acciones
  enviarMensajeWhatsApp: (mensaje: string, plantillaId?: string) => Promise<void>;
  cambiarEstado: (nuevoEstado: LeadEstado) => Promise<void>;
  registrarLlamada: (notas?: string) => Promise<void>;
  marcarComoNoMolestar: () => Promise<void>;
  
  // Helpers
  generarURLWhatsApp: (mensaje: string) => string;
  refetch: () => Promise<void>;
}

export function useLeadActions(lead: Lead | null): UseLeadActionsReturn {
  // Fetch historial de conversación
  const { 
    data: historial, 
    isLoading,
    mutate 
  } = useSWR(
    lead ? `lead-historial-${lead.telefono}` : null,
    () => analizarHistorialConversacion(lead!.telefono),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 segundos
    }
  );

  // Calcular recomendación
  const recomendacion = useMemo(() => {
    if (!lead || !historial) return null;
    return generarRecomendacion(lead, historial);
  }, [lead, historial]);

  // Enviar mensaje por WhatsApp
  const enviarMensajeWhatsApp = useCallback(async (
    mensaje: string, 
    plantillaId?: string
  ) => {
    if (!lead) return;
    
    // Abrir WhatsApp con mensaje
    const url = generarWhatsAppURL(lead.telefono, mensaje);
    window.open(url, '_blank');
    
    // Registrar acción
    await registrarAccion(
      lead.id,
      'mensaje_enviado',
      `Mensaje enviado${plantillaId ? ` (plantilla: ${plantillaId})` : ''}: "${mensaje.substring(0, 50)}..."`,
      { plantillaUsada: plantillaId }
    );
    
    // Incrementar contador de interacciones
    await supabase
      .from('leads')
      .update({ 
        total_interacciones: (lead.totalInteracciones || 0) + 1,
        ultima_interaccion: new Date().toISOString(),
      })
      .eq('id', lead.id);
    
    // Refrescar datos
    await mutate();
  }, [lead, mutate]);

  // Cambiar estado
  const cambiarEstado = useCallback(async (nuevoEstado: LeadEstado) => {
    if (!lead) return;
    await cambiarEstadoLead(lead.id, nuevoEstado, lead.estado);
    await mutate();
  }, [lead, mutate]);

  // Registrar llamada
  const registrarLlamada = useCallback(async (notas?: string) => {
    if (!lead) return;
    await registrarAccion(
      lead.id,
      'llamada_realizada',
      `Llamada realizada${notas ? `: ${notas}` : ''}`
    );
    await mutate();
  }, [lead, mutate]);

  // Marcar como no molestar
  const marcarComoNoMolestar = useCallback(async () => {
    if (!lead) return;
    await cambiarEstadoLead(lead.id, 'No_Interesado', lead.estado);
    await registrarAccion(
      lead.id,
      'etapa_cambiada',
      'Marcado como "No molestar" - Demasiados intentos sin respuesta'
    );
    await mutate();
  }, [lead, mutate]);

  // Helper para generar URL
  const generarURLWhatsApp = useCallback((mensaje: string) => {
    if (!lead) return '';
    return generarWhatsAppURL(lead.telefono, mensaje);
  }, [lead]);

  return {
    historial: historial || null,
    recomendacion,
    isLoading,
    enviarMensajeWhatsApp,
    cambiarEstado,
    registrarLlamada,
    marcarComoNoMolestar,
    generarURLWhatsApp,
    refetch: async () => { await mutate(); },
  };
}

export default useLeadActions;
