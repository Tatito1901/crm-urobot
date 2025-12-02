export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conocimiento_procedimientos_urologia: {
        Row: {
          content: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          tsv: unknown
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          tsv?: unknown
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          tsv?: unknown
        }
        Relationships: []
      }
      consultas: {
        Row: {
          calendar_event_id: string | null
          calendar_link: string | null
          cancelado_por: string | null
          confirmado_paciente: boolean | null
          consulta_id: string | null
          created_at: string | null
          doctoralia_event_id: string | null
          estado_cita: string | null
          estado_confirmacion: string | null
          fecha_hora_fin: string | null
          fecha_hora_inicio: string
          id: string
          motivo_consulta: string | null
          origen: string | null
          paciente_id: string | null
          recordatorio_24h_enviado: boolean | null
          recordatorio_2h_enviado: boolean | null
          recordatorio_48h_enviado: boolean | null
          sede: string | null
          tipo_cita: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          cancelado_por?: string | null
          confirmado_paciente?: boolean | null
          consulta_id?: string | null
          created_at?: string | null
          doctoralia_event_id?: string | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio: string
          id?: string
          motivo_consulta?: string | null
          origen?: string | null
          paciente_id?: string | null
          recordatorio_24h_enviado?: boolean | null
          recordatorio_2h_enviado?: boolean | null
          recordatorio_48h_enviado?: boolean | null
          sede?: string | null
          tipo_cita?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          cancelado_por?: string | null
          confirmado_paciente?: boolean | null
          consulta_id?: string | null
          created_at?: string | null
          doctoralia_event_id?: string | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio?: string
          id?: string
          motivo_consulta?: string | null
          origen?: string | null
          paciente_id?: string | null
          recordatorio_24h_enviado?: boolean | null
          recordatorio_2h_enviado?: boolean | null
          recordatorio_48h_enviado?: boolean | null
          sede?: string | null
          tipo_cita?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      consultas_notas: {
        Row: {
          consulta_id: string | null
          created_at: string | null
          doctoralia_episode_id: string | null
          fecha: string | null
          id: string
          nota: string
          origen: string | null
          paciente_id: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string | null
          doctoralia_episode_id?: string | null
          fecha?: string | null
          id?: string
          nota: string
          origen?: string | null
          paciente_id?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          consulta_id?: string | null
          created_at?: string | null
          doctoralia_episode_id?: string | null
          fecha?: string | null
          id?: string
          nota?: string
          origen?: string | null
          paciente_id?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversaciones: {
        Row: {
          created_at: string | null
          id: string
          media_caption: string | null
          media_duration_seconds: number | null
          media_filename: string | null
          media_height: number | null
          media_mime_type: string | null
          media_url: string | null
          media_width: number | null
          mensaje: string
          rol: string
          telefono: string
          tipo_mensaje: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_caption?: string | null
          media_duration_seconds?: number | null
          media_filename?: string | null
          media_height?: number | null
          media_mime_type?: string | null
          media_url?: string | null
          media_width?: number | null
          mensaje: string
          rol: string
          telefono: string
          tipo_mensaje?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_caption?: string | null
          media_duration_seconds?: number | null
          media_filename?: string | null
          media_height?: number | null
          media_mime_type?: string | null
          media_url?: string | null
          media_width?: number | null
          mensaje?: string
          rol?: string
          telefono?: string
          tipo_mensaje?: string | null
        }
        Relationships: []
      }
      destinos_pacientes: {
        Row: {
          created_at: string | null
          fecha_evento: string | null
          fecha_registro: string | null
          id: string
          moneda: string | null
          monto: number | null
          motivo_alta: string | null
          notas: string | null
          observaciones: string | null
          paciente_id: string
          sede_operacion: string | null
          tipo_cirugia: string | null
          tipo_destino: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fecha_evento?: string | null
          fecha_registro?: string | null
          id?: string
          moneda?: string | null
          monto?: number | null
          motivo_alta?: string | null
          notas?: string | null
          observaciones?: string | null
          paciente_id: string
          sede_operacion?: string | null
          tipo_cirugia?: string | null
          tipo_destino: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fecha_evento?: string | null
          fecha_registro?: string | null
          id?: string
          moneda?: string | null
          monto?: number | null
          motivo_alta?: string | null
          notas?: string | null
          observaciones?: string | null
          paciente_id?: string
          sede_operacion?: string | null
          tipo_cirugia?: string | null
          tipo_destino?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          canal_marketing: string | null
          created_at: string | null
          email: string | null
          estado: string | null
          fecha_conversion: string | null
          fecha_primer_contacto: string | null
          fuente_lead: string | null
          id: string
          lead_id: string | null
          nombre_completo: string | null
          notas: string | null
          paciente_id: string | null
          puntuacion_lead: number | null
          telefono_mx10: string | null
          telefono_whatsapp: string
          temperatura: string | null
          total_mensajes_enviados: number | null
          total_mensajes_recibidos: number | null
          ultima_interaccion: string | null
          updated_at: string | null
        }
        Insert: {
          canal_marketing?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          fecha_conversion?: string | null
          fecha_primer_contacto?: string | null
          fuente_lead?: string | null
          id?: string
          lead_id?: string | null
          nombre_completo?: string | null
          notas?: string | null
          paciente_id?: string | null
          puntuacion_lead?: number | null
          telefono_mx10?: string | null
          telefono_whatsapp: string
          temperatura?: string | null
          total_mensajes_enviados?: number | null
          total_mensajes_recibidos?: number | null
          ultima_interaccion?: string | null
          updated_at?: string | null
        }
        Update: {
          canal_marketing?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          fecha_conversion?: string | null
          fecha_primer_contacto?: string | null
          fuente_lead?: string | null
          id?: string
          lead_id?: string | null
          nombre_completo?: string | null
          notas?: string | null
          paciente_id?: string | null
          puntuacion_lead?: number | null
          telefono_mx10?: string | null
          telefono_whatsapp?: string
          temperatura?: string | null
          total_mensajes_enviados?: number | null
          total_mensajes_recibidos?: number | null
          ultima_interaccion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          alergias: string | null
          antecedentes: string | null
          created_at: string | null
          doctoralia_id: string | null
          email: string | null
          estado: string | null
          fecha_nacimiento: string | null
          fecha_registro: string | null
          fuente_original: string | null
          id: string
          medicamentos: string | null
          nombre_completo: string | null
          notas: string | null
          origen_lead: string | null
          paciente_id: string | null
          telefono: string
          telefono_mx10: string | null
          total_consultas: number | null
          ultima_consulta: string | null
          updated_at: string | null
        }
        Insert: {
          alergias?: string | null
          antecedentes?: string | null
          created_at?: string | null
          doctoralia_id?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          fecha_registro?: string | null
          fuente_original?: string | null
          id?: string
          medicamentos?: string | null
          nombre_completo?: string | null
          notas?: string | null
          origen_lead?: string | null
          paciente_id?: string | null
          telefono: string
          telefono_mx10?: string | null
          total_consultas?: number | null
          ultima_consulta?: string | null
          updated_at?: string | null
        }
        Update: {
          alergias?: string | null
          antecedentes?: string | null
          created_at?: string | null
          doctoralia_id?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          fecha_registro?: string | null
          fuente_original?: string | null
          id?: string
          medicamentos?: string | null
          nombre_completo?: string | null
          notas?: string | null
          origen_lead?: string | null
          paciente_id?: string | null
          telefono?: string
          telefono_mx10?: string | null
          total_consultas?: number | null
          ultima_consulta?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sedes: {
        Row: {
          activa: boolean | null
          created_at: string | null
          direccion: string | null
          horarios_atencion: Json | null
          id: string
          instrucciones_llegada: string | null
          nombre: string | null
          sede: string
          telefono_contacto: string | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          direccion?: string | null
          horarios_atencion?: Json | null
          id?: string
          instrucciones_llegada?: string | null
          nombre?: string | null
          sede: string
          telefono_contacto?: string | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          direccion?: string | null
          horarios_atencion?: Json | null
          id?: string
          instrucciones_llegada?: string | null
          nombre?: string | null
          sede?: string
          telefono_contacto?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      guardar_mensaje: {
        Args: { p_mensaje: string; p_rol: string; p_telefono: string }
        Returns: string
      }
      normalizar_telefono: { Args: { p_telefono: string }; Returns: string }
      obtener_contexto_urobot: { Args: { p_telefono: string }; Returns: Json }
      to_mx10: { Args: { input_phone: string }; Returns: string }
    }
    Enums: {
      notification_status: "pending" | "processing" | "sent" | "failed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  TableName extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Insert: infer I } ? I : never

export type TablesUpdate<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Update: infer U } ? U : never

export type Enums<EnumName extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][EnumName]
