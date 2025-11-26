/**
 * ============================================================
 * HOOK: usePacienteDetallado
 * ============================================================
 * Obtiene información completa de un paciente incluyendo
 * su historial de consultas desde Supabase
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PacienteDetallado, DestinoPaciente } from '@/types/pacientes';
import type { Consulta } from '@/types/consultas';
import type { Tables } from '@/types/database';
import { 
  mapPacienteFromDB, 
  enrichPaciente, 
  mapConsultasFromDB 
} from '@/lib/mappers';

const supabase = createClient();

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

      // Mapear datos del paciente usando mappers centralizados
      const pacienteBase = mapPacienteFromDB(pacienteData);
      const pacienteEnriquecido = enrichPaciente(pacienteBase);

      // Obtener el destino desde la tabla destinos_pacientes
      // Tabla destinos_pacientes no está en tipos generados aún
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const { data: destinoData } = await supabase
        // @ts-ignore
        .from('destinos_pacientes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Mapear el destino de la BD al tipo frontend
      let destino: DestinoPaciente | undefined;
      if (destinoData) {
        const data = destinoData as any;
        destino = {
          tipo: data.tipo_destino,
          fechaRegistro: data.fecha_registro,
          observaciones: data.observaciones || undefined,
        };

        if (data.tipo_destino === 'alta_definitiva' && data.motivo_alta) {
          destino.motivoAlta = data.motivo_alta;
        }

        if (data.tipo_destino === 'presupuesto_enviado' && data.tipo_cirugia) {
          destino.presupuesto = {
            tipoCirugia: data.tipo_cirugia,
            monto: data.monto,
            moneda: data.moneda,
            fechaEnvio: data.fecha_evento,
            notas: data.notas || undefined,
          };
        }

        if (data.tipo_destino === 'cirugia_realizada' && data.tipo_cirugia) {
          destino.cirugia = {
            tipoCirugia: data.tipo_cirugia,
            costo: data.monto,
            moneda: data.moneda,
            fechaCirugia: data.fecha_evento,
            sedeOperacion: data.sede_operacion || undefined,
            notas: data.notas || undefined,
          };
        }
      }

      const pacienteDetallado: PacienteDetallado = {
        ...pacienteEnriquecido,
        // Asegurar campos obligatorios de PacienteDetallado que vienen de enriquecimiento o defaults
        id: pacienteEnriquecido.id!,
        pacienteId: pacienteEnriquecido.pacienteId!,
        nombre: pacienteEnriquecido.nombre!,
        telefono: pacienteEnriquecido.telefono!,
        email: pacienteEnriquecido.email ?? null,
        fechaRegistro: pacienteEnriquecido.fechaRegistro ?? new Date().toISOString(),
        fuenteOriginal: pacienteEnriquecido.fuenteOriginal ?? 'WhatsApp',
        ultimaConsulta: pacienteEnriquecido.ultimaConsulta ?? null,
        totalConsultas: pacienteEnriquecido.totalConsultas ?? 0,
        estado: pacienteEnriquecido.estado || 'Activo',
        notas: pacienteEnriquecido.notas ?? null,
        
        // Campos específicos de PacienteDetallado no cubiertos por el mapper base
        telefonoMx10: pacienteData.telefono_mx10,
        createdAt: pacienteData.created_at,
        updatedAt: pacienteData.updated_at,
        informacionMedica: undefined,
        destino: destino, // Destino desde tabla destinos_pacientes
      };

      setPaciente(pacienteDetallado);

      // Obtener historial de consultas
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha_consulta', { ascending: false });

      if (consultasError) throw consultasError;

      // Mapear consultas usando mapper centralizado
      // Inyectamos el nombre del paciente ya que lo tenemos en memoria
      const consultasMapeadas = mapConsultasFromDB((consultasData as Tables<'consultas'>[]))
        .map(c => ({
          ...c,
          paciente: pacienteDetallado.nombre,
          pacienteId: pacienteDetallado.id // Asegurar consistencia de IDs
        }));

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
