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

  // Clasificación de conversación (solo mensajes outbound del bot)
  faseConversacion?: string | null;   // BD: fase_conversacion
  accionBot?: string | null;          // BD: accion_bot
  esperaRespuesta?: boolean | null;   // BD: espera_respuesta
}

// Fases de conversación posibles (generadas por el clasificador híbrido en n8n)
export const FASES_CONVERSACION = [
  'bienvenida', 'descubrimiento', 'horarios_dados', 'oferta_cita',
  'confirmacion', 'precio_dado', 'ubicacion_dada', 'escalamiento',
  'seguimiento', 'conversacion'
] as const;
export type FaseConversacion = (typeof FASES_CONVERSACION)[number];

// Display y colores para badges de fases
export const FASE_DISPLAY: Record<string, { label: string; color: string }> = {
  bienvenida:      { label: 'Bienvenida',    color: 'slate' },
  descubrimiento:  { label: 'Descubrimiento', color: 'blue' },
  horarios_dados:  { label: 'Horarios',       color: 'cyan' },
  oferta_cita:     { label: 'Oferta Cita',    color: 'violet' },
  confirmacion:    { label: 'Confirmación',    color: 'emerald' },
  precio_dado:     { label: 'Precio',          color: 'amber' },
  ubicacion_dada:  { label: 'Ubicación',       color: 'teal' },
  escalamiento:    { label: 'Escalamiento',    color: 'red' },
  seguimiento:     { label: 'Seguimiento',     color: 'indigo' },
  conversacion:    { label: 'Conversación',    color: 'gray' },
};

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
