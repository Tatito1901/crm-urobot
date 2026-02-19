/**
 * ============================================================
 * DASHBOARD V2 — Types, defaults & parser
 * ============================================================
 * Shared between RSC (page.tsx) and client hook (useDashboardV2).
 * This file has NO client-only dependencies (no SWR, no Supabase client)
 * so it can be safely imported from Server Components.
 */

// ── Tipos ────────────────────────────────────────────────────

export interface DashboardKPIs {
  leadsTotal: number;
  leadsHoy: number;
  leadsSemana: number;
  leadsMes: number;
  leadsMesAnterior: number;
  pacientesTotal: number;
  pacientesNuevosMes: number;
  consultasHoy: number;
  consultasSemana: number;
  consultasProgramadas: number;
  consultasCompletadasMes: number;
  consultasNoAsistioMes: number;
  consultasTotalMes: number;
  conversacionesActivas: number;
  escalamientosPendientes: number;
  ingresosMes: number;
  ingresosMesAnterior: number;
  ticketPromedio: number;
}

export interface DashboardAcciones {
  escalamientosPendientes: number;
  leadsCalientesSinCita: number;
  consultasSinConfirmar: number;
  mensajesNoLeidos: number;
  leadsSinRespuesta24h: number;
}

export interface PipelineItem {
  estado: string;
  count: number;
}

export interface TemperaturaItem {
  temperatura: string;
  count: number;
}

export interface FuenteItem {
  fuente: string;
  count: number;
}

export interface TrendPoint {
  fecha: string;
  count: number;
}

export interface FunnelItem {
  etapa: string;
  count: number;
}

export interface BotMetrics {
  conversacionesTotal: number;
  conversacionesActivas: number;
  conversacionesResueltas: number;
  promedioTiempoRespuestaSeg: number;
  totalMensajesBot: number;
  totalMensajesUsuario: number;
  escalamientosHoy: number;
  escalamientosTotal: number;
  citasAgendadasBot: number;
  tasaResolucion: number;
  tasaEscalamiento: number;
  tasaCitaBot: number;
  conversacionesHoy: number;
  promedioMensajesPorConv: number;
}

export interface LeadReciente {
  id: string;
  nombre: string;
  telefono: string;
  estado: string;
  temperatura: string | null;
  fuente: string | null;
  scoreTotal: number | null;
  etapaFunnel: string | null;
  createdAt: string;
}

export interface ConsultaProxima {
  id: string;
  paciente: string;
  fechaHoraInicio: string;
  estadoCita: string;
  tipoCita: string | null;
  confirmadoPaciente: boolean;
  sedeId: string | null;
}

export interface EscalamientoReciente {
  id: string;
  nombre: string;
  temperatura: string | null;
  interes: string | null;
  esUrgente: boolean;
  resultado: string;
  citaAgendada: boolean;
  sintomasPrincipales: string | null;
  createdAt: string;
}

export interface ConsultaEstadoItem {
  estado: string;
  count: number;
}

export interface DashboardV2Data {
  kpis: DashboardKPIs;
  acciones: DashboardAcciones;
  pipeline: PipelineItem[];
  temperaturas: TemperaturaItem[];
  fuentes: FuenteItem[];
  bot: BotMetrics;
  leadsRecientes: LeadReciente[];
  consultasProximas: ConsultaProxima[];
  escalamientosRecientes: EscalamientoReciente[];
  consultasPorEstado: ConsultaEstadoItem[];
  leadsTendencia: TrendPoint[];
  consultasTendencia: TrendPoint[];
  funnel: FunnelItem[];
}

// ── Defaults ─────────────────────────────────────────────────

export const defaultKPIs: DashboardKPIs = {
  leadsTotal: 0, leadsHoy: 0, leadsSemana: 0, leadsMes: 0, leadsMesAnterior: 0,
  pacientesTotal: 0, pacientesNuevosMes: 0,
  consultasHoy: 0, consultasSemana: 0, consultasProgramadas: 0,
  consultasCompletadasMes: 0, consultasNoAsistioMes: 0, consultasTotalMes: 0,
  conversacionesActivas: 0, escalamientosPendientes: 0,
  ingresosMes: 0, ingresosMesAnterior: 0, ticketPromedio: 0,
};

export const defaultAcciones: DashboardAcciones = {
  escalamientosPendientes: 0, leadsCalientesSinCita: 0,
  consultasSinConfirmar: 0, mensajesNoLeidos: 0, leadsSinRespuesta24h: 0,
};

export const defaultBot: BotMetrics = {
  conversacionesTotal: 0, conversacionesActivas: 0, conversacionesResueltas: 0,
  promedioTiempoRespuestaSeg: 0, totalMensajesBot: 0, totalMensajesUsuario: 0,
  escalamientosHoy: 0, escalamientosTotal: 0, citasAgendadasBot: 0,
  tasaResolucion: 0, tasaEscalamiento: 0, tasaCitaBot: 0,
  conversacionesHoy: 0, promedioMensajesPorConv: 0,
};

export const defaultData: DashboardV2Data = {
  kpis: defaultKPIs, acciones: defaultAcciones,
  pipeline: [], temperaturas: [], fuentes: [],
  bot: defaultBot, leadsRecientes: [], consultasProximas: [],
  escalamientosRecientes: [], consultasPorEstado: [],
  leadsTendencia: [], consultasTendencia: [], funnel: [],
};

// ── Parser ───────────────────────────────────────────────────

/**
 * Parsea la respuesta raw de get_dashboard_v2 RPC a tipos TypeScript.
 * Usado tanto por el RSC (page.tsx) como por el client fetcher (useDashboardV2).
 */
export function parseDashboardV2(data: unknown): DashboardV2Data {
  if (!data) return defaultData;

  const d = data as Record<string, unknown>;
  const kpisRaw = (d.kpis || {}) as Record<string, number>;
  const accionesRaw = (d.acciones || {}) as Record<string, number>;
  const botRaw = (d.bot || {}) as Record<string, number>;

  return {
    kpis: {
      leadsTotal: Number(kpisRaw.leads_total) || 0,
      leadsHoy: Number(kpisRaw.leads_hoy) || 0,
      leadsSemana: Number(kpisRaw.leads_semana) || 0,
      leadsMes: Number(kpisRaw.leads_mes) || 0,
      leadsMesAnterior: Number(kpisRaw.leads_mes_anterior) || 0,
      pacientesTotal: Number(kpisRaw.pacientes_total) || 0,
      pacientesNuevosMes: Number(kpisRaw.pacientes_nuevos_mes) || 0,
      consultasHoy: Number(kpisRaw.consultas_hoy) || 0,
      consultasSemana: Number(kpisRaw.consultas_semana) || 0,
      consultasProgramadas: Number(kpisRaw.consultas_programadas) || 0,
      consultasCompletadasMes: Number(kpisRaw.consultas_completadas_mes) || 0,
      consultasNoAsistioMes: Number(kpisRaw.consultas_no_asistio_mes) || 0,
      consultasTotalMes: Number(kpisRaw.consultas_total_mes) || 0,
      conversacionesActivas: Number(kpisRaw.conversaciones_activas) || 0,
      escalamientosPendientes: Number(kpisRaw.escalamientos_pendientes) || 0,
      ingresosMes: Number(kpisRaw.ingresos_mes) || 0,
      ingresosMesAnterior: Number(kpisRaw.ingresos_mes_anterior) || 0,
      ticketPromedio: Number(kpisRaw.ticket_promedio) || 0,
    },
    acciones: {
      escalamientosPendientes: Number(accionesRaw.escalamientos_pendientes) || 0,
      leadsCalientesSinCita: Number(accionesRaw.leads_calientes_sin_cita) || 0,
      consultasSinConfirmar: Number(accionesRaw.consultas_sin_confirmar) || 0,
      mensajesNoLeidos: Number(accionesRaw.mensajes_no_leidos) || 0,
      leadsSinRespuesta24h: Number(accionesRaw.leads_sin_respuesta_24h) || 0,
    },
    pipeline: ((d.pipeline || []) as Array<Record<string, unknown>>).map(p => ({
      estado: String(p.estado || ''),
      count: Number(p.count) || 0,
    })),
    temperaturas: ((d.temperaturas || []) as Array<Record<string, unknown>>).map(t => ({
      temperatura: String(t.temperatura || ''),
      count: Number(t.count) || 0,
    })),
    fuentes: ((d.fuentes || []) as Array<Record<string, unknown>>).map(f => ({
      fuente: String(f.fuente || ''),
      count: Number(f.count) || 0,
    })),
    bot: {
      conversacionesTotal: Number(botRaw.conversaciones_total) || 0,
      conversacionesActivas: Number(botRaw.conversaciones_activas) || 0,
      conversacionesResueltas: Number(botRaw.conversaciones_resueltas) || 0,
      promedioTiempoRespuestaSeg: Number(botRaw.promedio_tiempo_respuesta_seg) || 0,
      totalMensajesBot: Number(botRaw.total_mensajes_bot) || 0,
      totalMensajesUsuario: Number(botRaw.total_mensajes_usuario) || 0,
      escalamientosHoy: Number(botRaw.escalamientos_hoy) || 0,
      escalamientosTotal: Number(botRaw.escalamientos_total) || 0,
      citasAgendadasBot: Number(botRaw.citas_agendadas_bot) || 0,
      tasaResolucion: Number(botRaw.tasa_resolucion) || 0,
      tasaEscalamiento: Number(botRaw.tasa_escalamiento) || 0,
      tasaCitaBot: Number(botRaw.tasa_cita_bot) || 0,
      conversacionesHoy: Number(botRaw.conversaciones_hoy) || 0,
      promedioMensajesPorConv: Number(botRaw.promedio_mensajes_por_conv) || 0,
    },
    leadsRecientes: ((d.leads_recientes || []) as Array<Record<string, unknown>>).map(l => ({
      id: String(l.id),
      nombre: String(l.nombre || 'Sin nombre'),
      telefono: String(l.telefono || ''),
      estado: String(l.estado || 'nuevo'),
      temperatura: l.temperatura ? String(l.temperatura) : null,
      fuente: l.fuente ? String(l.fuente) : null,
      scoreTotal: l.score_total ? Number(l.score_total) : null,
      etapaFunnel: l.etapa_funnel ? String(l.etapa_funnel) : null,
      createdAt: String(l.created_at || ''),
    })),
    consultasProximas: ((d.consultas_proximas || []) as Array<Record<string, unknown>>).map(c => ({
      id: String(c.id),
      paciente: String(c.paciente || 'Paciente'),
      fechaHoraInicio: String(c.fecha_hora_inicio || ''),
      estadoCita: String(c.estado_cita || 'Programada'),
      tipoCita: c.tipo_cita ? String(c.tipo_cita) : null,
      confirmadoPaciente: Boolean(c.confirmado_paciente),
      sedeId: c.sede_id ? String(c.sede_id) : null,
    })),
    escalamientosRecientes: ((d.escalamientos_recientes || []) as Array<Record<string, unknown>>).map(e => ({
      id: String(e.id),
      nombre: String(e.nombre || 'Sin nombre'),
      temperatura: e.temperatura ? String(e.temperatura) : null,
      interes: e.interes ? String(e.interes) : null,
      esUrgente: Boolean(e.es_urgente),
      resultado: String(e.resultado || 'pendiente'),
      citaAgendada: Boolean(e.cita_agendada),
      sintomasPrincipales: e.sintomas_principales ? String(e.sintomas_principales) : null,
      createdAt: String(e.created_at || ''),
    })),
    consultasPorEstado: ((d.consultas_por_estado || []) as Array<Record<string, unknown>>).map(ce => ({
      estado: String(ce.estado || ''),
      count: Number(ce.count) || 0,
    })),
    leadsTendencia: ((d.leads_tendencia || []) as Array<Record<string, unknown>>).map(t => ({
      fecha: String(t.fecha || ''),
      count: Number(t.count) || 0,
    })),
    consultasTendencia: ((d.consultas_tendencia || []) as Array<Record<string, unknown>>).map(t => ({
      fecha: String(t.fecha || ''),
      count: Number(t.count) || 0,
    })),
    funnel: ((d.funnel || []) as Array<Record<string, unknown>>).map(f => ({
      etapa: String(f.etapa || ''),
      count: Number(f.count) || 0,
    })),
  };
}
