/**
 * ============================================================
 * HOOK: useUrobotMetricasCRM
 * ============================================================
 * Consume la RPC get_urobot_metricas_crm() que calcula métricas
 * en tiempo real desde mensajes + escalamientos
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD } from '@/lib/swr-config';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

interface MetricasCRMDiarias {
  fecha: string;
  totalMensajes: number;
  citasAgendadas: number;
  citasCanceladas: number;
  citasReagendadas: number;
  confirmaciones: number;
  escalaciones: number;
  tasaConversionAgendar: number;
  avgTiempoMs: number;
  maxTiempoMs: number;
  errores: number;
  tasaError: number;
  pctPositivo: number;
  pctNegativo: number;
  pctUrgente: number;
}

export interface ActividadPorHora {
  hora: number;
  mensajes: number;
  agendadas: number;
  avgTiempoMs: number;
}

export interface IntentDistribucion {
  intent: string;
  cantidad: number;
  porcentaje: number;
  icono: string;
}

export interface ConversionFunnel {
  etapa: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface MetricasCRMResumen {
  // KPIs principales
  totalMensajes: number;
  mensajesHoy: number;
  citasAgendadas: number;
  citasAgendadasHoy: number;
  citasCanceladas: number;
  citasReagendadas: number;
  confirmaciones: number;
  escalaciones: number;
  
  // Performance
  tasaConversion: number;
  avgTiempoMs: number;
  tasaError: number;
  
  // Sentiment
  sentimentPositivo: number;
  sentimentNegativo: number;
  sentimentUrgente: number;
  sentimentNeutral: number;
  
  // Intenciones
  intentAgendar: number;
  intentReagendar: number;
  intentCancelar: number;
  intentConfirmar: number;
  intentInformacion: number;
  intentUrgencia: number;
  intentSeguimiento: number;
  intentSaludo: number;
  intentOtro: number;
}

interface UrobotMetricasCRMData {
  resumen: MetricasCRMResumen;
  diario: MetricasCRMDiarias[];
  porHora: ActividadPorHora[];
  intents: IntentDistribucion[];
  funnel: ConversionFunnel[];
}

// ============================================================
// DEFAULTS
// ============================================================

const defaultResumen: MetricasCRMResumen = {
  totalMensajes: 0,
  mensajesHoy: 0,
  citasAgendadas: 0,
  citasAgendadasHoy: 0,
  citasCanceladas: 0,
  citasReagendadas: 0,
  confirmaciones: 0,
  escalaciones: 0,
  tasaConversion: 0,
  avgTiempoMs: 0,
  tasaError: 0,
  sentimentPositivo: 0,
  sentimentNegativo: 0,
  sentimentUrgente: 0,
  sentimentNeutral: 0,
  intentAgendar: 0,
  intentReagendar: 0,
  intentCancelar: 0,
  intentConfirmar: 0,
  intentInformacion: 0,
  intentUrgencia: 0,
  intentSeguimiento: 0,
  intentSaludo: 0,
  intentOtro: 0,
};

const defaultData: UrobotMetricasCRMData = {
  resumen: defaultResumen,
  diario: [],
  porHora: [],
  intents: [],
  funnel: [],
};

// ============================================================
// ICONOS Y COLORES
// ============================================================

const INTENT_CONFIG: Record<string, { icono: string; label: string }> = {
  agendar: { icono: '📅', label: 'Agendar cita' },
  reagendar: { icono: '🔄', label: 'Reagendar' },
  cancelar: { icono: '❌', label: 'Cancelar' },
  confirmar: { icono: '✅', label: 'Confirmar' },
  informacion: { icono: 'ℹ️', label: 'Información' },
  urgencia: { icono: '🚨', label: 'Urgencia' },
  seguimiento: { icono: '📋', label: 'Seguimiento' },
  saludo: { icono: '👋', label: 'Saludo' },
  otro: { icono: '💬', label: 'Otro' },
};

const FUNNEL_COLORS = {
  intentos: 'var(--chart-blue)',
  agendadas: 'var(--chart-emerald)',
  confirmadas: 'var(--chart-purple)',
  completadas: 'var(--chart-cyan)',
};

// ============================================================
// FETCHER — calls get_urobot_metricas_crm RPC
// ============================================================

async function fetchMetricasCRM(dias: number): Promise<UrobotMetricasCRMData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_urobot_metricas_crm', {
    p_dias: dias,
  });

  if (error) {
    console.error('Error fetching metricas CRM:', error);
    return defaultData;
  }

  const d = data as Record<string, unknown> | null;
  if (!d) return defaultData;

  // ============================================================
  // PARSE RESUMEN from RPC
  // ============================================================
  const r = (d.resumen || {}) as Record<string, number>;

  const resumen: MetricasCRMResumen = {
    totalMensajes: Number(r.totalMensajes) || 0,
    mensajesHoy: Number(r.mensajesHoy) || 0,
    citasAgendadas: Number(r.citasAgendadas) || 0,
    citasAgendadasHoy: Number(r.citasAgendadasHoy) || 0,
    citasCanceladas: Number(r.citasCanceladas) || 0,
    citasReagendadas: Number(r.citasReagendadas) || 0,
    confirmaciones: Number(r.confirmaciones) || 0,
    escalaciones: Number(r.escalaciones) || 0,
    tasaConversion: Number(r.intentAgendar) > 0
      ? Math.round((Number(r.citasAgendadas) / Number(r.intentAgendar)) * 100)
      : 0,
    avgTiempoMs: Number(r.avgTiempoMs) || 0,
    tasaError: Number(r.tasaError) || 0,
    sentimentPositivo: Number(r.sentimentPositivo) || 0,
    sentimentNegativo: Number(r.sentimentNegativo) || 0,
    sentimentUrgente: Number(r.sentimentUrgente) || 0,
    sentimentNeutral: Number(r.sentimentNeutral) || 0,
    intentAgendar: Number(r.intentAgendar) || 0,
    intentReagendar: Number(r.intentReagendar) || 0,
    intentCancelar: Number(r.intentCancelar) || 0,
    intentConfirmar: Number(r.intentConfirmar) || 0,
    intentInformacion: Number(r.intentInformacion) || 0,
    intentUrgencia: Number(r.intentUrgencia) || 0,
    intentSeguimiento: Number(r.intentSeguimiento) || 0,
    intentSaludo: Number(r.intentSaludo) || 0,
    intentOtro: Number(r.intentOtro) || 0,
  };

  // ============================================================
  // PARSE DIARIO from RPC
  // ============================================================
  const diarioRaw = (d.diario || []) as Array<Record<string, unknown>>;
  const diario: MetricasCRMDiarias[] = diarioRaw.map(row => ({
    fecha: String(row.fecha || ''),
    totalMensajes: Number(row.totalMensajes) || 0,
    citasAgendadas: Number(row.citasAgendadas) || 0,
    citasCanceladas: 0,
    citasReagendadas: 0,
    confirmaciones: 0,
    escalaciones: Number(row.escalaciones) || 0,
    tasaConversionAgendar: 0,
    avgTiempoMs: 0,
    maxTiempoMs: 0,
    errores: Number(row.errores) || 0,
    tasaError: Number(row.totalMensajes) > 0
      ? Math.round((Number(row.errores) / Number(row.totalMensajes)) * 100 * 10) / 10
      : 0,
    pctPositivo: 0,
    pctNegativo: 0,
    pctUrgente: 0,
  }));

  // ============================================================
  // PARSE POR HORA from RPC
  // ============================================================
  const porHoraRaw = (d.porHora || []) as Array<Record<string, number>>;
  const porHora: ActividadPorHora[] = porHoraRaw.length > 0
    ? porHoraRaw.map(h => ({
        hora: Number(h.hora),
        mensajes: Number(h.mensajes) || 0,
        agendadas: Number(h.agendadas) || 0,
        avgTiempoMs: 0,
      }))
    : Array.from({ length: 24 }, (_, i) => ({ hora: i, mensajes: 0, agendadas: 0, avgTiempoMs: 0 }));

  // ============================================================
  // DISTRIBUCIÓN DE INTENCIONES (client-side from resumen)
  // ============================================================
  const totalIntents = resumen.intentAgendar + resumen.intentReagendar +
    resumen.intentCancelar + resumen.intentConfirmar + resumen.intentInformacion +
    resumen.intentUrgencia + resumen.intentSeguimiento + resumen.intentSaludo + resumen.intentOtro;

  const intents: IntentDistribucion[] = [
    { intent: 'agendar', cantidad: resumen.intentAgendar, porcentaje: 0, icono: INTENT_CONFIG.agendar.icono },
    { intent: 'informacion', cantidad: resumen.intentInformacion, porcentaje: 0, icono: INTENT_CONFIG.informacion.icono },
    { intent: 'confirmar', cantidad: resumen.intentConfirmar, porcentaje: 0, icono: INTENT_CONFIG.confirmar.icono },
    { intent: 'reagendar', cantidad: resumen.intentReagendar, porcentaje: 0, icono: INTENT_CONFIG.reagendar.icono },
    { intent: 'cancelar', cantidad: resumen.intentCancelar, porcentaje: 0, icono: INTENT_CONFIG.cancelar.icono },
    { intent: 'urgencia', cantidad: resumen.intentUrgencia, porcentaje: 0, icono: INTENT_CONFIG.urgencia.icono },
    { intent: 'seguimiento', cantidad: resumen.intentSeguimiento, porcentaje: 0, icono: INTENT_CONFIG.seguimiento.icono },
    { intent: 'saludo', cantidad: resumen.intentSaludo, porcentaje: 0, icono: INTENT_CONFIG.saludo.icono },
  ]
    .map(i => ({ ...i, porcentaje: totalIntents > 0 ? Math.round((i.cantidad / totalIntents) * 100) : 0 }))
    .filter(i => i.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad);

  // ============================================================
  // FUNNEL DE CONVERSIÓN
  // ============================================================
  const funnel: ConversionFunnel[] = [
    {
      etapa: 'Intención de agendar',
      cantidad: resumen.intentAgendar,
      porcentaje: 100,
      color: FUNNEL_COLORS.intentos,
    },
    {
      etapa: 'Citas agendadas',
      cantidad: resumen.citasAgendadas,
      porcentaje: resumen.intentAgendar > 0 ? Math.round((resumen.citasAgendadas / resumen.intentAgendar) * 100) : 0,
      color: FUNNEL_COLORS.agendadas,
    },
    {
      etapa: 'Confirmaciones',
      cantidad: resumen.confirmaciones,
      porcentaje: resumen.citasAgendadas > 0 ? Math.round((resumen.confirmaciones / resumen.citasAgendadas) * 100) : 0,
      color: FUNNEL_COLORS.confirmadas,
    },
  ];

  return { resumen, diario, porHora, intents, funnel };
}

// ============================================================
// HOOK
// ============================================================

export function useUrobotMetricasCRM(dias: number = 7) {
  const { data, error, isLoading, mutate } = useSWR(
    `urobot-metricas-crm-${dias}`,
    () => fetchMetricasCRM(dias),
    {
      ...SWR_CONFIG_DASHBOARD,
      refreshInterval: 2 * 60 * 1000, // Actualizar cada 2 minutos
    }
  );

  return {
    data: data || defaultData,
    resumen: data?.resumen || defaultResumen,
    isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
