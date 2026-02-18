/**
 * ============================================================
 * HOOK: usePacienteDetallado
 * ============================================================
 * Obtiene información completa de un paciente incluyendo
 * su historial de consultas y destinos desde Supabase
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type { Paciente, PacienteRow } from '@/types/pacientes';
import { mapPacienteFromDB } from '@/types/pacientes';
import type { Consulta } from '@/types/consultas';
import type { DestinoPaciente, DestinoPacienteRow } from '@/types/destinos-pacientes';
import { mapDestinoPacienteFromDB } from '@/types/destinos-pacientes';
import { mapConsultasFromDB } from '@/lib/mappers';

const supabase = createClient();

// Tipo para notas clínicas / episodios
export interface NotaClinica {
  id: string;
  pacienteId: string;
  consultaId: string | null;
  fecha: string;
  titulo: string;
  nota: string;
  origen: string | null;
  createdAt: string;
}

// Tipo extendido para la vista de paciente detallado
export interface PacienteDetallado extends Paciente {
  destinos: DestinoPaciente[];
  destinoActual?: DestinoPaciente;
}

interface UsePacienteDetalladoResult {
  paciente: PacienteDetallado | null;
  consultas: Consulta[];
  notasClinicas: NotaClinica[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePacienteDetallado(pacienteId: string): UsePacienteDetalladoResult {
  const [paciente, setPaciente] = useState<PacienteDetallado | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [notasClinicas, setNotasClinicas] = useState<NotaClinica[]>([]);
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

      // Mapear paciente (stats ahora están en la tabla pacientes directamente)
      const pacienteMapeado = mapPacienteFromDB(pacienteData as PacienteRow);

      // Obtener destinos del paciente
      const { data: destinosData, error: destinosError } = await supabase
        .from('destinos_pacientes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });
      
      // No lanzamos error si fallan los destinos - permitir mostrar el paciente
      if (destinosError) { /* silenciado */ }

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

      // Obtener notas clínicas / episodios del paciente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: notasData, error: notasError } = await (supabase as any)
        .from('consultas_notas')
        .select('id, paciente_id, consulta_id, fecha, titulo, nota, origen, created_at')
        .eq('paciente_id', pacienteId)
        .order('fecha', { ascending: false });

      if (notasError) { /* silenciado - no crítico */ }

      const notasMapeadas: NotaClinica[] = (notasData || []).map((row: Record<string, string | null>) => ({
        id: row.id,
        pacienteId: row.paciente_id || pacienteId,
        consultaId: row.consulta_id,
        fecha: row.fecha || row.created_at?.split('T')[0] || '',
        titulo: row.titulo || 'Nota clínica',
        nota: row.nota,
        origen: row.origen,
        createdAt: row.created_at || '',
      }));

      setNotasClinicas(notasMapeadas);
    } catch (err: unknown) {
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
    notasClinicas,
    loading,
    error,
    refetch: fetchPacienteData,
  };
}
