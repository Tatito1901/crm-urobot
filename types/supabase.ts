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
    PostgrestVersion: "13.0.5"
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
      conversaciones: {
        Row: {
          id: string
          telefono: string
          rol: "usuario" | "asistente"
          mensaje: string
          created_at: string
        }
        Insert: {
          id?: string
          telefono: string
          rol: "usuario" | "asistente"
          mensaje: string
          created_at?: string
        }
        Update: {
          id?: string
          telefono?: string
          rol?: "usuario" | "asistente"
          mensaje?: string
          created_at?: string
        }
        Relationships: []
      }
      consultas: {
        Row: {
          calendar_event_id: string | null
          calendar_link: string | null
          confirmado_paciente: boolean | null
          consulta_id: string | null
          created_at: string | null
          estado_cita: string | null
          estado_confirmacion: string | null
          fecha_hora_fin: string
          fecha_hora_inicio: string
          id: string
          motivo_consulta: string | null
          paciente_id: string | null
          recordatorio_24h_enviado: boolean | null
          recordatorio_2h_enviado: boolean | null
          sede: string | null
          tipo_cita: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          confirmado_paciente?: boolean | null
          consulta_id?: string | null
          created_at?: string | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          fecha_hora_fin: string
          fecha_hora_inicio: string
          id?: string
          motivo_consulta?: string | null
          paciente_id?: string | null
          recordatorio_24h_enviado?: boolean | null
          recordatorio_2h_enviado?: boolean | null
          sede?: string | null
          tipo_cita?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          confirmado_paciente?: boolean | null
          consulta_id?: string | null
          created_at?: string | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          fecha_hora_fin?: string
          fecha_hora_inicio?: string
          id?: string
          motivo_consulta?: string | null
          paciente_id?: string | null
          recordatorio_24h_enviado?: boolean | null
          recordatorio_2h_enviado?: boolean | null
          sede?: string | null
          tipo_cita?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente_stats"
            referencedColumns: ["paciente_id"]
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
        Relationships: [
          {
            foreignKeyName: "destinos_pacientes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente_stats"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "destinos_pacientes_paciente_id_fkey"
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
          created_at: string | null
          estado: string | null
          fecha_conversion: string | null
          fecha_primer_contacto: string | null
          fuente_lead: string | null
          id: string
          nombre_completo: string | null
          notas_iniciales: string | null
          paciente_id: string | null
          session_id: string | null
          telefono_whatsapp: string
          total_interacciones: number | null
          ultima_interaccion: string | null
          updated_at: string | null
        }
        Insert: {
          canal_marketing?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_conversion?: string | null
          fecha_primer_contacto?: string | null
          fuente_lead?: string | null
          id?: string
          notas_iniciales?: string | null
          paciente_id?: string | null
          session_id?: string | null
          telefono_whatsapp: string
          total_interacciones?: number | null
          ultima_interaccion?: string | null
          updated_at?: string | null
        }
        Update: {
          canal_marketing?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_conversion?: string | null
          fecha_primer_contacto?: string | null
          fuente_lead?: string | null
          id?: string
          notas_iniciales?: string | null
          paciente_id?: string | null
          session_id?: string | null
          telefono_whatsapp?: string
          total_interacciones?: number | null
          ultima_interaccion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente_stats"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "leads_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          attempt_count: number | null
          consulta_id: string | null
          created_at: string | null
          error_log: string | null
          id: string
          message_body: string
          metadata: Json | null
          next_attempt_at: string | null
          phone_number: string
          status: Database["public"]["Enums"]["notification_status"] | null
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          consulta_id?: string | null
          created_at?: string | null
          error_log?: string | null
          id?: string
          message_body: string
          metadata?: Json | null
          next_attempt_at?: string | null
          phone_number: string
          status?: Database["public"]["Enums"]["notification_status"] | null
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          consulta_id?: string | null
          created_at?: string | null
          error_log?: string | null
          id?: string
          message_body?: string
          metadata?: Json | null
          next_attempt_at?: string | null
          phone_number?: string
          status?: Database["public"]["Enums"]["notification_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          created_at: string | null
          email: string | null
          estado: string | null
          fecha_nacimiento: string | null
          id: string
          nombre_completo: string | null
          notas: string | null
          origen_lead: string | null
          telefono: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre_completo?: string | null
          notas?: string | null
          origen_lead?: string | null
          telefono: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre_completo?: string | null
          notas?: string | null
          origen_lead?: string | null
          telefono?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reminders_retry_queue: {
        Row: {
          attempt_count: number | null
          consulta_id: string | null
          consulta_id_text: string | null
          created_at: string | null
          error_detail: Json | null
          id: string
          mensaje_body: string | null
          paciente_telefono: string
          reminder_type: string | null
          retry_at: string | null
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          consulta_id?: string | null
          consulta_id_text?: string | null
          created_at?: string | null
          error_detail?: Json | null
          id?: string
          mensaje_body?: string | null
          paciente_telefono: string
          reminder_type?: string | null
          retry_at?: string | null
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          consulta_id?: string | null
          consulta_id_text?: string | null
          created_at?: string | null
          error_detail?: Json | null
          id?: string
          mensaje_body?: string | null
          paciente_telefono?: string
          reminder_type?: string | null
          retry_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_retry_queue_consulta_id_fkey"
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
          calendar_id: string | null
          direccion: string | null
          display_name: string | null
          horario_json: Json | null
          maps_url: string | null
          sede: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          anchor_date?: string | null
          anchor_week_type?: string | null
          calendar_id?: string | null
          direccion?: string | null
          display_name?: string | null
          horario_json?: Json | null
          maps_url?: string | null
          sede: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          anchor_date?: string | null
          anchor_week_type?: string | null
          calendar_id?: string | null
          direccion?: string | null
          display_name?: string | null
          horario_json?: Json | null
          maps_url?: string | null
          sede?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      paciente_stats: {
        Row: {
          consultas_canceladas: number | null
          consultas_completadas: number | null
          consultas_programadas: number | null
          paciente_id: string | null
          total_consultas: number | null
          ultima_consulta: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancelar_citas_sin_confirmar: {
        Args: never
        Returns: {
          canceladas: number
          ids: string[]
        }[]
      }
      get_dashboard_metrics: { Args: never; Returns: Json }
      guardar_mensaje: {
        Args: {
          p_telefono: string
          p_rol: string
          p_mensaje: string
        }
        Returns: string
      }
      obtener_contexto_urobot: {
        Args: {
          p_telefono: string
        }
        Returns: {
          historial_conversacion: string
          tiene_cita_pendiente: boolean
          info_cita: string
          nombre_paciente: string
          es_paciente_conocido: boolean
        }[]
      }
      get_recordatorios_pendientes: {
        Args: { p_fin: string; p_inicio: string; p_tipo: string }
        Returns: {
          consulta_id: string
          fecha_hora_utc: string
          id: string
          paciente_nombre: string
          paciente_telefono: string
          primer_nombre: string
          reminder_type: string
          sede: string
        }[]
      }
      identificar_paciente_por_telefono: {
        Args: { p_telefono: string }
        Returns: {
          consulta_id: string
          estado_actual: string
          fecha_hora_utc: string
          nombre_paciente: string
          paciente_id: string
          sede: string
        }[]
      }
      marcar_recordatorio_enviado: {
        Args: { p_consulta_id: string; p_tipo: string }
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
      procesar_recordatorios_batch: {
        Args: {
          p_tipo: string
          p_ventana_horas_fin: number
          p_ventana_horas_inicio: number
        }
        Returns: number
      }
      reagendar_consulta_atomica: {
        Args: {
          p_consulta_uuid_anterior: string
          p_motivo_reagendamiento: string
          p_nueva_duracion_minutos: number
          p_nueva_fecha_consulta: string
          p_nueva_fecha_hora_utc: string
          p_nueva_hora_consulta: string
          p_nueva_sede: string
          p_nuevo_calendar_event_id: string
          p_nuevo_calendar_link: string
          p_timezone: string
        }
        Returns: Json
      }
      to_mx10: { Args: { input_phone: string }; Returns: string }
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
        Returns: {
          calendar_link: string
          consulta_uuid: string
          error_code: string
          error_message: string
          error_type: string
          idempotency_hash: string
          is_new_consulta: boolean
          is_update_consulta: boolean
          lead_updated: boolean
          message: string
          operation_id: string
          paciente_uuid: string
          success: boolean
        }[]
      }
      upsert_lead_interaction: {
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
      notification_status:
        | "pending"
        | "processing"
        | "sent"
        | "failed"
        | "cancelled"
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
    Enums: {
      notification_status: [
        "pending",
        "processing",
        "sent",
        "failed",
        "cancelled",
      ],
    },
  },
} as const
