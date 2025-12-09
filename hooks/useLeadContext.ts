/**
 * ============================================================
 * HOOK: useLeadContext
 * ============================================================
 * Obtiene contexto detallado de la última interacción de un lead
 * consultando los logs de UroBot.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_REALTIME } from '@/lib/swr-config';

const supabase = createClient();

export interface LeadContext {
  ultimaIntencion: string;
  ultimoSentiment: 'positivo' | 'negativo' | 'urgente' | 'neutral';
  ultimoMensajeUsuario: string;
  ultimoMensajeBot: string;
  fechaInteraccion: string;
  tieneCitaPendiente: boolean;
  alertasRecientes: number;
  sugerenciaAccion: string;
}

const DEFAULT_CONTEXT: LeadContext = {
  ultimaIntencion: 'desconocida',
  ultimoSentiment: 'neutral',
  ultimoMensajeUsuario: '',
  ultimoMensajeBot: '',
  fechaInteraccion: '',
  tieneCitaPendiente: false,
  alertasRecientes: 0,
  sugerenciaAccion: 'Revisar historial',
};

async function fetchLeadContext(telefono: string): Promise<LeadContext> {
  // Limpiar teléfono (quitar + y espacios)
  const telLimpio = telefono.replace(/[^\d]/g, '');

  // 1. Obtener último log de UroBot
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: logs, error } = await (supabase as any)
    .from('urobot_logs')
    .select('*')
    .eq('telefono', telLimpio) // Asumiendo que urobot_logs guarda sin formato o similar
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !logs || logs.length === 0) {
    // Intentar buscar con formato si falló
    return DEFAULT_CONTEXT;
  }

  const ultimoLog = logs[0];
  
  // 2. Determinar sugerencia basada en contexto
  let sugerencia = 'Seguimiento general';
  const intencion = ultimoLog.tipo_interaccion || 'general';
  const sentiment = ultimoLog.sentiment || 'neutral';
  
  if (sentiment === 'urgente') sugerencia = '🚨 Contactar de inmediato';
  else if (sentiment === 'negativo') sugerencia = '📞 Llamada de servicio al cliente';
  else if (intencion === 'agendar') sugerencia = '📅 Confirmar si agendó cita';
  else if (intencion === 'informacion') sugerencia = 'ℹ️ Enviar brochure o info detallada';
  else if (intencion === 'cancelar') sugerencia = '🔄 Intentar reagendar';

  return {
    ultimaIntencion: intencion,
    ultimoSentiment: sentiment,
    ultimoMensajeUsuario: ultimoLog.mensaje_usuario || '',
    ultimoMensajeBot: ultimoLog.mensaje_bot || '',
    fechaInteraccion: ultimoLog.created_at,
    tieneCitaPendiente: ultimoLog.tiene_cita_pendiente || false,
    alertasRecientes: 0, // Pendiente: buscar en tabla alertas
    sugerenciaAccion: sugerencia,
  };
}

export function useLeadContext(telefono: string | undefined) {
  const { data, isLoading } = useSWR(
    telefono ? `lead-context-${telefono}` : null,
    () => fetchLeadContext(telefono!),
    {
      ...SWR_CONFIG_REALTIME,
      shouldRetryOnError: false,
    }
  );

  return {
    context: data || DEFAULT_CONTEXT,
    isLoading,
    hasData: !!data && data !== DEFAULT_CONTEXT,
  };
}
