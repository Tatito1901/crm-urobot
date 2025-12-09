/**
 * ============================================================
 * HOOK: useLeadByTelefono
 * ============================================================
 * Obtiene un lead por su número de teléfono.
 * Útil para integrar acciones de leads en la vista de conversaciones.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { mapLeadFromDB, type Lead, type LeadRow } from '@/types/leads';

const supabase = createClient();

/**
 * Normaliza un número de teléfono para comparación
 * Remueve caracteres no numéricos y maneja formatos con/sin código de país
 */
function normalizarTelefono(telefono: string): string[] {
  // Limpiar a solo números
  const limpio = telefono.replace(/\D/g, '');
  
  // Generar variantes para buscar
  const variantes = new Set<string>();
  
  // Versión limpia
  variantes.add(limpio);
  
  // Si tiene 10 dígitos (México sin código), agregar con +52
  if (limpio.length === 10) {
    variantes.add(`52${limpio}`);
    variantes.add(`+52${limpio}`);
  }
  
  // Si tiene 12 dígitos (52 + 10), agregar sin código
  if (limpio.length === 12 && limpio.startsWith('52')) {
    variantes.add(limpio.slice(2));
  }
  
  // Si tiene 13 dígitos (+52 + 10), agregar sin código
  if (limpio.length === 13 && limpio.startsWith('521')) {
    variantes.add(limpio.slice(3));
    variantes.add(limpio.slice(2)); // Sin el 1
  }
  
  return Array.from(variantes);
}

async function fetchLeadByTelefono(telefono: string): Promise<Lead | null> {
  const variantes = normalizarTelefono(telefono);
  
  // Buscar con cualquiera de las variantes
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .in('telefono_whatsapp', variantes)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Intentar búsqueda con LIKE si no encuentra exacto
    const { data: dataLike, error: errorLike } = await supabase
      .from('leads')
      .select('*')
      .or(variantes.map(v => `telefono_whatsapp.ilike.%${v.slice(-10)}%`).join(','))
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (errorLike || !dataLike) {
      return null;
    }
    
    return mapLeadFromDB(dataLike as LeadRow);
  }

  return mapLeadFromDB(data as LeadRow);
}

interface UseLeadByTelefonoReturn {
  lead: Lead | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<Lead | null | undefined>;
}

export function useLeadByTelefono(telefono: string | null): UseLeadByTelefonoReturn {
  const { data, error, isLoading, mutate } = useSWR(
    telefono ? `lead-by-telefono-${telefono}` : null,
    () => fetchLeadByTelefono(telefono!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 segundos
      errorRetryCount: 2,
    }
  );

  return {
    lead: data ?? null,
    isLoading,
    error: error ?? null,
    refetch: mutate,
  };
}

export default useLeadByTelefono;
