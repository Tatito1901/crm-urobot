/**
 * ============================================================
 * HOOK: useNumerosBloqueados
 * ============================================================
 * Fetches ALL active blocked numbers in one query.
 * Returns a Set<string> of normalized phone numbers for O(1) lookups.
 * Used at page-level to avoid N individual queries per conversation.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

async function fetchBloqueados(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('numeros_bloqueados')
    .select('telefono_normalizado')
    .eq('activo', true);

  if (error || !data) return new Set();
  return new Set(data.map(r => r.telefono_normalizado));
}

/** Normaliza un teléfono para comparar contra la BD */
export function normalizarTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '');
  if (limpio.length === 12 && limpio.startsWith('52')) return limpio.slice(2);
  if (limpio.length === 13 && limpio.startsWith('521')) return limpio.slice(3);
  return limpio;
}

export function useNumerosBloqueados() {
  const { data, isLoading, mutate } = useSWR(
    'numeros-bloqueados-set',
    fetchBloqueados,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    bloqueados: data ?? new Set<string>(),
    isLoading,
    refetch: () => mutate(),
    /** Check if a specific phone is blocked (O(1)) */
    estaBloqueado: (telefono: string) => {
      if (!data) return false;
      return data.has(normalizarTelefono(telefono));
    },
  };
}
