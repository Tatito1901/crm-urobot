/**
 * ============================================================
 * HOOK: useUrobotMetricasCRM
 * ============================================================
 * Consume las métricas agregadas de urobot_metricas_crm
 * Usa las vistas v_urobot_dashboard_diario y v_urobot_actividad_hora
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD } from '@/lib/swr-config';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export interface MetricasCRMDiarias {
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

export interface UrobotMetricasCRMData {
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
// FETCHER
// ============================================================

interface MetricasRow {
  fecha: string;
  hora_bucket: number;
  total_mensajes: number;
  mensajes_entrantes: number;
  mensajes_salientes: number;
  citas_agendadas: number;
  citas_canceladas: number;
  citas_reagendadas: number;
  confirmaciones: number;
  escalaciones: number;
  intent_agendar: number;
  intent_reagendar: number;
  intent_cancelar: number;
  intent_confirmar: number;
  intent_informacion: number;
  intent_urgencia: number;
  intent_seguimiento: number;
  intent_saludo: number;
  intent_otro: number;
  sentiment_positivo: number;
  sentiment_negativo: number;
  sentiment_urgente: number;
  sentiment_neutral: number;
  avg_tiempo_respuesta_ms: number;
  max_tiempo_respuesta_ms: number;
  errores: number;
}

async function fetchMetricasCRM(dias: number): Promise<UrobotMetricasCRMData> {
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - dias);
  const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
  
  const hoy = new Date().toISOString().split('T')[0];

  // Query a la tabla de métricas agregadas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: metricas, error } = await (supabase as any)
    .from('urobot_metricas_crm')
    .select('*')
    .gte('fecha', fechaInicioStr)
    .order('fecha', { ascending: true })
    .order('hora_bucket', { ascending: true });

  if (error) {
    console.error('Error fetching metricas CRM:', error);
    return defaultData;
  }

  const rows = (metricas || []) as MetricasRow[];
  
  if (rows.length === 0) {
    return defaultData;
  }

  // ============================================================
  // CALCULAR RESUMEN
  // ============================================================
  
  const totales = rows.reduce((acc, row) => {
    acc.totalMensajes += row.total_mensajes || 0;
    acc.citasAgendadas += row.citas_agendadas || 0;
    acc.citasCanceladas += row.citas_canceladas || 0;
    acc.citasReagendadas += row.citas_reagendadas || 0;
    acc.confirmaciones += row.confirmaciones || 0;
    acc.escalaciones += row.escalaciones || 0;
    acc.errores += row.errores || 0;
    
    // Intenciones
    acc.intentAgendar += row.intent_agendar || 0;
    acc.intentReagendar += row.intent_reagendar || 0;
    acc.intentCancelar += row.intent_cancelar || 0;
    acc.intentConfirmar += row.intent_confirmar || 0;
    acc.intentInformacion += row.intent_informacion || 0;
    acc.intentUrgencia += row.intent_urgencia || 0;
    acc.intentSeguimiento += row.intent_seguimiento || 0;
    acc.intentSaludo += row.intent_saludo || 0;
    acc.intentOtro += row.intent_otro || 0;
    
    // Sentiment
    acc.sentimentPositivo += row.sentiment_positivo || 0;
    acc.sentimentNegativo += row.sentiment_negativo || 0;
    acc.sentimentUrgente += row.sentiment_urgente || 0;
    acc.sentimentNeutral += row.sentiment_neutral || 0;
    
    // Tiempo (promedio ponderado)
    if (row.avg_tiempo_respuesta_ms) {
      acc.tiempoSum += row.avg_tiempo_respuesta_ms * row.total_mensajes;
      acc.tiempoCount += row.total_mensajes;
    }
    
    return acc;
  }, {
    totalMensajes: 0,
    citasAgendadas: 0,
    citasCanceladas: 0,
    citasReagendadas: 0,
    confirmaciones: 0,
    escalaciones: 0,
    errores: 0,
    intentAgendar: 0,
    intentReagendar: 0,
    intentCancelar: 0,
    intentConfirmar: 0,
    intentInformacion: 0,
    intentUrgencia: 0,
    intentSeguimiento: 0,
    intentSaludo: 0,
    intentOtro: 0,
    sentimentPositivo: 0,
    sentimentNegativo: 0,
    sentimentUrgente: 0,
    sentimentNeutral: 0,
    tiempoSum: 0,
    tiempoCount: 0,
  });

  // Métricas de hoy
  const rowsHoy = rows.filter(r => r.fecha === hoy);
  const mensajesHoy = rowsHoy.reduce((sum, r) => sum + (r.total_mensajes || 0), 0);
  const citasHoy = rowsHoy.reduce((sum, r) => sum + (r.citas_agendadas || 0), 0);

  const resumen: MetricasCRMResumen = {
    totalMensajes: totales.totalMensajes,
    mensajesHoy,
    citasAgendadas: totales.citasAgendadas,
    citasAgendadasHoy: citasHoy,
    citasCanceladas: totales.citasCanceladas,
    citasReagendadas: totales.citasReagendadas,
    confirmaciones: totales.confirmaciones,
    escalaciones: totales.escalaciones,
    tasaConversion: totales.intentAgendar > 0 
      ? Math.round((totales.citasAgendadas / totales.intentAgendar) * 100) 
      : 0,
    avgTiempoMs: totales.tiempoCount > 0 
      ? Math.round(totales.tiempoSum / totales.tiempoCount) 
      : 0,
    tasaError: totales.totalMensajes > 0 
      ? Math.round((totales.errores / totales.totalMensajes) * 100 * 10) / 10 
      : 0,
    sentimentPositivo: totales.sentimentPositivo,
    sentimentNegativo: totales.sentimentNegativo,
    sentimentUrgente: totales.sentimentUrgente,
    sentimentNeutral: totales.sentimentNeutral,
    intentAgendar: totales.intentAgendar,
    intentReagendar: totales.intentReagendar,
    intentCancelar: totales.intentCancelar,
    intentConfirmar: totales.intentConfirmar,
    intentInformacion: totales.intentInformacion,
    intentUrgencia: totales.intentUrgencia,
    intentSeguimiento: totales.intentSeguimiento,
    intentSaludo: totales.intentSaludo,
    intentOtro: totales.intentOtro,
  };

  // ============================================================
  // DATOS DIARIOS
  // ============================================================
  
  const porFecha = new Map<string, MetricasCRMDiarias>();
  rows.forEach(row => {
    const existing = porFecha.get(row.fecha) || {
      fecha: row.fecha,
      totalMensajes: 0,
      citasAgendadas: 0,
      citasCanceladas: 0,
      citasReagendadas: 0,
      confirmaciones: 0,
      escalaciones: 0,
      tasaConversionAgendar: 0,
      avgTiempoMs: 0,
      maxTiempoMs: 0,
      errores: 0,
      tasaError: 0,
      pctPositivo: 0,
      pctNegativo: 0,
      pctUrgente: 0,
      _intentAgendar: 0,
      _tiempoSum: 0,
      _tiempoCount: 0,
      _sentPos: 0,
      _sentNeg: 0,
      _sentUrg: 0,
    };
    
    existing.totalMensajes += row.total_mensajes || 0;
    existing.citasAgendadas += row.citas_agendadas || 0;
    existing.citasCanceladas += row.citas_canceladas || 0;
    existing.citasReagendadas += row.citas_reagendadas || 0;
    existing.confirmaciones += row.confirmaciones || 0;
    existing.escalaciones += row.escalaciones || 0;
    existing.errores += row.errores || 0;
    (existing as any)._intentAgendar += row.intent_agendar || 0;
    (existing as any)._sentPos += row.sentiment_positivo || 0;
    (existing as any)._sentNeg += row.sentiment_negativo || 0;
    (existing as any)._sentUrg += row.sentiment_urgente || 0;
    
    if (row.avg_tiempo_respuesta_ms) {
      (existing as any)._tiempoSum += row.avg_tiempo_respuesta_ms * row.total_mensajes;
      (existing as any)._tiempoCount += row.total_mensajes;
    }
    existing.maxTiempoMs = Math.max(existing.maxTiempoMs, row.max_tiempo_respuesta_ms || 0);
    
    porFecha.set(row.fecha, existing);
  });

  const diario: MetricasCRMDiarias[] = Array.from(porFecha.values()).map(d => {
    const e = d as any;
    return {
      ...d,
      tasaConversionAgendar: e._intentAgendar > 0 
        ? Math.round((d.citasAgendadas / e._intentAgendar) * 100) 
        : 0,
      avgTiempoMs: e._tiempoCount > 0 ? Math.round(e._tiempoSum / e._tiempoCount) : 0,
      tasaError: d.totalMensajes > 0 ? Math.round((d.errores / d.totalMensajes) * 100 * 10) / 10 : 0,
      pctPositivo: d.totalMensajes > 0 ? Math.round((e._sentPos / d.totalMensajes) * 100) : 0,
      pctNegativo: d.totalMensajes > 0 ? Math.round((e._sentNeg / d.totalMensajes) * 100) : 0,
      pctUrgente: d.totalMensajes > 0 ? Math.round((e._sentUrg / d.totalMensajes) * 100) : 0,
    };
  });

  // ============================================================
  // ACTIVIDAD POR HORA
  // ============================================================
  
  const porHoraMap = new Map<number, ActividadPorHora>();
  for (let h = 0; h < 24; h++) {
    porHoraMap.set(h, { hora: h, mensajes: 0, agendadas: 0, avgTiempoMs: 0 });
  }
  
  rows.forEach(row => {
    const h = row.hora_bucket;
    const existing = porHoraMap.get(h)!;
    existing.mensajes += row.total_mensajes || 0;
    existing.agendadas += row.citas_agendadas || 0;
  });
  
  const porHora = Array.from(porHoraMap.values());

  // ============================================================
  // DISTRIBUCIÓN DE INTENCIONES
  // ============================================================
  
  const totalIntents = totales.intentAgendar + totales.intentReagendar + 
    totales.intentCancelar + totales.intentConfirmar + totales.intentInformacion +
    totales.intentUrgencia + totales.intentSeguimiento + totales.intentSaludo + totales.intentOtro;

  const intents: IntentDistribucion[] = [
    { intent: 'agendar', cantidad: totales.intentAgendar, porcentaje: 0, icono: INTENT_CONFIG.agendar.icono },
    { intent: 'informacion', cantidad: totales.intentInformacion, porcentaje: 0, icono: INTENT_CONFIG.informacion.icono },
    { intent: 'confirmar', cantidad: totales.intentConfirmar, porcentaje: 0, icono: INTENT_CONFIG.confirmar.icono },
    { intent: 'reagendar', cantidad: totales.intentReagendar, porcentaje: 0, icono: INTENT_CONFIG.reagendar.icono },
    { intent: 'cancelar', cantidad: totales.intentCancelar, porcentaje: 0, icono: INTENT_CONFIG.cancelar.icono },
    { intent: 'urgencia', cantidad: totales.intentUrgencia, porcentaje: 0, icono: INTENT_CONFIG.urgencia.icono },
    { intent: 'seguimiento', cantidad: totales.intentSeguimiento, porcentaje: 0, icono: INTENT_CONFIG.seguimiento.icono },
    { intent: 'saludo', cantidad: totales.intentSaludo, porcentaje: 0, icono: INTENT_CONFIG.saludo.icono },
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
      cantidad: totales.intentAgendar, 
      porcentaje: 100,
      color: FUNNEL_COLORS.intentos 
    },
    { 
      etapa: 'Citas agendadas', 
      cantidad: totales.citasAgendadas, 
      porcentaje: totales.intentAgendar > 0 ? Math.round((totales.citasAgendadas / totales.intentAgendar) * 100) : 0,
      color: FUNNEL_COLORS.agendadas 
    },
    { 
      etapa: 'Confirmaciones', 
      cantidad: totales.confirmaciones, 
      porcentaje: totales.citasAgendadas > 0 ? Math.round((totales.confirmaciones / totales.citasAgendadas) * 100) : 0,
      color: FUNNEL_COLORS.confirmadas 
    },
  ];

  return {
    resumen,
    diario,
    porHora,
    intents,
    funnel,
  };
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
