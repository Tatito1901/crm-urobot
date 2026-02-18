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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analisis_mensajes_v2: {
        Row: {
          conversacion_id: string | null
          created_at: string | null
          emocion_detectada: string | null
          entidades_detectadas: Json | null
          estrategia_bot: string | null
          id: string
          intencion_detectada: string | null
          lead_id: string | null
          mensaje_id: string | null
          metadata: Json | null
          role: string | null
          score_urgencia: number | null
        }
        Insert: {
          conversacion_id?: string | null
          created_at?: string | null
          emocion_detectada?: string | null
          entidades_detectadas?: Json | null
          estrategia_bot?: string | null
          id?: string
          intencion_detectada?: string | null
          lead_id?: string | null
          mensaje_id?: string | null
          metadata?: Json | null
          role?: string | null
          score_urgencia?: number | null
        }
        Update: {
          conversacion_id?: string | null
          created_at?: string | null
          emocion_detectada?: string | null
          entidades_detectadas?: Json | null
          estrategia_bot?: string | null
          id?: string
          intencion_detectada?: string | null
          lead_id?: string | null
          mensaje_id?: string | null
          metadata?: Json | null
          role?: string | null
          score_urgencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analisis_mensajes_v2_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_mensajes_v2_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_mensajes_v2_mensaje_id_fkey"
            columns: ["mensaje_id"]
            isOneToOne: false
            referencedRelation: "mensajes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          conversacion_id: string | null
          created_at: string | null
          datos_antes: Json | null
          datos_despues: Json | null
          entidad: string | null
          entidad_id: string | null
          error_message: string | null
          evento: string
          id: string
          ip_address: string | null
          lead_id: string | null
          n8n_execution_id: string | null
          n8n_node_name: string | null
          telefono: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          conversacion_id?: string | null
          created_at?: string | null
          datos_antes?: Json | null
          datos_despues?: Json | null
          entidad?: string | null
          entidad_id?: string | null
          error_message?: string | null
          evento: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          n8n_execution_id?: string | null
          n8n_node_name?: string | null
          telefono?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          conversacion_id?: string | null
          created_at?: string | null
          datos_antes?: Json | null
          datos_despues?: Json | null
          entidad?: string | null
          entidad_id?: string | null
          error_message?: string | null
          evento?: string
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          n8n_execution_id?: string | null
          n8n_node_name?: string | null
          telefono?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      bot_executions: {
        Row: {
          completado_at: string | null
          conversacion_id: string | null
          duracion_ms: number | null
          error_mensaje: string | null
          estado: string | null
          estrategia: string | null
          funnel_stage: string | null
          hash_integridad: string | null
          id: string
          iniciado_at: string | null
          ip_origen: string | null
          lead_id: string | null
          mensaje_entrada: string | null
          mensaje_entrada_id: string | null
          mensaje_guardado_at: string | null
          mensaje_salida: string | null
          mensaje_salida_id: string | null
          metadata: Json | null
          modelo_ia: string | null
          n8n_execution_id: string | null
          respuesta_generada_at: string | null
          telefono: string
          tokens_entrada: number | null
          tokens_salida: number | null
          version_bot: string | null
          wamid_entrada: string | null
          wamid_salida: string | null
          webhook_timestamp: string | null
        }
        Insert: {
          completado_at?: string | null
          conversacion_id?: string | null
          duracion_ms?: number | null
          error_mensaje?: string | null
          estado?: string | null
          estrategia?: string | null
          funnel_stage?: string | null
          hash_integridad?: string | null
          id?: string
          iniciado_at?: string | null
          ip_origen?: string | null
          lead_id?: string | null
          mensaje_entrada?: string | null
          mensaje_entrada_id?: string | null
          mensaje_guardado_at?: string | null
          mensaje_salida?: string | null
          mensaje_salida_id?: string | null
          metadata?: Json | null
          modelo_ia?: string | null
          n8n_execution_id?: string | null
          respuesta_generada_at?: string | null
          telefono: string
          tokens_entrada?: number | null
          tokens_salida?: number | null
          version_bot?: string | null
          wamid_entrada?: string | null
          wamid_salida?: string | null
          webhook_timestamp?: string | null
        }
        Update: {
          completado_at?: string | null
          conversacion_id?: string | null
          duracion_ms?: number | null
          error_mensaje?: string | null
          estado?: string | null
          estrategia?: string | null
          funnel_stage?: string | null
          hash_integridad?: string | null
          id?: string
          iniciado_at?: string | null
          ip_origen?: string | null
          lead_id?: string | null
          mensaje_entrada?: string | null
          mensaje_entrada_id?: string | null
          mensaje_guardado_at?: string | null
          mensaje_salida?: string | null
          mensaje_salida_id?: string | null
          metadata?: Json | null
          modelo_ia?: string | null
          n8n_execution_id?: string | null
          respuesta_generada_at?: string | null
          telefono?: string
          tokens_entrada?: number | null
          tokens_salida?: number | null
          version_bot?: string | null
          wamid_entrada?: string | null
          wamid_salida?: string | null
          webhook_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_executions_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_executions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_executions_mensaje_entrada_id_fkey"
            columns: ["mensaje_entrada_id"]
            isOneToOne: false
            referencedRelation: "mensajes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_executions_mensaje_salida_id_fkey"
            columns: ["mensaje_salida_id"]
            isOneToOne: false
            referencedRelation: "mensajes"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_rate_limits: {
        Row: {
          count: number | null
          id: string
          telefono: string
          tipo: string | null
          window_start: string | null
        }
        Insert: {
          count?: number | null
          id?: string
          telefono: string
          tipo?: string | null
          window_start?: string | null
        }
        Update: {
          count?: number | null
          id?: string
          telefono?: string
          tipo?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      catalog_estados_lead: {
        Row: {
          activo: boolean | null
          aliases: string[] | null
          es_terminal: boolean | null
          id: string
          nombre_display: string
          orden: number | null
          transiciones_permitidas: string[] | null
        }
        Insert: {
          activo?: boolean | null
          aliases?: string[] | null
          es_terminal?: boolean | null
          id: string
          nombre_display: string
          orden?: number | null
          transiciones_permitidas?: string[] | null
        }
        Update: {
          activo?: boolean | null
          aliases?: string[] | null
          es_terminal?: boolean | null
          id?: string
          nombre_display?: string
          orden?: number | null
          transiciones_permitidas?: string[] | null
        }
        Relationships: []
      }
      catalog_fuentes: {
        Row: {
          activo: boolean | null
          aliases: string[] | null
          id: string
          nombre_display: string
          orden: number | null
        }
        Insert: {
          activo?: boolean | null
          aliases?: string[] | null
          id: string
          nombre_display: string
          orden?: number | null
        }
        Update: {
          activo?: boolean | null
          aliases?: string[] | null
          id?: string
          nombre_display?: string
          orden?: number | null
        }
        Relationships: []
      }
      catalog_funnel_etapas: {
        Row: {
          activo: boolean | null
          descripcion: string | null
          id: string
          indicadores_deteccion: string[] | null
          metricas_clave: string[] | null
          nombre_display: string
          orden: number | null
        }
        Insert: {
          activo?: boolean | null
          descripcion?: string | null
          id: string
          indicadores_deteccion?: string[] | null
          metricas_clave?: string[] | null
          nombre_display: string
          orden?: number | null
        }
        Update: {
          activo?: boolean | null
          descripcion?: string | null
          id?: string
          indicadores_deteccion?: string[] | null
          metricas_clave?: string[] | null
          nombre_display?: string
          orden?: number | null
        }
        Relationships: []
      }
      catalog_temperaturas: {
        Row: {
          activo: boolean | null
          aliases: string[] | null
          id: string
          nombre_display: string
          orden: number | null
        }
        Insert: {
          activo?: boolean | null
          aliases?: string[] | null
          id: string
          nombre_display: string
          orden?: number | null
        }
        Update: {
          activo?: boolean | null
          aliases?: string[] | null
          id?: string
          nombre_display?: string
          orden?: number | null
        }
        Relationships: []
      }
      consultas: {
        Row: {
          calendar_event_id: string | null
          calendar_link: string | null
          cancelado_por: string | null
          cita_reagendada_id: string | null
          comentarios_admin: string | null
          confirmado_paciente: boolean | null
          consulta_id: string | null
          created_at: string | null
          diagnostico_principal: string | null
          doctoralia_event_id: string | null
          duracion_minutos: number | null
          estado_cita: string | null
          estado_confirmacion: string | null
          fecha_hora_fin: string | null
          fecha_hora_inicio: string
          fecha_pago: string | null
          folio_anual: number | null
          hora_fin_consulta: string | null
          hora_inicio_consulta: string | null
          hora_llegada: string | null
          id: string
          lead_id: string | null
          metodo_pago: string | null
          motivo_cancelacion: string | null
          motivo_consulta: string | null
          notas_agenda: string | null
          origen: string | null
          paciente_id: string | null
          pagado: boolean | null
          precio: number | null
          recordatorio_24h_enviado: boolean | null
          recordatorio_2h_enviado: boolean | null
          recordatorio_48h_enviado: boolean | null
          renta_consultorio: number | null
          sede_id: string | null
          sync_calendar: boolean | null
          sync_calendar_at: string | null
          sync_calendar_error: string | null
          tipo_cita: string | null
          total_neto: number | null
          updated_at: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          cancelado_por?: string | null
          cita_reagendada_id?: string | null
          comentarios_admin?: string | null
          confirmado_paciente?: boolean | null
          consulta_id?: string | null
          created_at?: string | null
          diagnostico_principal?: string | null
          doctoralia_event_id?: string | null
          duracion_minutos?: number | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio: string
          fecha_pago?: string | null
          folio_anual?: number | null
          hora_fin_consulta?: string | null
          hora_inicio_consulta?: string | null
          hora_llegada?: string | null
          id?: string
          lead_id?: string | null
          metodo_pago?: string | null
          motivo_cancelacion?: string | null
          motivo_consulta?: string | null
          notas_agenda?: string | null
          origen?: string | null
          paciente_id?: string | null
          pagado?: boolean | null
          precio?: number | null
          recordatorio_24h_enviado?: boolean | null
          recordatorio_2h_enviado?: boolean | null
          recordatorio_48h_enviado?: boolean | null
          renta_consultorio?: number | null
          sede_id?: string | null
          sync_calendar?: boolean | null
          sync_calendar_at?: string | null
          sync_calendar_error?: string | null
          tipo_cita?: string | null
          total_neto?: number | null
          updated_at?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          calendar_link?: string | null
          cancelado_por?: string | null
          cita_reagendada_id?: string | null
          comentarios_admin?: string | null
          confirmado_paciente?: boolean | null
          consulta_id?: string | null
          created_at?: string | null
          diagnostico_principal?: string | null
          doctoralia_event_id?: string | null
          duracion_minutos?: number | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio?: string
          fecha_pago?: string | null
          folio_anual?: number | null
          hora_fin_consulta?: string | null
          hora_inicio_consulta?: string | null
          hora_llegada?: string | null
          id?: string
          lead_id?: string | null
          metodo_pago?: string | null
          motivo_cancelacion?: string | null
          motivo_consulta?: string | null
          notas_agenda?: string | null
          origen?: string | null
          paciente_id?: string | null
          pagado?: boolean | null
          precio?: number | null
          recordatorio_24h_enviado?: boolean | null
          recordatorio_2h_enviado?: boolean | null
          recordatorio_48h_enviado?: boolean | null
          renta_consultorio?: number | null
          sede_id?: string | null
          sync_calendar?: boolean | null
          sync_calendar_at?: string | null
          sync_calendar_error?: string | null
          tipo_cita?: string | null
          total_neto?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_cita_reagendada_id_fkey"
            columns: ["cita_reagendada_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "consultas_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "sedes"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas_notas: {
        Row: {
          consulta_id: string | null
          created_at: string | null
          diagnosticos: string[] | null
          dias_proximo_seguimiento: number | null
          doctoralia_episode_id: string | null
          estado: string | null
          exploracion_fisica: string | null
          fecha: string | null
          frecuencia_cardiaca: number | null
          frecuencia_respiratoria: number | null
          id: string
          imc: number | null
          nota: string
          origen: string | null
          paciente_id: string | null
          padecimiento_actual: string | null
          peso_kg: number | null
          plan_tratamiento: string | null
          presion_diastolica: number | null
          presion_sistolica: number | null
          requiere_seguimiento: boolean | null
          saturacion_oxigeno: number | null
          sintomas: string[] | null
          talla_cm: number | null
          temperatura: number | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string | null
          diagnosticos?: string[] | null
          dias_proximo_seguimiento?: number | null
          doctoralia_episode_id?: string | null
          estado?: string | null
          exploracion_fisica?: string | null
          fecha?: string | null
          frecuencia_cardiaca?: number | null
          frecuencia_respiratoria?: number | null
          id?: string
          imc?: number | null
          nota: string
          origen?: string | null
          paciente_id?: string | null
          padecimiento_actual?: string | null
          peso_kg?: number | null
          plan_tratamiento?: string | null
          presion_diastolica?: number | null
          presion_sistolica?: number | null
          requiere_seguimiento?: boolean | null
          saturacion_oxigeno?: number | null
          sintomas?: string[] | null
          talla_cm?: number | null
          temperatura?: number | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          consulta_id?: string | null
          created_at?: string | null
          diagnosticos?: string[] | null
          dias_proximo_seguimiento?: number | null
          doctoralia_episode_id?: string | null
          estado?: string | null
          exploracion_fisica?: string | null
          fecha?: string | null
          frecuencia_cardiaca?: number | null
          frecuencia_respiratoria?: number | null
          id?: string
          imc?: number | null
          nota?: string
          origen?: string | null
          paciente_id?: string | null
          padecimiento_actual?: string | null
          peso_kg?: number | null
          plan_tratamiento?: string | null
          presion_diastolica?: number | null
          presion_sistolica?: number | null
          requiere_seguimiento?: boolean | null
          saturacion_oxigeno?: number | null
          sintomas?: string[] | null
          talla_cm?: number | null
          temperatura?: number | null
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
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversaciones: {
        Row: {
          asignado_a: string | null
          created_at: string
          dias_activo: number | null
          estado: string
          etiquetas: string[] | null
          external_chat_id: string | null
          followups_enviados: number | null
          horario_preferido: string | null
          id: string
          lead_id: string
          mensajes_no_leidos: number | null
          metadata: Json | null
          nombre_contacto: string | null
          paciente_id: string | null
          plataforma: string | null
          primer_mensaje_at: string | null
          primera_respuesta_at: string | null
          prioridad: string | null
          promedio_tiempo_respuesta_segundos: number | null
          resuelto_at: string | null
          telefono: string
          tiempo_primera_respuesta_segundos: number | null
          total_mensajes_bot: number | null
          total_mensajes_usuario: number | null
          ultimo_followup_at: string | null
          ultimo_mensaje_at: string | null
          ultimo_mensaje_preview: string | null
          updated_at: string
          whatsapp_link: string | null
        }
        Insert: {
          asignado_a?: string | null
          created_at?: string
          dias_activo?: number | null
          estado?: string
          etiquetas?: string[] | null
          external_chat_id?: string | null
          followups_enviados?: number | null
          horario_preferido?: string | null
          id?: string
          lead_id: string
          mensajes_no_leidos?: number | null
          metadata?: Json | null
          nombre_contacto?: string | null
          paciente_id?: string | null
          plataforma?: string | null
          primer_mensaje_at?: string | null
          primera_respuesta_at?: string | null
          prioridad?: string | null
          promedio_tiempo_respuesta_segundos?: number | null
          resuelto_at?: string | null
          telefono: string
          tiempo_primera_respuesta_segundos?: number | null
          total_mensajes_bot?: number | null
          total_mensajes_usuario?: number | null
          ultimo_followup_at?: string | null
          ultimo_mensaje_at?: string | null
          ultimo_mensaje_preview?: string | null
          updated_at?: string
          whatsapp_link?: string | null
        }
        Update: {
          asignado_a?: string | null
          created_at?: string
          dias_activo?: number | null
          estado?: string
          etiquetas?: string[] | null
          external_chat_id?: string | null
          followups_enviados?: number | null
          horario_preferido?: string | null
          id?: string
          lead_id?: string
          mensajes_no_leidos?: number | null
          metadata?: Json | null
          nombre_contacto?: string | null
          paciente_id?: string | null
          plataforma?: string | null
          primer_mensaje_at?: string | null
          primera_respuesta_at?: string | null
          prioridad?: string | null
          promedio_tiempo_respuesta_segundos?: number | null
          resuelto_at?: string | null
          telefono?: string
          tiempo_primera_respuesta_segundos?: number | null
          total_mensajes_bot?: number | null
          total_mensajes_usuario?: number | null
          ultimo_followup_at?: string | null
          ultimo_mensaje_at?: string | null
          ultimo_mensaje_preview?: string | null
          updated_at?: string
          whatsapp_link?: string | null
        }
        Relationships: [
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
      debounce_whatsapp: {
        Row: {
          created_at: string | null
          mensaje_id: string
          telefono: string
        }
        Insert: {
          created_at?: string | null
          mensaje_id: string
          telefono: string
        }
        Update: {
          created_at?: string | null
          mensaje_id?: string
          telefono?: string
        }
        Relationships: []
      }
      destinos_pacientes: {
        Row: {
          created_at: string | null
          estado: string | null
          fecha_programada: string | null
          id: string
          monto: number | null
          notas: string | null
          paciente_id: string | null
          tipo_cirugia: string | null
          tipo_destino: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          fecha_programada?: string | null
          id?: string
          monto?: number | null
          notas?: string | null
          paciente_id?: string | null
          tipo_cirugia?: string | null
          tipo_destino?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          fecha_programada?: string | null
          id?: string
          monto?: number | null
          notas?: string | null
          paciente_id?: string | null
          tipo_cirugia?: string | null
          tipo_destino?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinos_pacientes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      escalamientos: {
        Row: {
          antecedentes: string | null
          aseguradora: string | null
          cita_agendada: boolean | null
          cita_agendada_at: string | null
          cita_id: string | null
          created_at: string
          es_urgente: boolean | null
          id: string
          interes: string | null
          lead_id: string
          mensaje_enviado: boolean | null
          mensaje_enviado_at: string | null
          nombre: string
          notas: string | null
          notificado_at: string | null
          opt_in_confirmado: boolean | null
          pregunto_precio_cirugia: boolean | null
          red_flags: string | null
          resultado: string
          resumen: string | null
          sintomas_principales: string | null
          telefono: string
          temperatura: string | null
          tiempo_sintomas: string | null
          tiene_seguro: boolean | null
          updated_at: string
        }
        Insert: {
          antecedentes?: string | null
          aseguradora?: string | null
          cita_agendada?: boolean | null
          cita_agendada_at?: string | null
          cita_id?: string | null
          created_at?: string
          es_urgente?: boolean | null
          id?: string
          interes?: string | null
          lead_id: string
          mensaje_enviado?: boolean | null
          mensaje_enviado_at?: string | null
          nombre: string
          notas?: string | null
          notificado_at?: string | null
          opt_in_confirmado?: boolean | null
          pregunto_precio_cirugia?: boolean | null
          red_flags?: string | null
          resultado?: string
          resumen?: string | null
          sintomas_principales?: string | null
          telefono: string
          temperatura?: string | null
          tiempo_sintomas?: string | null
          tiene_seguro?: boolean | null
          updated_at?: string
        }
        Update: {
          antecedentes?: string | null
          aseguradora?: string | null
          cita_agendada?: boolean | null
          cita_agendada_at?: string | null
          cita_id?: string | null
          created_at?: string
          es_urgente?: boolean | null
          id?: string
          interes?: string | null
          lead_id?: string
          mensaje_enviado?: boolean | null
          mensaje_enviado_at?: string | null
          nombre?: string
          notas?: string | null
          notificado_at?: string | null
          opt_in_confirmado?: boolean | null
          pregunto_precio_cirugia?: boolean | null
          red_flags?: string | null
          resultado?: string
          resumen?: string | null
          sintomas_principales?: string | null
          telefono?: string
          temperatura?: string | null
          tiempo_sintomas?: string | null
          tiene_seguro?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalamientos_cita_id_fkey"
            columns: ["cita_id"]
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
        ]
      }
      followups: {
        Row: {
          ai_modelo: string | null
          ai_raw_response: string | null
          calificacion: string | null
          ciudad_inferida: string | null
          conversacion_id: string
          created_at: string | null
          diagnostico: string | null
          enviado_at: string | null
          fase_conversacion: string | null
          id: string
          lead_id: string | null
          llevo_a_cita: boolean | null
          mensaje_enviado: string | null
          mensaje_id: string | null
          nombre: string | null
          prioridad: number | null
          reactivado_at: string | null
          resultado: string | null
          score_total: number | null
          skip_reason: string | null
          telefono: string
          tiempo_respuesta_min: number | null
          tier: number
          ultimo_msg_bot: string | null
          ultimo_msg_usuario: string | null
        }
        Insert: {
          ai_modelo?: string | null
          ai_raw_response?: string | null
          calificacion?: string | null
          ciudad_inferida?: string | null
          conversacion_id: string
          created_at?: string | null
          diagnostico?: string | null
          enviado_at?: string | null
          fase_conversacion?: string | null
          id?: string
          lead_id?: string | null
          llevo_a_cita?: boolean | null
          mensaje_enviado?: string | null
          mensaje_id?: string | null
          nombre?: string | null
          prioridad?: number | null
          reactivado_at?: string | null
          resultado?: string | null
          score_total?: number | null
          skip_reason?: string | null
          telefono: string
          tiempo_respuesta_min?: number | null
          tier?: number
          ultimo_msg_bot?: string | null
          ultimo_msg_usuario?: string | null
        }
        Update: {
          ai_modelo?: string | null
          ai_raw_response?: string | null
          calificacion?: string | null
          ciudad_inferida?: string | null
          conversacion_id?: string
          created_at?: string | null
          diagnostico?: string | null
          enviado_at?: string | null
          fase_conversacion?: string | null
          id?: string
          lead_id?: string | null
          llevo_a_cita?: boolean | null
          mensaje_enviado?: string | null
          mensaje_id?: string | null
          nombre?: string | null
          prioridad?: number | null
          reactivado_at?: string | null
          resultado?: string | null
          score_total?: number | null
          skip_reason?: string | null
          telefono?: string
          tiempo_respuesta_min?: number | null
          tier?: number
          ultimo_msg_bot?: string | null
          ultimo_msg_usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_mensaje_id_fkey"
            columns: ["mensaje_id"]
            isOneToOne: false
            referencedRelation: "mensajes"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_clinico: {
        Row: {
          contenido: string | null
          created_at: string | null
          external_episode_id: string | null
          fecha: string | null
          id: string
          paciente_id: string | null
          tipo: string | null
          titulo: string | null
        }
        Insert: {
          contenido?: string | null
          created_at?: string | null
          external_episode_id?: string | null
          fecha?: string | null
          id?: string
          paciente_id?: string | null
          tipo?: string | null
          titulo?: string | null
        }
        Update: {
          contenido?: string | null
          created_at?: string | null
          external_episode_id?: string | null
          fecha?: string | null
          id?: string
          paciente_id?: string | null
          tipo?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_clinico_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_documents: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          document_name: string
          document_type: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          subcategory: string | null
          tags: string[] | null
          tsv: unknown
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          document_name: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          tsv?: unknown
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          document_name?: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          tsv?: unknown
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_clinico: {
        Row: {
          banderas_rojas: string[] | null
          es_urgencia_medica: boolean | null
          id: string
          lead_id: string
          resumen_caso: string | null
          sintomas_reportados: string[] | null
          tiempo_evolucion: string | null
          updated_at: string
          zona_afectada: string | null
        }
        Insert: {
          banderas_rojas?: string[] | null
          es_urgencia_medica?: boolean | null
          id?: string
          lead_id: string
          resumen_caso?: string | null
          sintomas_reportados?: string[] | null
          tiempo_evolucion?: string | null
          updated_at?: string
          zona_afectada?: string | null
        }
        Update: {
          banderas_rojas?: string[] | null
          es_urgencia_medica?: boolean | null
          id?: string
          lead_id?: string
          resumen_caso?: string | null
          sintomas_reportados?: string[] | null
          tiempo_evolucion?: string | null
          updated_at?: string
          zona_afectada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_clinico_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_eventos: {
        Row: {
          conversacion_id: string | null
          created_at: string
          datos: Json | null
          id: string
          lead_id: string | null
          tipo_evento: string
        }
        Insert: {
          conversacion_id?: string | null
          created_at?: string
          datos?: Json | null
          id?: string
          lead_id?: string | null
          tipo_evento: string
        }
        Update: {
          conversacion_id?: string | null
          created_at?: string
          datos?: Json | null
          id?: string
          lead_id?: string | null
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_eventos_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_eventos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_funnel_stages: {
        Row: {
          created_at: string | null
          etapa_anterior: string | null
          etapa_nueva: string
          id: string
          indicador: string | null
          lead_id: string
          metadata: Json | null
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          etapa_anterior?: string | null
          etapa_nueva: string
          id?: string
          indicador?: string | null
          lead_id: string
          metadata?: Json | null
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          etapa_anterior?: string | null
          etapa_nueva?: string
          id?: string
          indicador?: string | null
          lead_id?: string
          metadata?: Json | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_funnel_stages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_state_transitions: {
        Row: {
          created_at: string | null
          estado_anterior: string
          estado_nuevo: string
          etapa_anterior: string | null
          etapa_nueva: string | null
          id: string
          lead_id: string
          metadata: Json | null
          motivo: string | null
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          estado_anterior: string
          estado_nuevo: string
          etapa_anterior?: string | null
          etapa_nueva?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          motivo?: string | null
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          estado_anterior?: string
          estado_nuevo?: string
          etapa_anterior?: string | null
          etapa_nueva?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          motivo?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_state_transitions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          accion_recomendada: string | null
          calificacion: string | null
          campana_headline: string | null
          campana_id: string | null
          campana_url: string | null
          canal: string | null
          convertido_a_paciente_id: string | null
          created_at: string
          ctwa_clid: string | null
          deleted_at: string | null
          email: string | null
          escalado_at: string | null
          estado: string
          etapa_funnel: string | null
          etapa_funnel_at: string | null
          fecha_siguiente_accion: string | null
          fuente: string
          id: string
          motivo_descarte: string | null
          motivo_escalado: string | null
          nombre: string
          nombre_confirmado: string | null
          nombre_pendiente_confirmar: boolean | null
          notas: string | null
          referral_data: Json | null
          score_total: number | null
          scores: Json | null
          signals: Json | null
          subestado: string | null
          telefono: string
          telefono_normalizado: string | null
          temperatura: string
          total_mensajes: number | null
          ultima_interaccion: string | null
          ultimo_mensaje_bot: string | null
          ultimo_mensaje_bot_at: string | null
          ultimo_mensaje_usuario: string | null
          ultimo_mensaje_usuario_at: string | null
          updated_at: string
        }
        Insert: {
          accion_recomendada?: string | null
          calificacion?: string | null
          campana_headline?: string | null
          campana_id?: string | null
          campana_url?: string | null
          canal?: string | null
          convertido_a_paciente_id?: string | null
          created_at?: string
          ctwa_clid?: string | null
          deleted_at?: string | null
          email?: string | null
          escalado_at?: string | null
          estado?: string
          etapa_funnel?: string | null
          etapa_funnel_at?: string | null
          fecha_siguiente_accion?: string | null
          fuente?: string
          id?: string
          motivo_descarte?: string | null
          motivo_escalado?: string | null
          nombre: string
          nombre_confirmado?: string | null
          nombre_pendiente_confirmar?: boolean | null
          notas?: string | null
          referral_data?: Json | null
          score_total?: number | null
          scores?: Json | null
          signals?: Json | null
          subestado?: string | null
          telefono: string
          telefono_normalizado?: string | null
          temperatura?: string
          total_mensajes?: number | null
          ultima_interaccion?: string | null
          ultimo_mensaje_bot?: string | null
          ultimo_mensaje_bot_at?: string | null
          ultimo_mensaje_usuario?: string | null
          ultimo_mensaje_usuario_at?: string | null
          updated_at?: string
        }
        Update: {
          accion_recomendada?: string | null
          calificacion?: string | null
          campana_headline?: string | null
          campana_id?: string | null
          campana_url?: string | null
          canal?: string | null
          convertido_a_paciente_id?: string | null
          created_at?: string
          ctwa_clid?: string | null
          deleted_at?: string | null
          email?: string | null
          escalado_at?: string | null
          estado?: string
          etapa_funnel?: string | null
          etapa_funnel_at?: string | null
          fecha_siguiente_accion?: string | null
          fuente?: string
          id?: string
          motivo_descarte?: string | null
          motivo_escalado?: string | null
          nombre?: string
          nombre_confirmado?: string | null
          nombre_pendiente_confirmar?: boolean | null
          notas?: string | null
          referral_data?: Json | null
          score_total?: number | null
          scores?: Json | null
          signals?: Json | null
          subestado?: string | null
          telefono?: string
          telefono_normalizado?: string | null
          temperatura?: string
          total_mensajes?: number | null
          ultima_interaccion?: string | null
          ultimo_mensaje_bot?: string | null
          ultimo_mensaje_bot_at?: string | null
          ultimo_mensaje_usuario?: string | null
          ultimo_mensaje_usuario_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_convertido_a_paciente_id_fkey"
            columns: ["convertido_a_paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes: {
        Row: {
          contenido: string
          conversacion_id: string
          created_at: string
          error_log: string | null
          es_primera_respuesta: boolean | null
          estado_entrega: string | null
          id: string
          latencia_ms: number | null
          lead_id: string | null
          leido: boolean | null
          media_url: string | null
          mensaje_id_externo: string | null
          metadata: Json | null
          modelo_ia: string | null
          n8n_execution_id: string | null
          prompt_version_id: string | null
          provider: string | null
          remitente: string
          reply_to: string | null
          session_id: string | null
          source_node: string | null
          tiempo_respuesta_segundos: number | null
          tipo: string
          tipo_contenido: string | null
          tokens_usados: number | null
          updated_at: string | null
        }
        Insert: {
          contenido: string
          conversacion_id: string
          created_at?: string
          error_log?: string | null
          es_primera_respuesta?: boolean | null
          estado_entrega?: string | null
          id?: string
          latencia_ms?: number | null
          lead_id?: string | null
          leido?: boolean | null
          media_url?: string | null
          mensaje_id_externo?: string | null
          metadata?: Json | null
          modelo_ia?: string | null
          n8n_execution_id?: string | null
          prompt_version_id?: string | null
          provider?: string | null
          remitente: string
          reply_to?: string | null
          session_id?: string | null
          source_node?: string | null
          tiempo_respuesta_segundos?: number | null
          tipo: string
          tipo_contenido?: string | null
          tokens_usados?: number | null
          updated_at?: string | null
        }
        Update: {
          contenido?: string
          conversacion_id?: string
          created_at?: string
          error_log?: string | null
          es_primera_respuesta?: boolean | null
          estado_entrega?: string | null
          id?: string
          latencia_ms?: number | null
          lead_id?: string | null
          leido?: boolean | null
          media_url?: string | null
          mensaje_id_externo?: string | null
          metadata?: Json | null
          modelo_ia?: string | null
          n8n_execution_id?: string | null
          prompt_version_id?: string | null
          provider?: string | null
          remitente?: string
          reply_to?: string | null
          session_id?: string | null
          source_node?: string | null
          tiempo_respuesta_segundos?: number | null
          tipo?: string
          tipo_contenido?: string | null
          tokens_usados?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "mensajes"
            referencedColumns: ["id"]
          },
        ]
      }
      message_locks: {
        Row: {
          execution_id: string | null
          id: string
          locked_at: string | null
          message_id: string
          telefono: string
        }
        Insert: {
          execution_id?: string | null
          id?: string
          locked_at?: string | null
          message_id: string
          telefono: string
        }
        Update: {
          execution_id?: string | null
          id?: string
          locked_at?: string | null
          message_id?: string
          telefono?: string
        }
        Relationships: []
      }
      meta_ads_daily: {
        Row: {
          adset_id: string | null
          adset_name: string | null
          campaign_id: string
          campaign_name: string | null
          clicks: number | null
          comments: number | null
          cost_per_conversation: number | null
          cost_per_first_reply: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          crm_calientes: number | null
          crm_citas: number | null
          crm_cost_per_hot_lead: number | null
          crm_cost_per_lead: number | null
          crm_enriched_at: string | null
          crm_escalados: number | null
          crm_frios: number | null
          crm_leads_total: number | null
          crm_muy_calientes: number | null
          crm_score_promedio: number | null
          crm_tibios: number | null
          ctr: number | null
          date: string
          frequency: number | null
          id: string
          impressions: number | null
          landing_page_views: number | null
          link_clicks: number | null
          messaging_blocks: number | null
          messaging_connections: number | null
          messaging_conversations_started: number | null
          messaging_depth_2: number | null
          messaging_depth_3: number | null
          messaging_first_reply: number | null
          objective: string | null
          post_reactions: number | null
          post_saves: number | null
          reach: number | null
          spend: number | null
          synced_at: string | null
        }
        Insert: {
          adset_id?: string | null
          adset_name?: string | null
          campaign_id: string
          campaign_name?: string | null
          clicks?: number | null
          comments?: number | null
          cost_per_conversation?: number | null
          cost_per_first_reply?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          crm_calientes?: number | null
          crm_citas?: number | null
          crm_cost_per_hot_lead?: number | null
          crm_cost_per_lead?: number | null
          crm_enriched_at?: string | null
          crm_escalados?: number | null
          crm_frios?: number | null
          crm_leads_total?: number | null
          crm_muy_calientes?: number | null
          crm_score_promedio?: number | null
          crm_tibios?: number | null
          ctr?: number | null
          date: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          landing_page_views?: number | null
          link_clicks?: number | null
          messaging_blocks?: number | null
          messaging_connections?: number | null
          messaging_conversations_started?: number | null
          messaging_depth_2?: number | null
          messaging_depth_3?: number | null
          messaging_first_reply?: number | null
          objective?: string | null
          post_reactions?: number | null
          post_saves?: number | null
          reach?: number | null
          spend?: number | null
          synced_at?: string | null
        }
        Update: {
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string
          campaign_name?: string | null
          clicks?: number | null
          comments?: number | null
          cost_per_conversation?: number | null
          cost_per_first_reply?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          crm_calientes?: number | null
          crm_citas?: number | null
          crm_cost_per_hot_lead?: number | null
          crm_cost_per_lead?: number | null
          crm_enriched_at?: string | null
          crm_escalados?: number | null
          crm_frios?: number | null
          crm_leads_total?: number | null
          crm_muy_calientes?: number | null
          crm_score_promedio?: number | null
          crm_tibios?: number | null
          ctr?: number | null
          date?: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          landing_page_views?: number | null
          link_clicks?: number | null
          messaging_blocks?: number | null
          messaging_connections?: number | null
          messaging_conversations_started?: number | null
          messaging_depth_2?: number | null
          messaging_depth_3?: number | null
          messaging_first_reply?: number | null
          objective?: string | null
          post_reactions?: number | null
          post_saves?: number | null
          reach?: number | null
          spend?: number | null
          synced_at?: string | null
        }
        Relationships: []
      }
      meta_campaign_ad_mapping: {
        Row: {
          ad_id: string
          ad_name: string | null
          adset_id: string | null
          campaign_id: string
          campaign_name: string | null
        }
        Insert: {
          ad_id: string
          ad_name?: string | null
          adset_id?: string | null
          campaign_id: string
          campaign_name?: string | null
        }
        Update: {
          ad_id?: string
          ad_name?: string | null
          adset_id?: string | null
          campaign_id?: string
          campaign_name?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempt_count: number | null
          claimed_at: string | null
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
          worker_id: string | null
        }
        Insert: {
          attempt_count?: number | null
          claimed_at?: string | null
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
          worker_id?: string | null
        }
        Update: {
          attempt_count?: number | null
          claimed_at?: string | null
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
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
        ]
      }
      numeros_bloqueados: {
        Row: {
          activo: boolean | null
          bloqueado_por: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          mensajes_bloqueados: number | null
          motivo: string
          nombre_referencia: string | null
          telefono: string
          telefono_normalizado: string
          ultimo_intento_at: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          bloqueado_por?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          mensajes_bloqueados?: number | null
          motivo: string
          nombre_referencia?: string | null
          telefono: string
          telefono_normalizado: string
          ultimo_intento_at?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          bloqueado_por?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          mensajes_bloqueados?: number | null
          motivo?: string
          nombre_referencia?: string | null
          telefono?: string
          telefono_normalizado?: string
          ultimo_intento_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "numeros_bloqueados_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          alergias: string | null
          apellido: string | null
          apnp_actividad_fisica: string | null
          apnp_alcoholismo: string | null
          apnp_tabaquismo: string | null
          app_alergias: string[] | null
          app_enfermedades_cronicas: string[] | null
          app_quirurgicos: string[] | null
          created_at: string | null
          deleted_at: string | null
          diagnostico_principal: string | null
          doctoralia_id: string | null
          edad: number | null
          email: string | null
          es_activo: boolean | null
          estado: string | null
          external_id: string | null
          fecha_alta: string | null
          fecha_nacimiento: string | null
          fuente: string | null
          fuente_detalle: string | null
          genero: string | null
          historial_medico: string | null
          id: string
          lead_id: string | null
          lugar_origen: string | null
          medicamentos: string | null
          nombre: string
          numero_expediente: string | null
          observaciones: string | null
          ocupacion: string | null
          origen_lead: string | null
          referido_por: string | null
          telefono: string
          telefono_normalizado: string | null
          telefono_secundario: string | null
          tipo_sangre: string | null
          total_consultas: number | null
          ultima_consulta: string | null
          updated_at: string | null
          valor_total_pagado: number | null
          zona: string | null
        }
        Insert: {
          alergias?: string | null
          apellido?: string | null
          apnp_actividad_fisica?: string | null
          apnp_alcoholismo?: string | null
          apnp_tabaquismo?: string | null
          app_alergias?: string[] | null
          app_enfermedades_cronicas?: string[] | null
          app_quirurgicos?: string[] | null
          created_at?: string | null
          deleted_at?: string | null
          diagnostico_principal?: string | null
          doctoralia_id?: string | null
          edad?: number | null
          email?: string | null
          es_activo?: boolean | null
          estado?: string | null
          external_id?: string | null
          fecha_alta?: string | null
          fecha_nacimiento?: string | null
          fuente?: string | null
          fuente_detalle?: string | null
          genero?: string | null
          historial_medico?: string | null
          id?: string
          lead_id?: string | null
          lugar_origen?: string | null
          medicamentos?: string | null
          nombre: string
          numero_expediente?: string | null
          observaciones?: string | null
          ocupacion?: string | null
          origen_lead?: string | null
          referido_por?: string | null
          telefono: string
          telefono_normalizado?: string | null
          telefono_secundario?: string | null
          tipo_sangre?: string | null
          total_consultas?: number | null
          ultima_consulta?: string | null
          updated_at?: string | null
          valor_total_pagado?: number | null
          zona?: string | null
        }
        Update: {
          alergias?: string | null
          apellido?: string | null
          apnp_actividad_fisica?: string | null
          apnp_alcoholismo?: string | null
          apnp_tabaquismo?: string | null
          app_alergias?: string[] | null
          app_enfermedades_cronicas?: string[] | null
          app_quirurgicos?: string[] | null
          created_at?: string | null
          deleted_at?: string | null
          diagnostico_principal?: string | null
          doctoralia_id?: string | null
          edad?: number | null
          email?: string | null
          es_activo?: boolean | null
          estado?: string | null
          external_id?: string | null
          fecha_alta?: string | null
          fecha_nacimiento?: string | null
          fuente?: string | null
          fuente_detalle?: string | null
          genero?: string | null
          historial_medico?: string | null
          id?: string
          lead_id?: string | null
          lugar_origen?: string | null
          medicamentos?: string | null
          nombre?: string
          numero_expediente?: string | null
          observaciones?: string | null
          ocupacion?: string | null
          origen_lead?: string | null
          referido_por?: string | null
          telefono?: string
          telefono_normalizado?: string | null
          telefono_secundario?: string | null
          tipo_sangre?: string | null
          total_consultas?: number | null
          ultima_consulta?: string | null
          updated_at?: string | null
          valor_total_pagado?: number | null
          zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_metrics: {
        Row: {
          abandonos_post_precio: number | null
          citas_agendadas: number | null
          conversiones: number | null
          created_at: string | null
          escalamientos: number | null
          fecha: string
          id: string
          leads_calientes: number | null
          leads_frios: number | null
          promedio_mensajes: number | null
          prompt_version_id: string
          score_promedio: number | null
          tasa_respuesta: number | null
          total_conversaciones: number | null
          total_leads: number | null
          updated_at: string | null
        }
        Insert: {
          abandonos_post_precio?: number | null
          citas_agendadas?: number | null
          conversiones?: number | null
          created_at?: string | null
          escalamientos?: number | null
          fecha?: string
          id?: string
          leads_calientes?: number | null
          leads_frios?: number | null
          promedio_mensajes?: number | null
          prompt_version_id: string
          score_promedio?: number | null
          tasa_respuesta?: number | null
          total_conversaciones?: number | null
          total_leads?: number | null
          updated_at?: string | null
        }
        Update: {
          abandonos_post_precio?: number | null
          citas_agendadas?: number | null
          conversiones?: number | null
          created_at?: string | null
          escalamientos?: number | null
          fecha?: string
          id?: string
          leads_calientes?: number | null
          leads_frios?: number | null
          promedio_mensajes?: number | null
          prompt_version_id?: string
          score_promedio?: number | null
          tasa_respuesta?: number | null
          total_conversaciones?: number | null
          total_leads?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_metrics_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          activado_at: string | null
          contenido: string
          created_at: string | null
          created_by: string | null
          desactivado_at: string | null
          descripcion: string | null
          es_activo: boolean | null
          id: string
          nombre: string
          version: string
        }
        Insert: {
          activado_at?: string | null
          contenido: string
          created_at?: string | null
          created_by?: string | null
          desactivado_at?: string | null
          descripcion?: string | null
          es_activo?: boolean | null
          id?: string
          nombre: string
          version: string
        }
        Update: {
          activado_at?: string | null
          contenido?: string
          created_at?: string | null
          created_by?: string | null
          desactivado_at?: string | null
          descripcion?: string | null
          es_activo?: boolean | null
          id?: string
          nombre?: string
          version?: string
        }
        Relationships: []
      }
      sedes: {
        Row: {
          activo: boolean | null
          anchor_date: string | null
          anchor_week_type: string | null
          calendar_id: string | null
          created_at: string | null
          direccion: string | null
          display_name: string | null
          horario_json: Json | null
          id: string
          instrucciones_llegada: string | null
          maps_url: string | null
          sede: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          anchor_date?: string | null
          anchor_week_type?: string | null
          calendar_id?: string | null
          created_at?: string | null
          direccion?: string | null
          display_name?: string | null
          horario_json?: Json | null
          id?: string
          instrucciones_llegada?: string | null
          maps_url?: string | null
          sede: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          anchor_date?: string | null
          anchor_week_type?: string | null
          calendar_id?: string | null
          created_at?: string | null
          direccion?: string | null
          display_name?: string | null
          horario_json?: Json | null
          id?: string
          instrucciones_llegada?: string | null
          maps_url?: string | null
          sede?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slot_reservations: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          slot_datetime: string
          status: string | null
          telefono: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          slot_datetime: string
          status?: string | null
          telefono: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          slot_datetime?: string
          status?: string | null
          telefono?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_prompt_version: {
        Args: { p_version_id: string }
        Returns: undefined
      }
      bloquear_numero: {
        Args: {
          p_motivo?: string
          p_nombre_contacto?: string
          p_telefono: string
        }
        Returns: Json
      }
      check_debounce: {
        Args: { p_mensaje_id: string; p_telefono: string }
        Returns: {
          es_ultimo: boolean
          total_pendientes: number
        }[]
      }
      check_numero_bloqueado: { Args: { p_telefono: string }; Returns: boolean }
      claim_message_for_processing: {
        Args: {
          p_execution_id?: string
          p_message_id: string
          p_telefono: string
        }
        Returns: {
          message_id: string
          puede_procesar: boolean
          razon: string
        }[]
      }
      convertir_lead_a_paciente: { Args: { p_lead_id: string }; Returns: Json }
      crear_lead_automatico: {
        Args: { p_fuente?: string; p_nombre: string; p_telefono: string }
        Returns: string
      }
      escalar_lead_atomico: {
        Args: {
          p_es_urgente?: boolean
          p_lead_id: string
          p_motivo: string
          p_red_flags?: string
          p_resumen?: string
          p_sintomas_principales?: string
          p_temperatura: string
        }
        Returns: Json
      }
      generar_whatsapp_link: { Args: { p_telefono: string }; Returns: string }
      get_active_prompt_version_id: { Args: never; Returns: string }
      get_activity_by_period: {
        Args: { p_days?: number }
        Returns: {
          date: string
          leads: number
          mensajes: number
        }[]
      }
      get_dashboard_stats_fast: { Args: never; Returns: Json }
      get_dashboard_stats_filtered: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_days?: number
          p_estado?: string
          p_fuente?: string
          p_temperatura?: string
        }
        Returns: Json
      }
      get_escalamientos_stats: { Args: never; Returns: Json }
      get_inbox_optimized: {
        Args: {
          p_estado?: string
          p_limit?: number
          p_page?: number
          p_plataforma?: string
          p_prioridad?: string
        }
        Returns: Json
      }
      get_leads_stats_optimized: { Args: never; Returns: Json }
      guardar_mensaje_urobot: {
        Args: {
          p_contenido?: string
          p_latencia_ms?: number
          p_mensaje_id_externo?: string
          p_metadata?: Json
          p_modelo_ia?: string
          p_n8n_execution_id?: string
          p_nombre?: string
          p_session_id?: string
          p_source_node?: string
          p_telefono: string
          p_tipo?: string
          p_tipo_contenido?: string
        }
        Returns: Json
      }
      marcar_mensajes_leidos: {
        Args: { p_conversacion_id: string }
        Returns: number
      }
      normalizar_telefono: { Args: { p_telefono: string }; Returns: string }
      normalizar_temperatura: {
        Args: { p_temperatura: string }
        Returns: string
      }
      normalizar_valor_catalogo: {
        Args: { p_catalogo: string; p_default?: string; p_valor: string }
        Returns: string
      }
      obtener_historial_mensajes: {
        Args: { p_conversacion_id: string; p_limite?: number }
        Returns: {
          contenido: string
          created_at: string
          id: string
          remitente: string
          tipo: string
        }[]
      }
      register_debounce: {
        Args: { p_mensaje_id: string; p_telefono: string }
        Returns: undefined
      }
      registrar_auditoria: {
        Args: {
          p_conversacion_id?: string
          p_datos_antes?: Json
          p_datos_despues?: Json
          p_entidad: string
          p_entidad_id?: string
          p_error_message?: string
          p_evento: string
          p_lead_id?: string
          p_n8n_execution_id?: string
          p_n8n_node_name?: string
          p_telefono?: string
        }
        Returns: string
      }
      search_knowledge_base: {
        Args: {
          filter_category?: string
          filter_tags?: string[]
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          category: string
          content: string
          document_name: string
          id: string
          metadata: Json
          similarity: number
          subcategory: string
          tags: string[]
        }[]
      }
      search_leads_optimized: {
        Args: {
          p_calificacion?: string
          p_dias_sin_contacto?: number
          p_estado?: string
          p_fuente?: string
          p_limit?: number
          p_page?: number
          p_search?: string
        }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      transition_lead_state: {
        Args: {
          p_lead_id: string
          p_metadata?: Json
          p_motivo?: string
          p_nuevo_estado: string
          p_triggered_by?: string
        }
        Returns: {
          estado_anterior: string
          estado_nuevo: string
          etapa_anterior: string
          etapa_nueva: string
          lead_id: string
          mensaje: string
          success: boolean
        }[]
      }
      upsert_conversacion_inteligente: {
        Args: {
          p_external_chat_id?: string
          p_nombre_contacto?: string
          p_plataforma?: string
          p_telefono?: string
        }
        Returns: {
          conversacion_id: string
          es_nueva: boolean
          lead_id: string
          merge_info: string
        }[]
      }
      upsert_lead_v11: {
        Args: {
          p_banderas_rojas?: string[]
          p_campana_headline?: string
          p_campana_id?: string
          p_campana_url?: string
          p_canal?: string
          p_ctwa_clid?: string
          p_fit_servicio?: string
          p_fuente?: string
          p_intencion?: string
          p_mensaje?: string
          p_nombre?: string
          p_objeciones?: string[]
          p_para_quien?: string
          p_pregunto_precio?: boolean
          p_referral_data?: Json
          p_sentimiento?: string
          p_signals?: Json
          p_sintomas_nuevos?: string[]
          p_telefono: string
          p_tiempo_evolucion?: string
          p_urgencia?: string
        }
        Returns: {
          accion_recomendada: string
          bant_score: number
          clinical_score: number
          engagement_score: number
          es_nuevo: boolean
          es_urgencia: boolean
          funnel_stage: string
          intent_score: number
          out_lead_id: string
          score_total: number
          temperatura: string
          total_mensajes: number
        }[]
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
