'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Consulta, ConsultaEstado, Recordatorio, RecordatorioDetalle } from '@/app/lib/crm-data';
import type { Tables } from '@/types/database';

// Crear instancia del cliente para hooks
const supabase = createClient();

type ConsultaRow = Tables<'consultas'> & {
  paciente: {
    id: string;
    nombre_completo: string;
  } | null;
};

type RecordatorioRow = Tables<'recordatorios'> & {
  consulta: ConsultaRow | null;
};

interface UseRecordatoriosReturn {
  recordatorios: RecordatorioDetalle[];
  loading: boolean;
  error: Error | null;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
}

/**
 * Hook para obtener recordatorios de WhatsApp en tiempo real
 * Alineado con el flujo ENVIAR_CONFIRMACIONES de n8n
 */
export function useRecordatorios(): UseRecordatoriosReturn {
  const [recordatorios, setRecordatorios] = useState<RecordatorioDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecordatorios = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const hace60Dias = new Date();
      hace60Dias.setDate(hace60Dias.getDate() - 60);

      const { data, error: fetchError } = await supabase
        .from('recordatorios')
        .select(`*, consulta:consultas (id, consulta_id, sede, estado_cita, paciente:pacientes (id, nombre_completo))`)
        .gte('programado_para', hace60Dias.toISOString())
        .order('programado_para', { ascending: false })
        .limit(200);

      if (fetchError) throw fetchError;

      const mapped: RecordatorioDetalle[] = (data as RecordatorioRow[] | null)?.map((row) => {
        // Validar tipo de recordatorio
        const tiposValidos: Recordatorio['tipo'][] = ['confirmacion_inicial', '48h', '24h', '3h'];
        const tipo = tiposValidos.includes(row.tipo as Recordatorio['tipo'])
          ? (row.tipo as Recordatorio['tipo'])
          : 'confirmacion_inicial';

        // Validar estado de recordatorio
        const estadosValidos: Recordatorio['estado'][] = ['pendiente', 'procesando', 'enviado', 'error'];
        const estado = estadosValidos.includes(row.estado as Recordatorio['estado'])
          ? (row.estado as Recordatorio['estado'])
          : 'pendiente';

        // Validar canal
        const canalesValidos: ('whatsapp' | 'sms' | 'email')[] = ['whatsapp', 'sms', 'email'];
        const canal = row.canal && canalesValidos.includes(row.canal as 'whatsapp' | 'sms' | 'email')
          ? (row.canal as 'whatsapp' | 'sms' | 'email')
          : 'whatsapp';

        const base: Recordatorio = {
          id: row.id,
          recordatorio_id: row.recordatorio_id,
          consulta_id: row.consulta_id,
          tipo,
          programado_para: row.programado_para,
          enviado_en: row.enviado_en,
          estado,
          canal,
          mensaje_enviado: row.mensaje_enviado,
          plantilla_usada: row.plantilla_usada,
          entregado: row.entregado,
          leido: row.leido,
          respondido: row.respondido,
          respuesta_texto: row.respuesta_texto,
          intentos: row.intentos,
          error_mensaje: row.error_mensaje,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };

        const consultaRow = row.consulta;
        const pacienteRow = consultaRow?.paciente;

        // Validar sede y estado de consulta
        const sedesValidas: Consulta['sede'][] = ['POLANCO', 'SATELITE'];
        const sedeConsulta = consultaRow?.sede && sedesValidas.includes(consultaRow.sede as Consulta['sede'])
          ? (consultaRow.sede as Consulta['sede'])
          : 'POLANCO';

        const estadosCitaValidos: ConsultaEstado[] = ['Programada', 'Confirmada', 'Reagendada', 'Cancelada', 'Completada'];
        const estadoCita = consultaRow?.estado_cita && estadosCitaValidos.includes(consultaRow.estado_cita as ConsultaEstado)
          ? (consultaRow.estado_cita as ConsultaEstado)
          : 'Programada';

        return {
          ...base,
          consulta: consultaRow
            ? {
                id: consultaRow.id,
                consulta_id: consultaRow.consulta_id,
                sede: sedeConsulta,
                estado_cita: estadoCita,
              }
            : null,
          paciente: pacienteRow
            ? {
                id: pacienteRow.id,
                nombre_completo: pacienteRow.nombre_completo,
              }
            : null,
        };
      }) ?? [];

      setRecordatorios(mapped);
    } catch (err) {
      console.error('Error loading recordatorios:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRecordatorios();

    const channel = supabase
      .channel('public:recordatorios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recordatorios' }, () => {
        fetchRecordatorios({ silent: true });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecordatorios]);

  return {
    recordatorios,
    loading,
    error,
    refresh: fetchRecordatorios,
  };
}
