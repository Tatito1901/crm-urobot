export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      conocimiento_procedimientos_urologia_v2: {
        Row: {
          content: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      consultas: {
        Row: {
          calendar_event_id: string | null
          calendar_link: string | null
          canal_origen: string
          cancelado_por: string | null
          confirmado_paciente: boolean
          consulta_id: string
          created_at: string
          duracion_minutos: number
          estado_cita: string
          estado_confirmacion: string
          fecha_cancelacion: string | null
          fecha_confirmacion: string | null
          fecha_consulta: string
          fecha_hora_utc: string
          fecha_limite_confirmacion: string | null
          historial_cambios: Json
          hora_consulta: string
          id: string
          idempotency_key: string | null
          lead_id: string | null
          motivo_cancelacion: string | null
          motivo_consulta: string | null
          paciente_id: string
          rem_24h_enviado: boolean
          rem_3h_enviado: boolean
          rem_48h_enviado: boolean
          rem_confirmacion_inicial_enviado: boolean
          sede: string
          slot_guard: boolean
          timezone: string
          tipo_cita: string
          updated_at: string
        }
        Insert: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          canal_origen?: string
          cancelado_por?: string | null
          confirmado_paciente?: boolean
          consulta_id: string
          created_at?: string
          duracion_minutos?: number
          estado_cita?: string
          estado_confirmacion?: string
          fecha_cancelacion?: string | null
          fecha_confirmacion?: string | null
          fecha_consulta: string
          fecha_hora_utc: string
          fecha_limite_confirmacion?: string | null
          historial_cambios?: Json
          hora_consulta: string
          id?: string
          idempotency_key?: string | null
          lead_id?: string | null
          motivo_cancelacion?: string | null
          motivo_consulta?: string | null
          paciente_id: string
          rem_24h_enviado?: boolean
          rem_3h_enviado?: boolean
          rem_48h_enviado?: boolean
          rem_confirmacion_inicial_enviado?: boolean
          sede: string
          slot_guard?: boolean
          timezone?: string
          tipo_cita?: string
          updated_at?: string
        }
        Update: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          canal_origen?: string
          cancelado_por?: string | null
          confirmado_paciente?: boolean
          consulta_id?: string
          created_at?: string
          duracion_minutos?: number
          estado_cita?: string
          estado_confirmacion?: string
          fecha_cancelacion?: string | null
          fecha_confirmacion?: string | null
          fecha_consulta?: string
          fecha_hora_utc?: string
          fecha_limite_confirmacion?: string | null
          historial_cambios?: Json
          hora_consulta?: string
          id?: string
          idempotency_key?: string | null
          lead_id?: string | null
          motivo_cancelacion?: string | null
          motivo_consulta?: string | null
          paciente_id?: string
          rem_24h_enviado?: boolean
          rem_3h_enviado?: boolean
          rem_48h_enviado?: boolean
          rem_confirmacion_inicial_enviado?: boolean
          sede?: string
          slot_guard?: boolean
          timezone?: string
          tipo_cita?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_sede_fkey"
            columns: ["sede"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["sede"]
          },
        ]
      }
      conversaciones: {
        Row: {
          consulta_id: string | null
          contenido: string
          created_at: string
          es_bot: boolean
          id: string
          intencion: string | null
          keywords: Json | null
          lead_id: string
          mensaje_id: string
          paciente_id: string | null
          sentimiento: string | null
          tiempo_respuesta_segundos: number | null
          timestamp_mensaje: string
          tipo_mensaje: string
        }
        Insert: {
          consulta_id?: string | null
          contenido: string
          created_at?: string
          es_bot?: boolean
          id?: string
          intencion?: string | null
          keywords?: Json | null
          lead_id: string
          mensaje_id: string
          paciente_id?: string | null
          sentimiento?: string | null
          tiempo_respuesta_segundos?: number | null
          timestamp_mensaje?: string
          tipo_mensaje?: string
        }
        Update: {
          consulta_id?: string | null
          contenido?: string
          created_at?: string
          es_bot?: boolean
          id?: string
          intencion?: string | null
          keywords?: Json | null
          lead_id?: string
          mensaje_id?: string
          paciente_id?: string | null
          sentimiento?: string | null
          tiempo_respuesta_segundos?: number | null
          timestamp_mensaje?: string
          tipo_mensaje?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversaciones_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      escalamientos: {
        Row: {
          asignado_a: string | null
          canal: string
          consulta_id: string | null
          conversation_snapshot: string | null
          created_at: string
          estado: string
          id: string
          lead_id: string | null
          motivo: string
          paciente_id: string | null
          prioridad: string
          resuelto_en: string | null
          resuelto_por: string | null
          resumen_contexto: string | null
          telefono_mx10: string | null
          updated_at: string
          whatsapp_message_id: string | null
        }
        Insert: {
          asignado_a?: string | null
          canal?: string
          consulta_id?: string | null
          conversation_snapshot?: string | null
          created_at?: string
          estado?: string
          id?: string
          lead_id?: string | null
          motivo: string
          paciente_id?: string | null
          prioridad?: string
          resuelto_en?: string | null
          resuelto_por?: string | null
          resumen_contexto?: string | null
          telefono_mx10?: string | null
          updated_at?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          asignado_a?: string | null
          canal?: string
          consulta_id?: string | null
          conversation_snapshot?: string | null
          created_at?: string
          estado?: string
          id?: string
          lead_id?: string | null
          motivo?: string
          paciente_id?: string | null
          prioridad?: string
          resuelto_en?: string | null
          resuelto_por?: string | null
          resumen_contexto?: string | null
          telefono_mx10?: string | null
          updated_at?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalamientos_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalamientos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalamientos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          canal_marketing: string | null
          created_at: string
          estado: string
          fecha_conversion: string | null
          fecha_primer_contacto: string
          fuente_lead: string
          id: string
          lead_id: string | null
          nombre_completo: string
          notas_iniciales: string | null
          paciente_id: string | null
          puntuacion_lead: number
          session_id: string | null
          telefono_mx10: string | null
          telefono_whatsapp: string
          temperatura: string
          total_interacciones: number
          total_mensajes_enviados: number
          total_mensajes_recibidos: number
          ultima_interaccion: string
          ultimo_mensaje_id: string | null
          updated_at: string
        }
        Insert: {
          canal_marketing?: string | null
          created_at?: string
          estado?: string
          fecha_conversion?: string | null
          fecha_primer_contacto?: string
          fuente_lead?: string
          id?: string
          lead_id?: string | null
          nombre_completo: string
          notas_iniciales?: string | null
          paciente_id?: string | null
          puntuacion_lead?: number
          session_id?: string | null
          telefono_mx10?: string | null
          telefono_whatsapp: string
          temperatura?: string
          total_interacciones?: number
          total_mensajes_enviados?: number
          total_mensajes_recibidos?: number
          ultima_interaccion?: string
          ultimo_mensaje_id?: string | null
          updated_at?: string
        }
        Update: {
          canal_marketing?: string | null
          created_at?: string
          estado?: string
          fecha_conversion?: string | null
          fecha_primer_contacto?: string
          fuente_lead?: string
          id?: string
          lead_id?: string | null
          nombre_completo?: string
          notas_iniciales?: string | null
          paciente_id?: string | null
          puntuacion_lead?: number
          session_id?: string | null
          telefono_mx10?: string | null
          telefono_whatsapp?: string
          temperatura?: string
          total_interacciones?: number
          total_mensajes_enviados?: number
          total_mensajes_recibidos?: number
          ultima_interaccion?: string
          ultimo_mensaje_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          created_at: string
          email: string | null
          estado: string
          fecha_registro: string
          fuente_original: string
          id: string
          nombre_completo: string
          notas: string | null
          paciente_id: string
          telefono: string
          telefono_mx10: string | null
          total_consultas: number
          ultima_consulta: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          estado?: string
          fecha_registro?: string
          fuente_original?: string
          id?: string
          nombre_completo: string
          notas?: string | null
          paciente_id: string
          telefono: string
          telefono_mx10?: string | null
          total_consultas?: number
          ultima_consulta?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          estado?: string
          fecha_registro?: string
          fuente_original?: string
          id?: string
          nombre_completo?: string
          notas?: string | null
          paciente_id?: string
          telefono?: string
          telefono_mx10?: string | null
          total_consultas?: number
          ultima_consulta?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recordatorios: {
        Row: {
          canal: string
          consulta_id: string
          created_at: string
          dedup_hash: string | null
          entregado: boolean
          enviado_en: string | null
          error_mensaje: string | null
          estado: string
          id: string
          idempotency_key: string | null
          intentos: number
          leido: boolean
          mensaje_enviado: string | null
          plantilla_usada: string | null
          programado_para: string
          recordatorio_id: string | null
          respondido: boolean
          respuesta_texto: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          canal?: string
          consulta_id: string
          created_at?: string
          dedup_hash?: string | null
          entregado?: boolean
          enviado_en?: string | null
          error_mensaje?: string | null
          estado?: string
          id?: string
          idempotency_key?: string | null
          intentos?: number
          leido?: boolean
          mensaje_enviado?: string | null
          plantilla_usada?: string | null
          programado_para: string
          recordatorio_id?: string | null
          respondido?: boolean
          respuesta_texto?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          canal?: string
          consulta_id?: string
          created_at?: string
          dedup_hash?: string | null
          entregado?: boolean
          enviado_en?: string | null
          error_mensaje?: string | null
          estado?: string
          id?: string
          idempotency_key?: string | null
          intentos?: number
          leido?: boolean
          mensaje_enviado?: string | null
          plantilla_usada?: string | null
          programado_para?: string
          recordatorio_id?: string | null
          respondido?: boolean
          respuesta_texto?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordatorios_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
        ]
      }
      sedes: {
        Row: {
          anchor_date: string | null
          anchor_week_type: string | null
          calendar_id: string
          direccion: string | null
          display_name: string | null
          horario_json: Json | null
          maps_url: string | null
          sede: string
          telefono: string | null
          timezone: string
          whatsapp: string | null
        }
        Insert: {
          anchor_date?: string | null
          anchor_week_type?: string | null
          calendar_id: string
          direccion?: string | null
          display_name?: string | null
          horario_json?: Json | null
          maps_url?: string | null
          sede: string
          telefono?: string | null
          timezone?: string
          whatsapp?: string | null
        }
        Update: {
          anchor_date?: string | null
          anchor_week_type?: string | null
          calendar_id?: string
          direccion?: string | null
          display_name?: string | null
          horario_json?: Json | null
          maps_url?: string | null
          sede?: string
          telefono?: string | null
          timezone?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_metricas: {
        Row: {
          calculated_at: string | null
          consultas_futuras: number | null
          consultas_hoy: number | null
          leads_convertidos: number | null
          leads_mes: number | null
          leads_totales: number | null
          pacientes_activos: number | null
          pendientes_confirmacion: number | null
          polanco_futuras: number | null
          satelite_futuras: number | null
          tasa_conversion_pct: number | null
          total_pacientes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      buscar_consulta_para_reagendar: {
        Args: { p_consulta_id?: string; p_telefono?: string }
        Returns: {
          calendar_event_id: string
          consulta_id: string
          created_at: string
          estado: string
          fecha_hora_actual: string
          mensaje_validacion: string
          motivo_consulta: string
          notas: string
          paciente_id: string
          paciente_nombre: string
          paciente_telefono: string
          puede_reagendar: boolean
          sede_actual: string
        }[]
      }
      claim_due_recordatorios: {
        Args: { p_limit?: number }
        Returns: {
          canal: string
          consulta_id: string
          created_at: string
          dedup_hash: string | null
          entregado: boolean
          enviado_en: string | null
          error_mensaje: string | null
          estado: string
          id: string
          idempotency_key: string | null
          intentos: number
          leido: boolean
          mensaje_enviado: string | null
          plantilla_usada: string | null
          programado_para: string
          recordatorio_id: string | null
          respondido: boolean
          respuesta_texto: string | null
          tipo: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "recordatorios"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_dashboard_metrics: { Args: never; Returns: Json }
      mark_recordatorio_enviado: {
        Args: {
          p_entregado?: boolean
          p_leido?: boolean
          p_mensaje?: string
          p_recordatorio_id: string
          p_respondido?: boolean
        }
        Returns: undefined
      }
      match_documents: {
        Args: { filter: Json; match_count: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      refresh_dashboard_metricas: { Args: never; Returns: undefined }
      registrar_mensaje_conversacion: {
        Args: {
          p_contenido: string
          p_es_bot: boolean
          p_intencion?: string
          p_lead_id: string
          p_mensaje_id: string
          p_sentimiento?: string
          p_tipo_mensaje?: string
        }
        Returns: Json
      }
      to_mx10: { Args: { t: string }; Returns: string }
      upsert_appointment_atomic_from_calendar: {
        Args: {
          p_calendar_event_id: string
          p_calendar_link: string
          p_canal_origen?: string
          p_consulta_id: string
          p_duracion_minutos: number
          p_email?: string
          p_event_key?: string
          p_fecha_consulta: string
          p_fecha_hora_utc: string
          p_fuente_original?: string
          p_hora_consulta: string
          p_idempotency_key?: string
          p_lead_telefono_whatsapp?: string
          p_motivo_consulta: string
          p_nombre_completo: string
          p_operation_id: string
          p_paciente_id: string
          p_sede: string
          p_telefono: string
          p_timezone?: string
          p_tipo_cita: string
        }
        Returns: Json
      }
      upsert_lead_interaction:
        | {
            Args: {
              p_estado?: string
              p_fecha_conversion?: string
              p_fuente_lead?: string
              p_message_id?: string
              p_nombre_completo: string
              p_notas_iniciales?: string
              p_paciente_id?: string
              p_session_id?: string
              p_telefono_whatsapp: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_canal_marketing?: string
              p_contenido?: string
              p_es_bot?: boolean
              p_estado?: string
              p_fecha_conversion?: string
              p_fuente_lead?: string
              p_message_id?: string
              p_nombre_completo: string
              p_notas_iniciales?: string
              p_paciente_id?: string
              p_session_id?: string
              p_telefono_whatsapp: string
              p_timestamp_mensaje?: string
              p_tipo_mensaje?: string
            }
            Returns: Json
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
