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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
