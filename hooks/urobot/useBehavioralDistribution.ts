/**
 * ============================================================
 * HOOK: useBehavioralDistribution
 * ============================================================
 * Fetches behavioral profile and conversion prediction distribution
 * from get_behavioral_distribution_stats RPC.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config';

const supabase = createClient();

export interface DistributionItem {
  label: string;
  total: number;
}

export interface BehavioralStats {
  perfiles: DistributionItem[];
  predicciones: DistributionItem[];
  barreras: DistributionItem[];
  total_con_signals: number;
  total_leads: number;
}

const DEFAULT: BehavioralStats = {
  perfiles: [],
  predicciones: [],
  barreras: [],
  total_con_signals: 0,
  total_leads: 0,
};

const fetchBehavioralStats = async (dias: number): Promise<BehavioralStats> => {
  const { data, error } = await supabase.rpc('get_behavioral_distribution_stats' as never, {
    p_dias: dias,
  } as never);

  if (error || !data) return DEFAULT;

  const d = data as Record<string, unknown>;

  const mapItems = (arr: unknown[], keyField: string): DistributionItem[] =>
    (arr as Record<string, unknown>[]).map((item) => ({
      label: (item[keyField] as string) || 'desconocido',
      total: Number(item.total) || 0,
    }));

  return {
    perfiles: mapItems(d.perfiles as unknown[] || [], 'perfil'),
    predicciones: mapItems(d.predicciones as unknown[] || [], 'prediccion'),
    barreras: mapItems(d.barreras as unknown[] || [], 'barrera'),
    total_con_signals: Number(d.total_con_signals) || 0,
    total_leads: Number(d.total_leads) || 0,
  };
};

export function useBehavioralDistribution(dias: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    `behavioral-distribution-${dias}`,
    () => fetchBehavioralStats(dias),
    { ...SWR_CONFIG_STANDARD, dedupingInterval: 5 * 60 * 1000 }
  );

  return {
    stats: data ?? DEFAULT,
    isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
