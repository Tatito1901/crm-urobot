'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Recordatorio } from '@/app/lib/crm-data';

type RecordatorioRow = Recordatorio & {
  consulta?: {
    consulta_id?: string | null;
    paciente?: {
      nombre_completo?: string | null;
    } | null;
  };
};

export interface RecordatorioConDetalles extends RecordatorioRow {
  consulta?: ConsultaRow;
  paciente?: PacienteRow;
}

interface UseRecordatoriosReturn {
  recordatorios: RecordatorioConDetalles[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para obtener recordatorios de WhatsApp en tiempo real
 * Alineado con el flujo ENVIAR_CONFIRMACIONES de n8n
 */
const LOCAL_RECORDATORIOS: RecordatorioConDetalles[] = [];

export function useRecordatorios(): UseRecordatoriosReturn {
  const [recordatorios, setRecordatorios] = useState<RecordatorioConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecordatorios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRecordatorios(LOCAL_RECORDATORIOS);
    } catch (err) {
      console.error('Error loading recordatorios:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordatorios();
  }, [fetchRecordatorios]);

  return {
    recordatorios,
    loading,
    error,
    refresh: fetchRecordatorios,
  };
}
