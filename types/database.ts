export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          lead_id: string | null;
          nombre_completo: string;
          telefono_whatsapp: string;
          fuente_lead: string | null;
          fecha_primer_contacto: string;
          estado: string | null;
          notas_iniciales: string | null;
          session_id: string | null;
          ultima_interaccion: string | null;
          total_interacciones: number | null;
          paciente_id: string | null;
          fecha_conversion: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      pacientes: {
        Row: {
          id: string;
          paciente_id: string;
          nombre_completo: string;
          telefono: string;
          email: string | null;
          fecha_registro: string;
          fuente_original: string | null;
          ultima_consulta: string | null;
          total_consultas: number | null;
          estado: string | null;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pacientes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["pacientes"]["Insert"]>;
      };
      consultas: {
        Row: {
          id: string;
          consulta_id: string;
          paciente_id: string | null;
          fecha_hora_utc: string;
          fecha_consulta: string;
          hora_consulta: string;
          timezone: string | null;
          sede: string;
          tipo_cita: string | null;
          motivo_consulta: string | null;
          duracion_minutos: number | null;
          estado_cita: string | null;
          estado_confirmacion: string | null;
          confirmado_paciente: boolean | null;
          fecha_confirmacion: string | null;
          fecha_limite_confirmacion: string | null;
          rem_confirmacion_inicial_enviado: boolean | null;
          rem_48h_enviado: boolean | null;
          rem_24h_enviado: boolean | null;
          rem_3h_enviado: boolean | null;
          calendar_event_id: string | null;
          calendar_link: string | null;
          canal_origen: string | null;
          cancelado_por: string | null;
          motivo_cancelacion: string | null;
          fecha_cancelacion: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["consultas"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["consultas"]["Insert"]>;
      };
    };
    Views: {
      dashboard_metricas: {
        Row: {
          leads_mes: number;
          leads_convertidos: number;
          leads_totales: number;
          total_pacientes: number;
          pacientes_activos: number;
          consultas_futuras: number;
          consultas_hoy: number;
          pendientes_confirmacion: number;
          polanco_futuras: number;
          satelite_futuras: number;
          tasa_conversion_pct: number;
        };
      };
    };
  };
};
