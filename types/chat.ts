/**
 * ============================================================
 * TIPOS CHAT - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tabla 'conversaciones'
 * Última sync: 2025-12-05
 */

import type { Tables } from './database';

// ============================================================
// TIPO BD
// ============================================================

// Extendemos el tipo generado automáticamente si le faltan campos multimedia
// O lo redefinimos si es necesario para mayor precisión
export interface ConversacionRow {
  id: string;
  telefono: string;
  rol: 'usuario' | 'asistente';
  mensaje: string;
  created_at: string | null;
  
  // Campos multimedia (pueden no estar en types generados antiguos)
  tipo_mensaje: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location' | null;
  media_url: string | null;
  media_mime_type: string | null;
  media_filename: string | null;
  media_caption: string | null;
  media_duration_seconds: number | null;
  media_width: number | null;
  media_height: number | null;
}

// ============================================================
// TIPOS UI
// ============================================================

export type TipoMensaje = NonNullable<ConversacionRow['tipo_mensaje']>;

export interface Mensaje {
  id: string;
  telefono: string;
  contenido: string; // Mapeado de mensaje o media_caption
  rol: 'usuario' | 'asistente';
  createdAt: Date;
  
  // Campos multimedia
  tipoMensaje: TipoMensaje;
  mediaUrl?: string | null;
  mediaMimeType?: string | null;
  mediaFilename?: string | null;
  mediaCaption?: string | null;
  mediaDurationSeconds?: number | null;
  mediaWidth?: number | null;
  mediaHeight?: number | null;
}

export interface ConversacionUI {
  telefono: string;
  nombreContacto: string | null;
  ultimoMensaje: string;
  ultimaFecha: Date;
  mensajesNoLeidos: number;
  tipoContacto: 'paciente' | 'lead' | 'desconocido';
  
  // Metadata enriquecida
  estadoLead: string | null;
  citasValidas: number;
  totalMensajes: number;
}
