/**
 * ============================================================
 * HOOK: useDashboardV2 - Dashboard completo en una llamada
 * ============================================================
 * ✅ Una sola RPC get_dashboard_v2() retorna todo
 * ✅ KPIs, acciones pendientes, pipeline, bot metrics, actividad
 * ✅ Cache 30 min con SWR
 */

'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD } from '@/lib/swr-config';
import { parseDashboardV2, defaultKPIs, defaultAcciones, defaultBot, defaultData } from './dashboardV2-parser';
import type { DashboardV2Data } from './dashboardV2-parser';

// Re-export types & parser for consumer convenience
export type { DashboardV2Data } from './dashboardV2-parser';

const supabase = createClient();

// ── Fetcher ──────────────────────────────────────────────────

const fetchDashboardV2 = async (): Promise<DashboardV2Data> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_dashboard_v3');
  if (error) throw error;
  return parseDashboardV2(data);
};

// ── Hook ─────────────────────────────────────────────────────

export function useDashboardV2(initialData?: DashboardV2Data) {
  const { data, error, isLoading, mutate } = useSWR<DashboardV2Data>(
    'dashboard-v2',
    fetchDashboardV2,
    {
      ...SWR_CONFIG_DASHBOARD,
      ...(initialData ? { fallbackData: initialData } : {}),
    }
  );

  const d = data || defaultData;

  // Calcular total de acciones pendientes
  const totalAcciones = d.acciones.escalamientosPendientes
    + d.acciones.leadsCalientesSinCita
    + d.acciones.consultasSinConfirmar
    + d.acciones.mensajesNoLeidos
    + d.acciones.leadsSinRespuesta24h;

  // Calcular tasa de conversión
  const tasaConversion = d.kpis.leadsTotal > 0
    ? Math.round((d.kpis.pacientesTotal / d.kpis.leadsTotal) * 100)
    : 0;

  // Calcular tasa de asistencia
  const totalCitasMes = d.kpis.consultasCompletadasMes + d.kpis.consultasNoAsistioMes;
  const tasaAsistencia = totalCitasMes > 0
    ? Math.round((d.kpis.consultasCompletadasMes / totalCitasMes) * 100)
    : 0;

  // Crecimiento leads MoM
  const leadsCrecimientoMes = d.kpis.leadsMesAnterior > 0
    ? Math.round(((d.kpis.leadsMes - d.kpis.leadsMesAnterior) / d.kpis.leadsMesAnterior) * 100)
    : d.kpis.leadsMes > 0 ? 100 : 0;

  // Crecimiento ingresos MoM
  const ingresosCrecimientoMes = d.kpis.ingresosMesAnterior > 0
    ? Math.round(((d.kpis.ingresosMes - d.kpis.ingresosMesAnterior) / d.kpis.ingresosMesAnterior) * 100)
    : d.kpis.ingresosMes > 0 ? 100 : 0;

  return {
    ...d,
    totalAcciones,
    tasaConversion,
    tasaAsistencia,
    leadsCrecimientoMes,
    ingresosCrecimientoMes,
    loading: isLoading && !initialData,
    error: error ?? null,
    refresh: async () => { await mutate(); },
  };
}
