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

export interface ConversacionReciente {
  telefono: string;
  totalMensajes: number;
  ultimoMensaje: string;
  fecha: string;
  tipoContacto: 'paciente' | 'lead' | 'desconocido';
}

export interface ConversacionesStats {
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
// FETCHER
// ============================================================

// Tipos para queries
interface ConversacionRow {
  telefono: string;
  rol: string;
  mensaje: string | null;
  created_at: string;
}

interface UrobotLogRow {
  telefono: string | null;
  tipo_interaccion: string | null;
  tiempo_respuesta_ms: number | null;
  requirio_escalacion: boolean | null;
  herramientas_llamadas: unknown;
  created_at: string;
}

async function fetchConversacionesStats(dias: number): Promise<ConversacionesStats> {
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - dias);
  const fechaInicioISO = fechaInicio.toISOString();
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyISO = hoy.toISOString();

  // Query paralelos para mejor rendimiento
  const [
    conversacionesRes,
    urobotLogsRes,
    conversacionesHoyRes,
  ] = await Promise.all([
    // Todos los mensajes del período
    supabase
      .from('conversaciones')
      .select('telefono, rol, mensaje, created_at')
      .gte('created_at', fechaInicioISO)
      .order('created_at', { ascending: false }),
    
    // Logs de UroBot del período (tabla no tipada, usar any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('urobot_logs')
      .select('telefono, tipo_interaccion, tiempo_respuesta_ms, requirio_escalacion, herramientas_llamadas, created_at')
      .gte('created_at', fechaInicioISO),
    
    // Mensajes de hoy
    supabase
      .from('conversaciones')
      .select('telefono, rol')
      .gte('created_at', hoyISO),
  ]);

  const conversaciones = (conversacionesRes.data || []) as ConversacionRow[];
  const urobotLogs = (urobotLogsRes.data || []) as UrobotLogRow[];
  const conversacionesHoy = (conversacionesHoyRes.data || []) as { telefono: string; rol: string }[];

  // ============================================================
  // CALCULAR KPIs
  // ============================================================
  
  // Mensajes por rol
  const mensajesRecibidos = conversaciones.filter(c => c.rol === 'usuario');
  const mensajesEnviados = conversaciones.filter(c => c.rol === 'asistente');
  
  // Usuarios únicos
  const telefonosUnicos = new Set(conversaciones.map(c => c.telefono));
  const telefonosHoy = new Set(conversacionesHoy.map(c => c.telefono));
  
  // Mensajes hoy
  const mensajesRecibidosHoy = conversacionesHoy.filter(c => c.rol === 'usuario').length;
  const mensajesEnviadosHoy = conversacionesHoy.filter(c => c.rol === 'asistente').length;
  
  // Tiempo de respuesta promedio
  const tiemposRespuesta = urobotLogs
    .filter(l => l.tiempo_respuesta_ms && l.tiempo_respuesta_ms > 0)
    .map(l => l.tiempo_respuesta_ms as number);
  const tiempoRespuestaPromedio = tiemposRespuesta.length > 0
    ? Math.round(tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length)
    : 0;
  
  // Citas agendadas por bot
  const citasAgendadas = urobotLogs.filter(l => {
    const herramientas = l.herramientas_llamadas as string[] | null;
    return herramientas?.some(h => 
      h.includes('agendar') || h.includes('cita') || h.includes('appointment')
    );
  }).length;
  
  // Escalaciones
  const escalaciones = urobotLogs.filter(l => l.requirio_escalacion).length;
  
  // Usuarios recurrentes (más de 3 mensajes)
  const mensajesPorUsuario = new Map<string, number>();
  conversaciones.forEach(c => {
    mensajesPorUsuario.set(c.telefono, (mensajesPorUsuario.get(c.telefono) || 0) + 1);
  });
  const usuariosRecurrentes = Array.from(mensajesPorUsuario.values()).filter(count => count > 3).length;
  
  // Tasa de respuesta
  const tasaRespuesta = mensajesRecibidos.length > 0
    ? Math.round((mensajesEnviados.length / mensajesRecibidos.length) * 100)
    : 0;

  const kpi: ConversacionesKPI = {
    totalMensajesRecibidos: mensajesRecibidos.length,
    totalMensajesEnviados: mensajesEnviados.length,
    totalConversaciones: telefonosUnicos.size,
    mensajesRecibidosHoy,
    mensajesEnviadosHoy,
    conversacionesHoy: telefonosHoy.size,
    promedioMensajesPorConversacion: telefonosUnicos.size > 0
      ? Math.round(conversaciones.length / telefonosUnicos.size)
      : 0,
    tiempoRespuestaPromedio,
    preguntasRespondidas: urobotLogs.length,
    citasAgendadasPorBot: citasAgendadas,
    escalacionesHumano: escalaciones,
    usuariosRecurrentes,
    tasaRespuesta,
  };

  // ============================================================
  // MENSAJES POR HORA
  // ============================================================
  
  const porHora = new Map<number, { recibidos: number; enviados: number }>();
  for (let i = 0; i < 24; i++) {
    porHora.set(i, { recibidos: 0, enviados: 0 });
  }
  
  conversaciones.forEach(c => {
    const hora = new Date(c.created_at).getHours();
    const current = porHora.get(hora)!;
    if (c.rol === 'usuario') {
      current.recibidos++;
    } else {
      current.enviados++;
    }
  });
  
  const mensajesPorHora: MensajesPorHora[] = Array.from(porHora.entries())
    .map(([hora, data]) => ({
      hora: `${hora.toString().padStart(2, '0')}:00`,
      recibidos: data.recibidos,
      enviados: data.enviados,
    }));

  // ============================================================
  // TIPOS DE INTERACCIÓN
  // ============================================================
  
  const tiposCount = new Map<string, number>();
  urobotLogs.forEach(log => {
    const tipo = log.tipo_interaccion || 'general';
    tiposCount.set(tipo, (tiposCount.get(tipo) || 0) + 1);
  });
  
  const totalInteracciones = urobotLogs.length;
  const tiposInteraccion: TipoInteraccion[] = Array.from(tiposCount.entries())
    .map(([tipo, cantidad]) => ({
      tipo: formatTipoInteraccion(tipo),
      cantidad,
      porcentaje: totalInteracciones > 0 ? Math.round((cantidad / totalInteracciones) * 100) : 0,
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6);

  // ============================================================
  // TOP PREGUNTAS (basado en keywords de mensajes)
  // ============================================================
  
  const categoriasKeywords: Record<string, string[]> = {
    'Citas y Horarios': ['cita', 'agendar', 'horario', 'disponible', 'fecha', 'hora'],
    'Precios y Costos': ['precio', 'costo', 'cuanto', 'pago', 'tarifa', 'cobr'],
    'Ubicación': ['donde', 'ubicacion', 'direccion', 'llegar', 'consultorio'],
    'Procedimientos': ['cirugia', 'procedimiento', 'operacion', 'tratamiento'],
    'Síntomas': ['dolor', 'sintoma', 'molestia', 'ardor', 'orina'],
    'Resultados': ['resultado', 'estudio', 'analisis', 'laboratorio'],
  };
  
  const categoriasCount = new Map<string, number>();
  mensajesRecibidos.forEach(msg => {
    const mensajeLower = (msg.mensaje || '').toLowerCase();
    for (const [categoria, keywords] of Object.entries(categoriasKeywords)) {
      if (keywords.some(kw => mensajeLower.includes(kw))) {
        categoriasCount.set(categoria, (categoriasCount.get(categoria) || 0) + 1);
        break;
      }
    }
  });
  
  const topPreguntas: TopPregunta[] = Array.from(categoriasCount.entries())
    .map(([categoria, cantidad]) => ({ categoria, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // ============================================================
  // CONVERSACIONES RECIENTES
  // ============================================================
  
  const ultimosPorTelefono = new Map<string, { mensaje: string; fecha: string; count: number }>();
  conversaciones.forEach(c => {
    if (!ultimosPorTelefono.has(c.telefono)) {
      ultimosPorTelefono.set(c.telefono, {
        mensaje: c.mensaje?.substring(0, 50) || '',
        fecha: c.created_at,
        count: 1,
      });
    } else {
      ultimosPorTelefono.get(c.telefono)!.count++;
    }
  });
  
  const conversacionesRecientes: ConversacionReciente[] = Array.from(ultimosPorTelefono.entries())
    .slice(0, 10)
    .map(([telefono, data]) => ({
      telefono: `***${telefono.slice(-4)}`,
      totalMensajes: data.count,
      ultimoMensaje: data.mensaje,
      fecha: data.fecha,
      tipoContacto: 'desconocido' as const,
    }));

  // ============================================================
  // MENSAJES POR DÍA
  // ============================================================
  
  const porDia = new Map<string, { recibidos: number; enviados: number }>();
  conversaciones.forEach(c => {
    const fecha = new Date(c.created_at).toISOString().split('T')[0];
    if (!porDia.has(fecha)) {
      porDia.set(fecha, { recibidos: 0, enviados: 0 });
    }
    const current = porDia.get(fecha)!;
    if (c.rol === 'usuario') {
      current.recibidos++;
    } else {
      current.enviados++;
    }
  });
  
  const mensajesPorDia = Array.from(porDia.entries())
    .map(([fecha, data]) => ({
      fecha: formatFechaCorta(fecha),
      recibidos: data.recibidos,
      enviados: data.enviados,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-14); // Últimos 14 días

  return {
    kpi,
    mensajesPorHora,
    tiposInteraccion,
    topPreguntas,
    conversacionesRecientes,
    mensajesPorDia,
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

function formatFechaCorta(fecha: string): string {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
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
