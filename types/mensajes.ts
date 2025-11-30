/**
 * Tipos para el sistema de mensajes/conversaciones de WhatsApp
 */

// Dirección del mensaje
export type DireccionMensaje = 'entrante' | 'saliente';

// Tipo de contenido
export type TipoContenido = 'texto' | 'audio' | 'imagen' | 'documento' | 'ubicacion';

// Quién respondió
export type RespondidoPor = 'urobot' | 'humano';

// Row de la base de datos (snake_case)
export interface MensajeRow {
  id: string;
  telefono: string;
  session_id: string | null;
  direccion: DireccionMensaje;
  contenido: string;
  tipo_contenido: TipoContenido;
  respondido_por: RespondidoPor;
  mensaje_id_whatsapp: string | null;
  media_url: string | null;
  paciente_id: string | null;
  lead_id: string | null;
  created_at: string;
  leido_por_doctor: boolean;
  leido_at: string | null;
}

// Tipo frontend (camelCase)
export interface Mensaje {
  id: string;
  telefono: string;
  sessionId: string | null;
  direccion: DireccionMensaje;
  contenido: string;
  tipoContenido: TipoContenido;
  respondidoPor: RespondidoPor;
  mensajeIdWhatsapp: string | null;
  mediaUrl: string | null;
  pacienteId: string | null;
  leadId: string | null;
  createdAt: Date;
  leidoPorDoctor: boolean;
  leidoAt: Date | null;
}

// Conversación agrupada (para la lista lateral)
export interface Conversacion {
  telefono: string;
  nombreContacto: string | null;  // Del paciente/lead si existe
  ultimoMensaje: string;
  ultimaFecha: Date;
  mensajesNoLeidos: number;
  pacienteId: string | null;
  leadId: string | null;
  tipoContacto: 'paciente' | 'lead' | 'desconocido';
}

// Mapper de DB a Frontend
export function mapMensajeFromDB(row: MensajeRow): Mensaje {
  return {
    id: row.id,
    telefono: row.telefono,
    sessionId: row.session_id,
    direccion: row.direccion,
    contenido: row.contenido,
    tipoContenido: row.tipo_contenido,
    respondidoPor: row.respondido_por,
    mensajeIdWhatsapp: row.mensaje_id_whatsapp,
    mediaUrl: row.media_url,
    pacienteId: row.paciente_id,
    leadId: row.lead_id,
    createdAt: new Date(row.created_at),
    leidoPorDoctor: row.leido_por_doctor,
    leidoAt: row.leido_at ? new Date(row.leido_at) : null,
  };
}

// Estado del hook
export interface ConversacionesState {
  conversaciones: Conversacion[];
  mensajesActivos: Mensaje[];
  telefonoActivo: string | null;
  isLoading: boolean;
  error: Error | null;
}
