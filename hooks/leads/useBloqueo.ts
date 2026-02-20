/**
 * ============================================================
 * HOOK: useBloqueo
 * ============================================================
 * Gestiona el bloqueo/desbloqueo de números de teléfono.
 * Usa las RPCs: check_numero_bloqueado, bloquear_numero, desbloquear_numero
 */

import { useCallback } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { invalidateDomain } from '@/lib/swr-config';

const supabase = createClient();

// ============================================================
// FETCHER
// ============================================================

async function fetchEstaBloqueado(telefono: string): Promise<boolean> {
  // Query the table directly (don't use the RPC which increments counters)
  const limpio = telefono.replace(/\D/g, '');
  const norm = limpio.length === 12 && limpio.startsWith('52')
    ? limpio.slice(2)
    : limpio.length === 13 && limpio.startsWith('521')
      ? limpio.slice(3)
      : limpio.length === 10
        ? limpio
        : limpio;

  const { data, error } = await supabase
    .from('numeros_bloqueados')
    .select('id')
    .eq('telefono_normalizado', norm)
    .eq('activo', true)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}

// ============================================================
// HOOK
// ============================================================

interface UseBloqueoReturn {
  estaBloqueado: boolean;
  isLoading: boolean;
  bloquear: (motivo?: string) => Promise<boolean>;
  desbloquear: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useBloqueo(
  telefono: string | null,
  options?: { nombre?: string; leadId?: string }
): UseBloqueoReturn {
  const { data, isLoading, mutate } = useSWR(
    telefono ? `bloqueo-${telefono}` : null,
    () => fetchEstaBloqueado(telefono!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const bloquear = useCallback(async (motivo?: string): Promise<boolean> => {
    if (!telefono) return false;

    const { data: result, error } = await supabase.rpc('bloquear_numero', {
      p_telefono: telefono,
      p_motivo: motivo || 'Bloqueado desde CRM',
      p_nombre_referencia: options?.nombre || null,
      p_lead_id: options?.leadId || null,
      p_bloqueado_por: 'crm',
    });

    if (error) {
      console.error('[useBloqueo] Error al bloquear:', error);
      return false;
    }

    const res = result as { ok: boolean };
    if (res?.ok) {
      await mutate(true, { revalidate: false });
      await invalidateDomain('leads');
    }
    return res?.ok ?? false;
  }, [telefono, options?.nombre, options?.leadId, mutate]);

  const desbloquear = useCallback(async (): Promise<boolean> => {
    if (!telefono) return false;

    const { data: result, error } = await supabase.rpc('desbloquear_numero', {
      p_telefono: telefono,
    });

    if (error) {
      console.error('[useBloqueo] Error al desbloquear:', error);
      return false;
    }

    const res = result as { ok: boolean };
    if (res?.ok) {
      await mutate(false, { revalidate: false });
      await invalidateDomain('leads');
    }
    return res?.ok ?? false;
  }, [telefono, mutate]);

  const refetch = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    estaBloqueado: data ?? false,
    isLoading,
    bloquear,
    desbloquear,
    refetch,
  };
}
