/**
 * ============================================================
 * HOOK: useLeadsByCampaign
 * ============================================================
 * Fetches lead distribution by Meta Ads campaign from
 * get_leads_by_campaign_stats RPC.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_STANDARD } from '@/lib/swr-config';

const supabase = createClient();

interface CampaignStat {
  campana: string;
  total_leads: number;
  convertidos: number;
  score_promedio: number;
  calientes: number;
}

interface CampaignStats {
  campaigns: CampaignStat[];
  total_meta_ads: number;
  total_organico: number;
}

const DEFAULT: CampaignStats = { campaigns: [], total_meta_ads: 0, total_organico: 0 };

const fetchCampaignStats = async (dias: number): Promise<CampaignStats> => {
  const { data, error } = await supabase.rpc('get_leads_by_campaign_stats' as never, {
    p_dias: dias,
  } as never);

  if (error || !data) return DEFAULT;

  const d = data as Record<string, unknown>;
  const campaigns = (d.campaigns as Record<string, unknown>[] || []).map(
    (c: Record<string, unknown>): CampaignStat => ({
      campana: (c.campana as string) || 'Desconocido',
      total_leads: Number(c.total_leads) || 0,
      convertidos: Number(c.convertidos) || 0,
      score_promedio: Number(c.score_promedio) || 0,
      calientes: Number(c.calientes) || 0,
    })
  );

  return {
    campaigns,
    total_meta_ads: Number(d.total_meta_ads) || 0,
    total_organico: Number(d.total_organico) || 0,
  };
};

export function useLeadsByCampaign(dias: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    `leads-by-campaign-${dias}`,
    () => fetchCampaignStats(dias),
    { ...SWR_CONFIG_STANDARD, dedupingInterval: 5 * 60 * 1000 }
  );

  return {
    stats: data ?? DEFAULT,
    isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
