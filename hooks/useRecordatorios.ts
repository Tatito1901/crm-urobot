/**
 * ============================================================
 * HOOK: useRecordatorios (Notificaciones)
 * ============================================================
 * Usa la tabla 'notification_queue' que es la fuente real.
 * Los recordatorios son procesados por n8n via funciones RPC.
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_READONLY } from '@/lib/swr-config';
import {
  type RecordatorioDetalle,
  mapNotificacionFromDB,
} from '@/types/recordatorios';

const supabase = createClient();

interface UseRecordatoriosReturn {
  recordatorios: RecordatorioDetalle[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Fetcher para notificaciones desde notification_queue
 */
const fetchRecordatorios = async (): Promise<RecordatorioDetalle[]> => {
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  const { data, error: fetchError } = await supabase
    .from('notification_queue')
    .select('*')
    .gte('created_at', hace7Dias.toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  if (fetchError) throw fetchError;
  if (!data) return [];

  return data.map((row) => mapNotificacionFromDB(row));
};

/**
 * Hook para obtener notificaciones/recordatorios
 * Lee desde notification_queue (tabla real en BD)
 */
export function useRecordatorios(): UseRecordatoriosReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'notification_queue',
    fetchRecordatorios,
    SWR_CONFIG_READONLY
  );

  return {
    recordatorios: data || [],
    loading: isLoading,
    error: error || null,
    refresh: async () => { await mutate(); },
  };
}
