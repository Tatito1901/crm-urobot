/**
 * ============================================================
 * HOOK: useConversationFunnel
 * ============================================================
 * Fetches conversation funnel stats from get_conversation_funnel_stats RPC.
 * Returns phase distribution, transition rates, and avg messages per phase.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config';

const supabase = createClient();

export interface FunnelPhase {
  fase: string;
  total: number;
  porcentaje: number;
}

export interface FunnelStats {
  fases: FunnelPhase[];
  total_mensajes_clasificados: number;
  total_conversaciones: number;
  tasa_escalamiento: number;
  tasa_confirmacion: number;
}

const DEFAULT_STATS: FunnelStats = {
  fases: [],
  total_mensajes_clasificados: 0,
  total_conversaciones: 0,
  tasa_escalamiento: 0,
  tasa_confirmacion: 0,
};

const fetchFunnelStats = async (dias: number): Promise<FunnelStats> => {
  const { data, error } = await supabase.rpc('get_conversation_funnel_stats' as never, {
    p_dias: dias,
  } as never);

  if (error || !data) return DEFAULT_STATS;

  const d = data as Record<string, unknown>;
  const fases = (d.fases_distribucion as Record<string, unknown>[] || []).map(
    (f: Record<string, unknown>) => ({
      fase: (f.fase as string) || 'desconocido',
      total: Number(f.total) || 0,
      porcentaje: Number(f.porcentaje) || 0,
    })
  );

  return {
    fases,
    total_mensajes_clasificados: Number(d.total_mensajes_clasificados) || 0,
    total_conversaciones: Number(d.total_conversaciones) || 0,
    tasa_escalamiento: Number(d.tasa_escalamiento) || 0,
    tasa_confirmacion: Number(d.tasa_confirmacion) || 0,
  };
};

export function useConversationFunnel(dias: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    `conversation-funnel-${dias}`,
    () => fetchFunnelStats(dias),
    { ...SWR_CONFIG_STANDARD, dedupingInterval: 5 * 60 * 1000 }
  );

  return {
    stats: data ?? DEFAULT_STATS,
    isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
