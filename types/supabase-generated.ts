
> crm-urobot@0.1.0 regenerate-types
> npx supabase gen types typescript --project-id arlgadlbxwysvgtbxvic --schema=public

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
        Relationships: [
          {
            foreignKeyName: "consultas_notas_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_notas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente_stats"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "consultas_notas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
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
          nombre_completo?: string | null
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
          nombre_completo?: string | null
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
          priority: number | null
          reminder_type: string | null
          sent_at: string | null
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
          priority?: number | null
          reminder_type?: string | null
          sent_at?: string | null
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
          priority?: number | null
          reminder_type?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
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
          id: string
          medicamentos: string | null
          nombre_completo: string | null
          notas: string | null
          origen_lead: string | null
          telefono: string
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
          id?: string
          medicamentos?: string | null
          nombre_completo?: string | null
          notas?: string | null
          origen_lead?: string | null
          telefono: string
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
          id?: string
          medicamentos?: string | null
          nombre_completo?: string | null
          notas?: string | null
          origen_lead?: string | null
          telefono?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sedes: {
        Row: {
          anchor_date: string | null
          anchor_week_type: string | null
          calendar_id: string | null
          direccion: string | null
          display_name: string | null
          horario_json: Json | null
          instrucciones_llegada: string | null
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
          instrucciones_llegada?: string | null
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
          instrucciones_llegada?: string | null
          maps_url?: string | null
          sede?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      urobot_alertas: {
        Row: {
          created_at: string | null
          fue_revisada: boolean | null
          id: string
          log_id: string | null
          mensaje: string | null
          notas_revision: string | null
          revisada_at: string | null
          severidad: string | null
          tipo_alerta: string
        }
        Insert: {
          created_at?: string | null
          fue_revisada?: boolean | null
          id?: string
          log_id?: string | null
          mensaje?: string | null
          notas_revision?: string | null
          revisada_at?: string | null
          severidad?: string | null
          tipo_alerta: string
        }
        Update: {
          created_at?: string | null
          fue_revisada?: boolean | null
          id?: string
          log_id?: string | null
          mensaje?: string | null
          notas_revision?: string | null
          revisada_at?: string | null
          severidad?: string | null
          tipo_alerta?: string
        }
        Relationships: [
          {
            foreignKeyName: "urobot_alertas_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "urobot_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "urobot_alertas_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "v_urobot_errores_recientes"
            referencedColumns: ["id"]
          },
        ]
      }
      urobot_logs: {
        Row: {
          created_at: string | null
          detalle_error: string | null
          fue_modificado: boolean | null
          fue_validado: boolean | null
          herramientas_llamadas: Json | null
          id: string
          mensaje_bot: string | null
          mensaje_original_bot: string | null
          mensaje_usuario: string | null
          paso_validacion: boolean | null
          razones_fallo: string[] | null
          requirio_escalacion: boolean | null
          sentiment: string | null
          session_id: string | null
          stack_trace: string | null
          telefono: string | null
          tiempo_respuesta_ms: number | null
          tiene_cita_pendiente: boolean | null
          tiene_error: boolean | null
          tipo_error: string | null
          tipo_interaccion: string | null
          tokens_entrada: number | null
          tokens_salida: number | null
        }
        Insert: {
          created_at?: string | null
          detalle_error?: string | null
          fue_modificado?: boolean | null
          fue_validado?: boolean | null
          herramientas_llamadas?: Json | null
          id?: string
          mensaje_bot?: string | null
          mensaje_original_bot?: string | null
          mensaje_usuario?: string | null
          paso_validacion?: boolean | null
          razones_fallo?: string[] | null
          requirio_escalacion?: boolean | null
          sentiment?: string | null
          session_id?: string | null
          stack_trace?: string | null
          telefono?: string | null
          tiempo_respuesta_ms?: number | null
          tiene_cita_pendiente?: boolean | null
          tiene_error?: boolean | null
          tipo_error?: string | null
          tipo_interaccion?: string | null
          tokens_entrada?: number | null
          tokens_salida?: number | null
        }
        Update: {
          created_at?: string | null
          detalle_error?: string | null
          fue_modificado?: boolean | null
          fue_validado?: boolean | null
          herramientas_llamadas?: Json | null
          id?: string
          mensaje_bot?: string | null
          mensaje_original_bot?: string | null
          mensaje_usuario?: string | null
          paso_validacion?: boolean | null
          razones_fallo?: string[] | null
          requirio_escalacion?: boolean | null
          sentiment?: string | null
          session_id?: string | null
          stack_trace?: string | null
          telefono?: string | null
          tiempo_respuesta_ms?: number | null
          tiene_cita_pendiente?: boolean | null
          tiene_error?: boolean | null
          tipo_error?: string | null
          tipo_interaccion?: string | null
          tokens_entrada?: number | null
          tokens_salida?: number | null
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
      v_urobot_errores_recientes: {
        Row: {
          created_at: string | null
          detalle_error: string | null
          fue_revisada: boolean | null
          herramientas_llamadas: Json | null
          id: string | null
          mensaje_bot_preview: string | null
          mensaje_usuario_preview: string | null
          razones_fallo: string[] | null
          severidad: string | null
          telefono: string | null
          tipo_error: string | null
        }
        Relationships: []
      }
      v_urobot_stats_diarias: {
        Row: {
          escalaciones: number | null
          fallos_validacion: number | null
          fecha: string | null
          intentos_agendar: number | null
          respuestas_modificadas: number | null
          tiempo_promedio_ms: number | null
          total_errores: number | null
          total_mensajes: number | null
          usuarios_unicos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_cancelar_citas_no_confirmadas: {
        Args: { p_horas_antes_max?: number; p_horas_antes_min?: number }
        Returns: {
          accion: string
          consulta_id: string
          fecha_hora: string
          paciente_nombre: string
          telefono: string
        }[]
      }
      buscar_citas_por_telefono: {
        Args: {
          p_incluir_pasadas?: boolean
          p_limite?: number
          p_telefono: string
        }
        Returns: {
          consulta_id: string
          es_futura: boolean
          es_hoy: boolean
          estado_cita: string
          fecha_hora: string
          fecha_hora_mexico: string
          motivo_consulta: string
          paciente_nombre: string
          paciente_telefono: string
          sede: string
          tipo_cita: string
        }[]
      }
      cancelar_citas_sin_confirmar: {
        Args: never
        Returns: {
          canceladas: number
          ids: string[]
        }[]
      }
      cancelar_citas_sin_confirmar_v2: {
        Args: never
        Returns: {
          accion: string
          consulta_id: string
          fecha_hora: string
          paciente_nombre: string
          telefono: string
        }[]
      }
      claim_notification_jobs: {
        Args: { p_limit?: number; p_worker_id?: string }
        Returns: {
          attempt_count: number
          consulta_id: string
          id: string
          message_body: string
          metadata: Json
          phone_number: string
          priority: number
          reminder_type: string
        }[]
      }
      confirmar_cita_con_mensaje: {
        Args: { p_consulta_id: string }
        Returns: {
          calendar_event_id: string
          calendar_id: string
          mensaje: string
          motivo_consulta: string
          paciente_nombre: string
          queue_id: string
          telefono: string
        }[]
      }
      generar_recordatorio_tipo: {
        Args: {
          p_horas_max: number
          p_horas_min: number
          p_tipo_recordatorio: string
        }
        Returns: {
          consultas_procesadas: string[]
          ejecutado_at: string
          insertados: number
          tipo: string
        }[]
      }
      generar_recordatorios_v2: {
        Args: {
          p_horas_max: number
          p_horas_min: number
          p_tipo_recordatorio: string
        }
        Returns: {
          consulta_id: string
          direccion: string
          fecha_hora: string
          maps_url: string
          mensaje: string
          paciente_nombre: string
          sede: string
          sede_display: string
          telefono: string
        }[]
      }
      get_consultas_stats: { Args: never; Returns: Json }
      get_dashboard_metrics: { Args: never; Returns: Json }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_leads_stats: { Args: never; Returns: Json }
      get_pacientes_stats: { Args: never; Returns: Json }
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
      get_recordatorios_status: {
        Args: never
        Returns: {
          detalle: string
          metrica: string
          valor: number
        }[]
      }
      get_urobot_stats: { Args: { p_dias?: number }; Returns: Json }
      guardar_mensaje: {
        Args: { p_mensaje: string; p_rol: string; p_telefono: string }
        Returns: string
      }
      identificar_paciente_por_telefono: {
        Args: { p_telefono: string }
        Returns: {
          calendar_event_id: string
          calendar_id: string
          confirmado_paciente: boolean
          consulta_id: string
          direccion: string
          estado_cita: string
          fecha_hora_inicio: string
          maps_url: string
          motivo_consulta: string
          paciente_id: string
          paciente_nombre: string
          permite_reagendar: boolean
          sede: string
          sede_display: string
        }[]
      }
      insertar_log_urobot: {
        Args: {
          p_detalle_error: string
          p_fue_modificado: boolean
          p_herramientas: Json
          p_mensaje_bot: string
          p_mensaje_original: string
          p_mensaje_usuario: string
          p_paso_validacion: boolean
          p_razones_fallo: string[]
          p_session_id: string
          p_telefono: string
          p_tiempo_ms: number
          p_tiene_cita: boolean
          p_tiene_error: boolean
          p_tipo_error: string
          p_tipo_interaccion: string
        }
        Returns: string
      }
      insertar_respuesta_cola: {
        Args: { p_consulta_id?: string; p_mensaje: string; p_telefono: string }
        Returns: string
      }
      marcar_recordatorio_enviado: {
        Args: { p_consulta_id: string; p_tipo: string }
        Returns: undefined
      }
      mark_notification_failed: {
        Args: { p_error_message?: string; p_notification_id: string }
        Returns: {
          new_status: string
          next_attempt: string
          should_retry: boolean
        }[]
      }
      mark_notification_sent: {
        Args: { p_external_message_id?: string; p_notification_id: string }
        Returns: boolean
      }
      match_documents:
        | {
            Args: { filter: Json; match_count: number; query_embedding: string }
            Returns: {
              content: string
              id: string
              metadata: Json
              similarity: number
            }[]
          }
        | {
            Args: {
              match_count?: number
              match_threshold?: number
              query_embedding: string
            }
            Returns: {
              content: string
              id: string
              metadata: Json
              similarity: number
            }[]
          }
      match_documents_hybrid: {
        Args: {
          keyword_weight?: number
          match_count?: number
          query_embedding: string
          query_text: string
          semantic_weight?: number
        }
        Returns: {
          content: string
          id: string
          match_type: string
          metadata: Json
          similarity: number
        }[]
      }
      normalizar_telefono: { Args: { p_telefono: string }; Returns: string }
      obtener_contexto_urobot: { Args: { p_telefono: string }; Returns: Json }
      obtener_proxima_cita: { Args: { p_telefono: string }; Returns: Json }
      preview_recordatorios_pendientes: {
        Args: never
        Returns: {
          consulta_id: string
          fecha_hora: string
          horas_restantes: number
          paciente_nombre: string
          sede: string
          telefono: string
          tipo_recordatorio_pendiente: string
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
      procesar_recordatorios_batch_v2: {
        Args: {
          p_horas_max: number
          p_horas_min: number
          p_tipo_recordatorio: string
        }
        Returns: {
          insertados: number
          tipo: string
        }[]
      }
      procesar_respuesta_rapida: {
        Args: { p_mensaje: string; p_telefono: string }
        Returns: {
          accion: string
          calendar_event_id: string
          calendar_id: string
          es_accion_rapida: boolean
          respuesta: string
        }[]
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
      registrar_paciente_confirmado: {
        Args: { p_nombre_real: string; p_telefono: string }
        Returns: Json
      }
      release_stale_jobs: {
        Args: { p_stale_minutes?: number }
        Returns: number
      }
      search_leads: {
        Args: {
          p_estado?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
        }
        Returns: {
          data: Json
          total_count: number
        }[]
      }
      search_pacientes: {
        Args: {
          p_estado?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
        }
        Returns: {
          data: Json
          total_count: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
      upsert_lead_interaction:
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
        | {
            Args: {
              p_canal_marketing?: string
              p_contenido?: string
              p_estado?: string
              p_fuente_lead?: string
              p_nombre_completo: string
              p_notas_iniciales?: string
              p_session_id?: string
              p_telefono_whatsapp: string
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
