/**
 * ============================================================
 * HOOK: useLeadConversation
 * ============================================================
 * Obtiene los mensajes de la conversación de un lead por su teléfono.
 * Reutiliza el RPC get_mensajes_por_telefono (mismo que conversaciones).
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import type { Mensaje, TipoMensaje } from '@/types/chat';

const supabase = createClient();

const inferirTipoMensaje = (
  tipo: string | null,
  tipoContenido: string | null,
  mediaUrl: string | null
): TipoMensaje => {
  if (tipo && tipo !== 'text') return tipo as TipoMensaje;
  if (!mediaUrl) return 'text';
  const mime = tipoContenido?.toLowerCase() || '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'document';
};

async function fetchMensajesLead(telefono: string): Promise<Mensaje[]> {
  const { data, error } = await supabase.rpc('get_mensajes_por_telefono' as never, {
    p_telefono: telefono,
    p_limit: 100,
  } as never);

  if (error) throw error;

  const rows = (data || []) as Record<string, unknown>[];
  const mensajesInvalidos = ['undefined', 'Interacción registrada', 'null'];

  return rows
    .filter((row) => {
      const contenido = ((row.contenido as string) || '').trim();
      const tieneMedia = !!row.media_url;
      const esInvalido = mensajesInvalidos.includes(contenido) && !tieneMedia;
      return !esInvalido && (contenido.length > 0 || tieneMedia);
    })
    .map((row): Mensaje => ({
      id: row.id as string,
      conversacionId: row.conversacion_id as string,
      contenido: (row.contenido as string) || '[Archivo adjunto]',
      remitente: (row.remitente as string) || 'usuario',
      tipo: (row.tipo as string) || 'text',
      createdAt: row.created_at ? new Date(row.created_at as string) : new Date(),
      tipoMensaje: inferirTipoMensaje(
        row.tipo as string | null,
        row.tipo_contenido as string | null,
        row.media_url as string | null
      ),
      mediaUrl: row.media_url as string | null,
      tipoContenido: row.tipo_contenido as string | null,
      faseConversacion: (row.fase_conversacion as string) || null,
      accionBot: (row.accion_bot as string) || null,
      esperaRespuesta: row.espera_respuesta as boolean | null,
    }));
}

interface UseLeadConversationReturn {
  mensajes: Mensaje[];
  isLoading: boolean;
  error: Error | null;
  totalMensajes: number;
  refetch: () => void;
}

export function useLeadConversation(telefono: string | null): UseLeadConversationReturn {
  const { data, error, isLoading, mutate } = useSWR(
    telefono ? `lead-conv-${telefono}` : null,
    () => fetchMensajesLead(telefono!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 2,
    }
  );

  return {
    mensajes: data ?? [],
    isLoading,
    error: error ?? null,
    totalMensajes: data?.length ?? 0,
    refetch: () => mutate(),
  };
}
