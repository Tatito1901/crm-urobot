/**
 * ============================================================
 * TIPOS CHAT - SINCRONIZADO CON BD REAL
 * ============================================================
 * Fuente de verdad: Supabase tablas 'conversaciones' + 'mensajes'
 * Última sync: 2026-02-17 (nueva BD whpnvmquoycvsxcmvtac)
 */

import type { Tables } from './database';

// ============================================================
// TIPOS BD (nueva estructura: conversaciones + mensajes)
// ============================================================

// Tabla conversaciones (metadata de la conversación)
export type ConversacionRow = Tables<'conversaciones'>;

// Tabla mensajes (mensajes individuales)
export type MensajeRow = Tables<'mensajes'>;

// ============================================================
// TIPOS UI
// ============================================================

export type TipoMensaje = 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location';

export interface Mensaje {
  id: string;
  conversacionId: string;
  contenido: string;           // BD: contenido
  remitente: string;           // BD: remitente ('usuario' | 'asistente' | 'sistema')
  tipo: string;                // BD: tipo
  createdAt: Date;
  
  // Campos multimedia
  tipoMensaje: TipoMensaje;
  mediaUrl?: string | null;    // BD: media_url
  tipoContenido?: string | null; // BD: tipo_contenido (mime type)
  mediaMimeType?: string | null;
  mediaFilename?: string | null;
  mediaCaption?: string | null;
  mediaDurationSeconds?: number | null;
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
