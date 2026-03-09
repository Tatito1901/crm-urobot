/**
 * ============================================================
 * HOOK: useConversacionesStats
 * ============================================================
 * Estadísticas detalladas de las conversaciones de UroBot
 * - Mensajes enviados vs recibidos
 * - Preguntas respondidas
 * - Distribución por hora
 * - Tipos de interacción
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD } from '@/lib/swr-config';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export interface ConversacionesKPI {
  // Mensajes
  totalMensajesRecibidos: number;
  totalMensajesEnviados: number;
  totalConversaciones: number;
  
  // Hoy
  mensajesRecibidosHoy: number;
  mensajesEnviadosHoy: number;
  conversacionesHoy: number;
  
  // Promedios
  promedioMensajesPorConversacion: number;
  tiempoRespuestaPromedio: number;
  
  // UroBot específicos
  preguntasRespondidas: number;
  citasAgendadasPorBot: number;
  escalacionesHumano: number;
  
  // Engagement
  usuariosRecurrentes: number;
  tasaRespuesta: number;
}

export interface MensajesPorHora {
  hora: string;
  recibidos: number;
  enviados: number;
}

export interface TipoInteraccion {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

export interface TopPregunta {
  categoria: string;
  cantidad: number;
}

interface ConversacionReciente {
  telefono: string;
  totalMensajes: number;
  ultimoMensaje: string;
  fecha: string;
  tipoContacto: 'paciente' | 'lead' | 'desconocido';
}

interface ConversacionesStats {
  kpi: ConversacionesKPI;
  mensajesPorHora: MensajesPorHora[];
  tiposInteraccion: TipoInteraccion[];
  topPreguntas: TopPregunta[];
  conversacionesRecientes: ConversacionReciente[];
  mensajesPorDia: { fecha: string; recibidos: number; enviados: number }[];
}

// ============================================================
// DEFAULTS
// ============================================================

const defaultKPI: ConversacionesKPI = {
  totalMensajesRecibidos: 0,
  totalMensajesEnviados: 0,
  totalConversaciones: 0,
  mensajesRecibidosHoy: 0,
  mensajesEnviadosHoy: 0,
  conversacionesHoy: 0,
  promedioMensajesPorConversacion: 0,
  tiempoRespuestaPromedio: 0,
  preguntasRespondidas: 0,
  citasAgendadasPorBot: 0,
  escalacionesHumano: 0,
  usuariosRecurrentes: 0,
  tasaRespuesta: 0,
};

const defaultStats: ConversacionesStats = {
  kpi: defaultKPI,
  mensajesPorHora: [],
  tiposInteraccion: [],
  topPreguntas: [],
  conversacionesRecientes: [],
  mensajesPorDia: [],
};

// ============================================================
// FETCHER — Usa RPC server-side (1 sola llamada)
// ============================================================

/**
 * ✅ OPTIMIZADO: Una sola llamada RPC que ejecuta toda la agregación en PostgreSQL
 * Antes: 3 queries paralelas + procesamiento pesado en JS del navegador
 * Ahora: 1 RPC que retorna jsonb pre-calculado
 */
async function fetchConversacionesStats(dias: number): Promise<ConversacionesStats> {
  const { data, error } = await supabase.rpc('get_conversaciones_stats', {
    p_dias: dias,
  });

  if (error) throw error;

  const d = data as Record<string, unknown> | null;
  if (!d) return defaultStats;

  const kpiRaw = (d.kpi || {}) as Record<string, number>;

  const kpi: ConversacionesKPI = {
    totalMensajesRecibidos: Number(kpiRaw.totalMensajesRecibidos) || 0,
    totalMensajesEnviados: Number(kpiRaw.totalMensajesEnviados) || 0,
    totalConversaciones: Number(kpiRaw.totalConversaciones) || 0,
    mensajesRecibidosHoy: Number(kpiRaw.mensajesRecibidosHoy) || 0,
    mensajesEnviadosHoy: Number(kpiRaw.mensajesEnviadosHoy) || 0,
    conversacionesHoy: Number(kpiRaw.conversacionesHoy) || 0,
    promedioMensajesPorConversacion: Number(kpiRaw.promedioMensajesPorConversacion) || 0,
    tiempoRespuestaPromedio: Number(kpiRaw.tiempoRespuestaPromedio) || 0,
    preguntasRespondidas: Number(kpiRaw.preguntasRespondidas) || 0,
    citasAgendadasPorBot: Number(kpiRaw.citasAgendadasPorBot) || 0,
    escalacionesHumano: Number(kpiRaw.escalacionesHumano) || 0,
    usuariosRecurrentes: Number(kpiRaw.usuariosRecurrentes) || 0,
    tasaRespuesta: Number(kpiRaw.tasaRespuesta) || 0,
  };

  // Los tipos de interacción necesitan el formateo de emoji (client-side)
  const tiposRaw = (d.tiposInteraccion || []) as { tipo: string; cantidad: number; porcentaje: number }[];
  const tiposInteraccion: TipoInteraccion[] = tiposRaw.map(t => ({
    tipo: formatTipoInteraccion(t.tipo),
    cantidad: Number(t.cantidad),
    porcentaje: Number(t.porcentaje),
  }));

  return {
    kpi,
    mensajesPorHora: (d.mensajesPorHora || []) as MensajesPorHora[],
    tiposInteraccion,
    topPreguntas: (d.topPreguntas || []) as TopPregunta[],
    conversacionesRecientes: (d.conversacionesRecientes || []) as ConversacionReciente[],
    mensajesPorDia: (d.mensajesPorDia || []) as { fecha: string; recibidos: number; enviados: number }[],
  };
}

// ============================================================
// HELPERS
// ============================================================

function formatTipoInteraccion(tipo: string): string {
  const map: Record<string, string> = {
    'agendar': '📅 Agendar cita',
    'consulta': '❓ Consulta médica',
    'reagendar': '🔄 Reagendar',
    'cancelar': '❌ Cancelar',
    'informacion': 'ℹ️ Información',
    'general': '💬 General',
    'ubicacion': '📍 Ubicación',
    'precios': '💰 Precios',
  };
  return map[tipo.toLowerCase()] || `💬 ${tipo}`;
}

// ============================================================
// HOOK
// ============================================================

export function useConversacionesStats(dias: number = 7) {
  const { data, error, isLoading, mutate } = useSWR(
    `conversaciones-stats-${dias}`,
    () => fetchConversacionesStats(dias),
    {
      ...SWR_CONFIG_DASHBOARD,
      refreshInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos
    }
  );

  return {
    stats: data || defaultStats,
    kpi: data?.kpi || defaultKPI,
    isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
