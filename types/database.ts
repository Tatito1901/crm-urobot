/**
 * ============================================================
 * SUPABASE DATABASE TYPES
 * ============================================================
 * Generado automáticamente desde Supabase MCP
 * Proyecto: UROBOT (uxqksgdpgxkgvasysvsb)
 * 
 * INCLUYE:
 * - 6 Tablas: leads, pacientes, consultas, recordatorios, sedes, conocimiento_procedimientos_urologia
 * - 4 Views: dashboard_metricas, vw_citas_activas, vw_confirmaciones, documents
 * - 17 Funciones RPC disponibles
 * - Relaciones FK completas
 */

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
      /**
       * Tabla: conocimiento_procedimientos_urologia
       * Descripción: Vector store para RAG (Retrieval Augmented Generation)
       * Usada por: Supabase Vector Store en n8n (UroBot)
       */
      conocimiento_procedimientos_urologia: {
        Row: {
          id: number
          content: string
          metadata: Json | null
          embedding: string // vector type
        }
        Insert: {
          id?: number
          content: string
          metadata?: Json | null
          embedding: string
        }
        Update: {
          id?: number
          content?: string
          metadata?: Json | null
          embedding?: string
        }
        Relationships: []
      }

      /**
       * Tabla: leads
       * Descripción: Prospectos que contactan por WhatsApp antes de convertirse en pacientes
       * Trigger: update_leads_updated_at (actualiza updated_at automáticamente)
       */
      leads: {
        Row: {
          id: string // uuid PK
          lead_id: string | null // UNIQUE
          nombre_completo: string
          telefono_whatsapp: string // UNIQUE
          fuente_lead: string | null // Default: 'WhatsApp'
          fecha_primer_contacto: string | null // timestamptz
          estado: string | null // Default: 'Nuevo' | 'En seguimiento' | 'Convertido' | 'Descartado'
          notas_iniciales: string | null
          session_id: string | null
          ultima_interaccion: string | null // timestamptz
          total_interacciones: number | null // Default: 1
          paciente_id: string | null // FK a pacientes.id
          fecha_conversion: string | null // timestamptz
          created_at: string | null // timestamptz
          updated_at: string | null // timestamptz
        }
        Insert: {
          id?: string
          lead_id?: string | null
          nombre_completo: string
          telefono_whatsapp: string
          fuente_lead?: string | null
          fecha_primer_contacto?: string | null
          estado?: string | null
          notas_iniciales?: string | null
          session_id?: string | null
          ultima_interaccion?: string | null
          total_interacciones?: number | null
          paciente_id?: string | null
          fecha_conversion?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string | null
          nombre_completo?: string
          telefono_whatsapp?: string
          fuente_lead?: string | null
          fecha_primer_contacto?: string | null
          estado?: string | null
          notas_iniciales?: string | null
          session_id?: string | null
          ultima_interaccion?: string | null
          total_interacciones?: number | null
          paciente_id?: string | null
          fecha_conversion?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_paciente"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          }
        ]
      }

      /**
       * Tabla: pacientes
       * Descripción: Pacientes que ya han agendado al menos una consulta
       * Trigger: update_pacientes_updated_at (actualiza updated_at automáticamente)
       */
      pacientes: {
        Row: {
          id: string // uuid PK
          paciente_id: string // UNIQUE
          nombre_completo: string
          telefono: string
          email: string | null
          fecha_registro: string | null // timestamptz
          fuente_original: string | null // Default: 'WhatsApp'
          ultima_consulta: string | null // timestamptz
          total_consultas: number | null // Default: 0
          estado: string | null // Default: 'Activo' | 'Inactivo'
          notas: string | null
          created_at: string | null // timestamptz
          updated_at: string | null // timestamptz
        }
        Insert: {
          id?: string
          paciente_id: string
          nombre_completo: string
          telefono: string
          email?: string | null
          fecha_registro?: string | null
          fuente_original?: string | null
          ultima_consulta?: string | null
          total_consultas?: number | null
          estado?: string | null
          notas?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          paciente_id?: string
          nombre_completo?: string
          telefono?: string
          email?: string | null
          fecha_registro?: string | null
          fuente_original?: string | null
          ultima_consulta?: string | null
          total_consultas?: number | null
          estado?: string | null
          notas?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      /**
       * Tabla: consultas
       * Descripción: Citas médicas agendadas en ambas sedes
       * Triggers:
       * - trigger_generar_recordatorios (AFTER INSERT) → genera recordatorios automáticos
       * - trigger_actualizar_total_consultas (AFTER INSERT/UPDATE) → actualiza total_consultas en pacientes
       * - update_consultas_updated_at (BEFORE UPDATE) → actualiza updated_at
       */
      consultas: {
        Row: {
          id: string // uuid PK
          consulta_id: string // UNIQUE
          paciente_id: string | null // FK a pacientes.id
          fecha_hora_utc: string // timestamptz
          fecha_consulta: string // date
          hora_consulta: string // time
          timezone: string | null // Default: 'America/Mexico_City'
          sede: string // 'POLANCO' | 'SATELITE'
          tipo_cita: string | null // Default: 'primera_vez' | 'seguimiento'
          motivo_consulta: string | null
          duracion_minutos: number | null // Default: 30
          estado_cita: string | null // Default: 'Programada' | 'Confirmada' | 'Completada' | 'Cancelada' | 'Reagendada'
          estado_confirmacion: string | null // Default: 'Pendiente' | 'Confirmada' | 'No Confirmada'
          confirmado_paciente: boolean | null // Default: false
          fecha_confirmacion: string | null // timestamptz
          fecha_limite_confirmacion: string | null // timestamptz
          rem_confirmacion_inicial_enviado: boolean | null // Default: false
          rem_48h_enviado: boolean | null // Default: false
          rem_24h_enviado: boolean | null // Default: false
          rem_3h_enviado: boolean | null // Default: false
          calendar_event_id: string | null // Google Calendar Event ID
          calendar_link: string | null
          canal_origen: string | null // Default: 'WhatsApp'
          cancelado_por: string | null
          motivo_cancelacion: string | null
          fecha_cancelacion: string | null // timestamptz
          created_at: string | null // timestamptz
          updated_at: string | null // timestamptz
          historial_cambios: Json | null // Default: []
          slot_guard: boolean // Default: true
          idempotency_key: string | null
        }
        Insert: {
          id?: string
          consulta_id: string
          paciente_id?: string | null
          fecha_hora_utc: string
          fecha_consulta: string
          hora_consulta: string
          timezone?: string | null
          sede: string
          tipo_cita?: string | null
          motivo_consulta?: string | null
          duracion_minutos?: number | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          confirmado_paciente?: boolean | null
          fecha_confirmacion?: string | null
          fecha_limite_confirmacion?: string | null
          rem_confirmacion_inicial_enviado?: boolean | null
          rem_48h_enviado?: boolean | null
          rem_24h_enviado?: boolean | null
          rem_3h_enviado?: boolean | null
          calendar_event_id?: string | null
          calendar_link?: string | null
          canal_origen?: string | null
          cancelado_por?: string | null
          motivo_cancelacion?: string | null
          fecha_cancelacion?: string | null
          created_at?: string | null
          updated_at?: string | null
          historial_cambios?: Json | null
          slot_guard?: boolean
          idempotency_key?: string | null
        }
        Update: {
          id?: string
          consulta_id?: string
          paciente_id?: string | null
          fecha_hora_utc?: string
          fecha_consulta?: string
          hora_consulta?: string
          timezone?: string | null
          sede?: string
          tipo_cita?: string | null
          motivo_consulta?: string | null
          duracion_minutos?: number | null
          estado_cita?: string | null
          estado_confirmacion?: string | null
          confirmado_paciente?: boolean | null
          fecha_confirmacion?: string | null
          fecha_limite_confirmacion?: string | null
          rem_confirmacion_inicial_enviado?: boolean | null
          rem_48h_enviado?: boolean | null
          rem_24h_enviado?: boolean | null
          rem_3h_enviado?: boolean | null
          calendar_event_id?: string | null
          calendar_link?: string | null
          canal_origen?: string | null
          cancelado_por?: string | null
          motivo_cancelacion?: string | null
          fecha_cancelacion?: string | null
          created_at?: string | null
          updated_at?: string | null
          historial_cambios?: Json | null
          slot_guard?: boolean
          idempotency_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_consultas_paciente"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          }
        ]
      }

      /**
       * Tabla: recordatorios
       * Descripción: Log de recordatorios enviados por WhatsApp
       * Trigger: trigger_actualizar_flags_recordatorios (AFTER UPDATE) → actualiza flags en consultas
       */
      recordatorios: {
        Row: {
          id: string // uuid PK
          recordatorio_id: string | null // UNIQUE
          consulta_id: string | null // FK a consultas.id
          tipo: string // 'confirmacion_inicial' | '48h' | '24h' | '3h'
          programado_para: string // timestamptz
          enviado_en: string | null // timestamptz
          estado: string | null // Default: 'pendiente' | 'procesando' | 'enviado' | 'error'
          mensaje_enviado: string | null
          plantilla_usada: string | null
          canal: string | null // Default: 'whatsapp' | 'sms' | 'email'
          entregado: boolean | null // Default: false
          leido: boolean | null // Default: false
          respondido: boolean | null // Default: false
          respuesta_texto: string | null
          intentos: number | null // Default: 0
          error_mensaje: string | null
          created_at: string | null // timestamptz
          updated_at: string | null // timestamptz
        }
        Insert: {
          id?: string
          recordatorio_id?: string | null
          consulta_id?: string | null
          tipo: string
          programado_para: string
          enviado_en?: string | null
          estado?: string | null
          mensaje_enviado?: string | null
          plantilla_usada?: string | null
          canal?: string | null
          entregado?: boolean | null
          leido?: boolean | null
          respondido?: boolean | null
          respuesta_texto?: string | null
          intentos?: number | null
          error_mensaje?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          recordatorio_id?: string | null
          consulta_id?: string | null
          tipo?: string
          programado_para?: string
          enviado_en?: string | null
          estado?: string | null
          mensaje_enviado?: string | null
          plantilla_usada?: string | null
          canal?: string | null
          entregado?: boolean | null
          leido?: boolean | null
          respondido?: boolean | null
          respuesta_texto?: string | null
          intentos?: number | null
          error_mensaje?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_recordatorios_consulta"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          }
        ]
      }

      /**
       * Tabla: sedes
       * Descripción: Configuración de sedes médicas
       * Trigger: biu_sedes_normalize (BEFORE INSERT/UPDATE) → normaliza datos de sede
       */
      sedes: {
        Row: {
          sede: string // PK, CHECK: sede = upper(sede)
          calendar_id: string // Google Calendar ID
          timezone: string // Default: 'America/Mexico_City'
          anchor_week_type: string | null
          anchor_date: string | null // date
          horario_json: Json | null
          display_name: string | null
        }
        Insert: {
          sede: string
          calendar_id: string
          timezone?: string
          anchor_week_type?: string | null
          anchor_date?: string | null
          horario_json?: Json | null
          display_name?: string | null
        }
        Update: {
          sede?: string
          calendar_id?: string
          timezone?: string
          anchor_week_type?: string | null
          anchor_date?: string | null
          horario_json?: Json | null
          display_name?: string | null
        }
        Relationships: []
      }
    }
    
    Views: {
      /**
       * View: dashboard_metricas
       * Descripción: Métricas pre-calculadas para el dashboard
       */
      dashboard_metricas: {
        Row: {
          leads_mes: number | null
          leads_convertidos: number | null
          leads_totales: number | null
          total_pacientes: number | null
          pacientes_activos: number | null
          consultas_futuras: number | null
          consultas_hoy: number | null
          pendientes_confirmacion: number | null
          polanco_futuras: number | null
          satelite_futuras: number | null
          tasa_conversion_pct: number | null
        }
        Relationships: []
      }

      /**
       * View: vw_citas_activas
       * Descripción: Vista de citas activas agrupadas por sede y fecha
       */
      vw_citas_activas: {
        Row: {
          sede: string | null
          fecha_local: string | null // date
          n: number | null // count
        }
        Relationships: []
      }

      /**
       * View: vw_confirmaciones
       * Descripción: Vista de tasas de confirmación por sede
       */
      vw_confirmaciones: {
        Row: {
          sede: string | null
          tasa_confirmacion: number | null
          no_confirmadas: number | null
        }
        Relationships: []
      }

      /**
       * View: documents
       * Descripción: Alias de conocimiento_procedimientos_urologia para compatibilidad
       */
      documents: {
        Row: {
          id: number | null
          content: string | null
          metadata: Json | null
          embedding: string | null // vector
        }
        Insert: {
          id?: number | null
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
        }
        Update: {
          id?: number | null
          content?: string | null
          metadata?: Json | null
          embedding?: string | null
        }
        Relationships: []
      }
    }
    
    Functions: {
      /**
       * Función: verificar_consulta_existente
       * Descripción: Verifica si una consulta ya existe por consulta_id
       * Retorna: JSONB con {exists: boolean, consulta?: object, message: string}
       */
      verificar_consulta_existente: {
        Args: { p_consulta_id: string }
        Returns: Json
      }

      /**
       * Función: convertir_lead_a_paciente
       * Descripción: Convierte un lead en paciente y retorna el ID del paciente
       * Retorna: UUID del paciente (nuevo o existente)
       */
      convertir_lead_a_paciente: {
        Args: { lead_uuid: string }
        Returns: string
      }

      /**
       * Función: upsert_appointment_atomic_from_calendar
       * Descripción: Upsert atómico de paciente + consulta desde n8n
       * Retorna: JSONB con resultado de la operación
       */
      upsert_appointment_atomic_from_calendar: {
        Args: {
          p_operation_id: string
          p_consulta_id: string
          p_paciente_id: string
          p_nombre_completo: string
          p_telefono: string
          p_email?: string
          p_fuente_original?: string
          p_fecha_hora_utc: string
          p_fecha_consulta: string
          p_hora_consulta: string
          p_timezone?: string
          p_sede: string
          p_tipo_cita: string
          p_motivo_consulta: string
          p_duracion_minutos: number
          p_calendar_event_id: string
          p_calendar_link: string
          p_canal_origen?: string
          p_lead_telefono_whatsapp?: string
          p_event_key?: string
          p_idempotency_key?: string
        }
        Returns: Json
      }

      /**
       * Función: buscar_consulta_para_reagendar
       * Descripción: Busca consulta futura por teléfono o consulta_id
       * Retorna: JSONB con {success: boolean, consulta?: object, error?: string}
       */
      buscar_consulta_para_reagendar: {
        Args: { p_telefono: string; p_consulta_id: string }
        Returns: Json
      }

      /**
       * Función: cancelar_consulta_para_reagendar
       * Descripción: Cancela una consulta marcándola como reagendada
       * Retorna: JSONB con resultado de la operación
       */
      cancelar_consulta_para_reagendar: {
        Args: { p_consulta_uuid: string; p_motivo_cancelacion?: string }
        Returns: Json
      }

      /**
       * Función: verificar_slot_disponible_reagendar
       * Descripción: Verifica si un slot está disponible detectando solapamientos
       * Retorna: JSONB con {available: boolean, conflict_count: number, conflicts?: array}
       */
      verificar_slot_disponible_reagendar: {
        Args: {
          p_sede: string
          p_fecha_hora_utc_inicio: string
          p_duracion_minutos?: number
        }
        Returns: Json
      }

      /**
       * Función: reagendar_consulta_atomica
       * Descripción: Reagenda consulta de forma atómica creando nueva y cancelando anterior
       * Retorna: JSONB con resultado de la operación
       */
      reagendar_consulta_atomica: {
        Args: {
          p_consulta_uuid_anterior: string
          p_nueva_fecha_hora_utc: string
          p_nueva_fecha_consulta: string
          p_nueva_hora_consulta: string
          p_nueva_sede: string
          p_timezone?: string
          p_nueva_duracion_minutos?: number
          p_nuevo_calendar_event_id: string
          p_nuevo_calendar_link: string
          p_motivo_reagendamiento: string
        }
        Returns: Json
      }

      /**
       * Función: reagendar_consulta_rpc
       * Descripción: Versión simplificada de reagendar_consulta_atomica
       * Retorna: JSONB con resultado de la operación
       */
      reagendar_consulta_rpc: {
        Args: {
          p_consulta_uuid: string
          p_fecha_local: string
          p_hora_local: string
          p_sede: string
          p_tz?: string
          p_duracion_min?: number
          p_motivo: string
          p_idempotency_key?: string
        }
        Returns: Json
      }

      /**
       * Función: claim_due_recordatorios
       * Descripción: Obtiene recordatorios pendientes y los marca como procesando (con lock)
       * Retorna: Array de recordatorios
       */
      claim_due_recordatorios: {
        Args: { p_limit?: number }
        Returns: Database['public']['Tables']['recordatorios']['Row'][]
      }

      /**
       * Función: mark_recordatorio_enviado
       * Descripción: Marca un recordatorio como enviado
       * Retorna: void
       */
      mark_recordatorio_enviado: {
        Args: {
          p_recordatorio_id: string
          p_mensaje?: string
          p_entregado?: boolean
          p_leido?: boolean
          p_respondido?: boolean
        }
        Returns: undefined
      }

      /**
       * Función: cerrar_confirmaciones_vencidas
       * Descripción: Marca confirmaciones como 'No Confirmada' si pasó la fecha límite
       * Retorna: Número de filas actualizadas
       */
      cerrar_confirmaciones_vencidas: {
        Args: never
        Returns: number
      }

      /**
       * Función: archivar_consultas_antiguas
       * Descripción: Marca consultas completadas de más de 1 año como archivadas
       * Retorna: Número de consultas archivadas
       */
      archivar_consultas_antiguas: {
        Args: never
        Returns: number
      }

      /**
       * Función: match_documents
       * Descripción: Búsqueda semántica en vector store (2 sobrecargas)
       * Retorna: Array de documentos con similarity score
       */
      match_documents:
        | {
            Args: { 
              query_embedding: string
              match_count: number
              filter: Json
            }
            Returns: {
              id: number
              content: string
              metadata: Json
              embedding: string
              similarity: number
            }[]
          }
        | {
            Args: { 
              query_embedding: string
              match_count: number
              match_threshold: number
            }
            Returns: {
              id: number
              content: string
              metadata: Json
              similarity: number
            }[]
          }

      /**
       * Función: foo (test function)
       * Descripción: Función de ejemplo/test (a+b)
       * Retorna: número
       */
      foo: { 
        Args: { a?: number; b?: number }
        Returns: number 
      }
    }
    
    Enums: {
      // No hay enums definidos actualmente
    }
    
    CompositeTypes: {
      // No hay tipos compuestos definidos actualmente
    }
  }
}

/**
 * Helper types para uso más sencillo
 */
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Insertable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type Updatable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

export type Views<T extends keyof Database['public']['Views']> = 
  Database['public']['Views'][T]['Row']
