import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  DEFAULT_CONSULTA_ESTADO,
  DEFAULT_CONSULTA_SEDE,
  type ConsultaEstado,
  type ConsultaSede,
  isConsultaEstado,
  isConsultaSede,
} from '@/types/consultas';
import {
  DEFAULT_RECORDATORIO_CANAL,
  DEFAULT_RECORDATORIO_ESTADO,
  DEFAULT_RECORDATORIO_TIPO,
  type Recordatorio,
  type RecordatorioDetalle,
  isRecordatorioCanal,
  isRecordatorioEstado,
  isRecordatorioTipo,
} from '@/types/recordatorios';
import { parseRecordatorioRows } from '@/lib/validators/recordatorios';

// Crear instancia del cliente para hooks
const supabase = createClient();

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

      const rows = parseRecordatorioRows(data);
      const mapped: RecordatorioDetalle[] = rows.map((row) => {
        // Validar tipo de recordatorio
        const tipo = isRecordatorioTipo(row.tipo)
          ? row.tipo
          : DEFAULT_RECORDATORIO_TIPO;

        // Validar estado de recordatorio
        const estado = isRecordatorioEstado(row.estado)
          ? row.estado
          : DEFAULT_RECORDATORIO_ESTADO;

        // Validar canal
        const canal = isRecordatorioCanal(row.canal)
          ? row.canal
          : DEFAULT_RECORDATORIO_CANAL;

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
        const sedeConsulta: ConsultaSede =
          consultaRow?.sede && isConsultaSede(consultaRow.sede)
            ? consultaRow.sede
            : DEFAULT_CONSULTA_SEDE;

        const estadoCita: ConsultaEstado =
          consultaRow?.estado_cita && isConsultaEstado(consultaRow.estado_cita)
            ? consultaRow.estado_cita
            : DEFAULT_CONSULTA_ESTADO;

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
      });

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
