/**
 * ============================================================
 * HOOK: usePacienteDetallado
 * ============================================================
 * Obtiene información completa de un paciente incluyendo
 * su historial de consultas desde Supabase
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PacienteDetallado } from '@/types/pacientes';
import type { Consulta, ConsultaEstado, ConsultaSede } from '@/types/consultas';
import { DEFAULT_CONSULTA_ESTADO, DEFAULT_CONSULTA_SEDE, isConsultaEstado, isConsultaSede } from '@/types/consultas';

const supabase = createClient();

type ConsultaRow = {
  id: string;
  consulta_id: string;
  paciente_id: string | null;
  sede: string | null;
  tipo_cita: string | null;
  estado_cita: string | null;
  estado_confirmacion: string | null;
  confirmado_paciente: boolean | null;
  fecha_hora_utc: string;
  fecha_consulta: string;
  hora_consulta: string;
  timezone: string | null;
  motivo_consulta: string | null;
  duracion_minutos: number | null;
  calendar_event_id: string | null;
  calendar_link: string | null;
  canal_origen: string | null;
  cancelado_por: string | null;
  motivo_cancelacion: string | null;
  created_at: string | null;
  updated_at: string | null;
};

interface UsePacienteDetalladoResult {
  paciente: PacienteDetallado | null;
  consultas: Consulta[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePacienteDetallado(pacienteId: string): UsePacienteDetalladoResult {
  const [paciente, setPaciente] = useState<PacienteDetallado | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPacienteData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del paciente
      const { data: pacienteData, error: pacienteError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();

      if (pacienteError) throw pacienteError;

      if (!pacienteData) {
        throw new Error('Paciente no encontrado');
      }

      // Mapear datos del paciente
      const now = new Date();
      const ultimaConsulta = pacienteData.ultima_consulta ? new Date(pacienteData.ultima_consulta) : null;
      const diasDesdeUltimaConsulta = ultimaConsulta
        ? Math.floor((now.getTime() - ultimaConsulta.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      const fechaRegistro = pacienteData.fecha_registro ? new Date(pacienteData.fecha_registro) : null;
      const diasDesdeRegistro = fechaRegistro
        ? Math.floor((now.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      const esReciente = diasDesdeRegistro !== null && diasDesdeRegistro <= 30;
      const requiereAtencion = pacienteData.estado === 'Activo' && diasDesdeUltimaConsulta !== null && diasDesdeUltimaConsulta >= 90;
      
      const pacienteDetallado: PacienteDetallado = {
        id: pacienteData.id,
        pacienteId: pacienteData.paciente_id,
        nombre: pacienteData.nombre_completo,
        telefono: pacienteData.telefono,
        telefonoMx10: null,
        email: pacienteData.email || '',
        fechaRegistro: pacienteData.fecha_registro || new Date().toISOString(),
        fuenteOriginal: pacienteData.fuente_original || 'WhatsApp',
        ultimaConsulta: pacienteData.ultima_consulta,
        diasDesdeUltimaConsulta,
        totalConsultas: pacienteData.total_consultas || 0,
        estado: (pacienteData.estado as 'Activo' | 'Inactivo') || 'Activo',
        esReciente,
        requiereAtencion,
        notas: pacienteData.notas,
        createdAt: pacienteData.created_at || new Date().toISOString(),
        updatedAt: pacienteData.updated_at || new Date().toISOString(),
        // TODO: Agregar campo informacionMedica a la base de datos
        // Por ahora usar un campo JSON en notas o crear nueva tabla
        informacionMedica: undefined,
      };

      setPaciente(pacienteDetallado);

      // Obtener historial de consultas
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha_consulta', { ascending: false });

      if (consultasError) throw consultasError;

      // Mapear consultas
      const consultasMapeadas: Consulta[] = ((consultasData as ConsultaRow[] | null) ?? []).map((row) => {
        let sede: ConsultaSede = DEFAULT_CONSULTA_SEDE;
        if (row.sede && isConsultaSede(row.sede)) {
          sede = row.sede;
        }

        let estado: ConsultaEstado = DEFAULT_CONSULTA_ESTADO;
        if (row.estado_cita && isConsultaEstado(row.estado_cita)) {
          estado = row.estado_cita;
        }

        // Calcular métricas temporales
        const now = new Date();
        const fechaConsulta = new Date(row.fecha_hora_utc);
        const horasHastaConsulta = Math.floor((fechaConsulta.getTime() - now.getTime()) / (1000 * 60 * 60));
        const diasHastaConsulta = Math.floor(horasHastaConsulta / 24);
        
        // Determinar si requiere confirmación (consultas futuras)
        const requiereConfirmacion = horasHastaConsulta > 0 && horasHastaConsulta <= 48;
        
        // Determinar si la confirmación está vencida (menos de 24h y no confirmada)
        const confirmacionVencida = horasHastaConsulta > 0 && horasHastaConsulta < 24 && row.estado_confirmacion !== 'Confirmada';

        return {
          id: row.id,
          uuid: row.consulta_id,
          paciente: pacienteDetallado.nombre,
          pacienteId: row.paciente_id ?? pacienteDetallado.pacienteId,
          sede,
          tipo: row.tipo_cita ?? 'Consulta',
          estado,
          estadoConfirmacion: (row.estado_confirmacion as 'Pendiente' | 'Confirmada' | 'No Confirmada') ?? 'Pendiente',
          confirmadoPaciente: Boolean(row.confirmado_paciente),
          fechaConfirmacion: null,
          fechaLimiteConfirmacion: null,
          remConfirmacionInicialEnviado: false,
          rem48hEnviado: false,
          rem24hEnviado: false,
          rem3hEnviado: false,
          horasHastaConsulta: horasHastaConsulta > 0 ? horasHastaConsulta : null,
          diasHastaConsulta: horasHastaConsulta > 0 ? diasHastaConsulta : null,
          requiereConfirmacion,
          confirmacionVencida,
          fecha: row.fecha_hora_utc,
          fechaConsulta: row.fecha_consulta,
          horaConsulta: row.hora_consulta,
          timezone: row.timezone ?? 'America/Mexico_City',
          motivoConsulta: row.motivo_consulta,
          duracionMinutos: row.duracion_minutos ?? 30,
          calendarEventId: row.calendar_event_id,
          calendarLink: row.calendar_link,
          canalOrigen: row.canal_origen,
          canceladoPor: row.cancelado_por ?? undefined,
          motivoCancelacion: row.motivo_cancelacion ?? undefined,
          createdAt: row.created_at ?? new Date().toISOString(),
          updatedAt: row.updated_at ?? new Date().toISOString(),
        };
      });

      setConsultas(consultasMapeadas);
    } catch (err) {
      console.error('Error fetching paciente detallado:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    if (pacienteId) {
      fetchPacienteData();
    }
  }, [pacienteId, fetchPacienteData]);

  return {
    paciente,
    consultas,
    loading,
    error,
    refetch: fetchPacienteData,
  };
}
