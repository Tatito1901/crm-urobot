/**
 * ============================================================
 * HOOK: useLeadClinico
 * ============================================================
 * Obtiene datos clínicos de un lead desde la tabla lead_clinico.
 * Incluye síntomas reportados, banderas rojas, zona afectada, etc.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

const supabase = createClient();

type LeadClinico = Tables<'lead_clinico'>;

async function fetchLeadClinico(leadId: string): Promise<LeadClinico | null> {
  const { data, error } = await supabase
    .from('lead_clinico')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

interface UseLeadClinicoReturn {
  clinico: LeadClinico | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useLeadClinico(leadId: string | null): UseLeadClinicoReturn {
  const { data, error, isLoading, mutate } = useSWR(
    leadId ? `lead-clinico-${leadId}` : null,
    () => fetchLeadClinico(leadId!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 2,
    }
  );

  return {
    clinico: data ?? null,
    isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
