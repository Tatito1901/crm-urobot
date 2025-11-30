/**
 * ============================================================
 * HOOK: usePacienteDetallado
 * ============================================================
 * Obtiene información completa de un paciente incluyendo
 * su historial de consultas y destinos desde Supabase
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Paciente, PacienteRow, PacienteStatsRow } from '@/types/pacientes';
import { mapPacienteFromDB } from '@/types/pacientes';
import type { Consulta } from '@/types/consultas';
import type { DestinoPaciente, DestinoPacienteRow } from '@/types/destinos-pacientes';
import { mapDestinoPacienteFromDB } from '@/types/destinos-pacientes';
import { mapConsultasFromDB } from '@/lib/mappers';

const supabase = createClient();

// Tipo extendido para la vista de paciente detallado
export interface PacienteDetallado extends Paciente {
  destinos: DestinoPaciente[];
  destinoActual?: DestinoPaciente;
}

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
      if (!pacienteData) throw new Error('Paciente no encontrado');

      // Obtener estadísticas de la vista
      const { data: statsData, error: statsError } = await supabase
        .from('paciente_stats')
        .select('*')
        .eq('paciente_id', pacienteId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') { // PGRST116 es "Results contain 0 rows" para .single(), lo cual es aceptable si no hay stats
        console.warn('Error fetching paciente stats:', statsError);
      }

      // Mapear paciente con sus estadísticas
      const pacienteMapeado = mapPacienteFromDB(
        pacienteData as PacienteRow,
        statsData as PacienteStatsRow | null
      );

      // Obtener destinos del paciente
      const { data: destinosData, error: destinosError } = await supabase
        .from('destinos_pacientes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });
      
      if (destinosError) {
        console.error('Error fetching destinos:', destinosError);
        // No lanzamos error aquí para permitir mostrar el paciente aunque fallen los destinos
      }

      const destinos = (destinosData || []).map((row) => 
        mapDestinoPacienteFromDB(row as DestinoPacienteRow)
      );

      const pacienteDetallado: PacienteDetallado = {
        ...pacienteMapeado,
        destinos,
        destinoActual: destinos[0], // El más reciente
      };

      setPaciente(pacienteDetallado);

      // Obtener consultas del paciente
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha_hora_inicio', { ascending: false });

      if (consultasError) throw consultasError;

      const consultasMapeadas = mapConsultasFromDB(
        consultasData || [],
        pacienteMapeado.nombre
      );

      setConsultas(consultasMapeadas);
    } catch (err: any) {
      console.error('Error fetching paciente detallado:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        fullError: err
      });
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
