/**
 * ============================================================
 * HOOK: useSedes - Gestión de sedes y horarios
 * ============================================================
 * CRUD para la tabla sedes con horario_json
 * Compatible con SWR cache y invalidación por dominio
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_READONLY } from '@/lib/swr-config';
import type { Sede, SedeRow, HorarioJson } from '@/types/sedes';
import { mapSedeFromDB } from '@/types/sedes';

const supabase = createClient();

// ============================================================
// FETCHER
// ============================================================

const fetchSedes = async (): Promise<Sede[]> => {
  const { data, error } = await supabase
    .from('sedes')
    .select('*')
    .eq('activo', true)
    .order('sede', { ascending: true });

  if (error) throw error;

  return (data as unknown as SedeRow[]).map(mapSedeFromDB);
};

// ============================================================
// UPDATE FUNCTIONS
// ============================================================

export interface UpdateSedeHorarioParams {
  sedeId: string;
  horarioJson: HorarioJson;
}

export interface UpdateSedeInfoParams {
  sedeId: string;
  displayName?: string;
  direccion?: string;
  mapsUrl?: string;
  instruccionesLlegada?: string;
  anchorDate?: string;
  anchorWeekType?: string;
}

async function updateSedeHorario(params: UpdateSedeHorarioParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('sedes')
      .update({
        horario_json: params.horarioJson as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.sedeId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

async function updateSedeInfo(params: UpdateSedeInfoParams): Promise<{ success: boolean; error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = { updated_at: new Date().toISOString() };

    if (params.displayName !== undefined) payload.display_name = params.displayName;
    if (params.direccion !== undefined) payload.direccion = params.direccion;
    if (params.mapsUrl !== undefined) payload.maps_url = params.mapsUrl;
    if (params.instruccionesLlegada !== undefined) payload.instrucciones_llegada = params.instruccionesLlegada;
    if (params.anchorDate !== undefined) payload.anchor_date = params.anchorDate;
    if (params.anchorWeekType !== undefined) payload.anchor_week_type = params.anchorWeekType;

    const { error } = await supabase
      .from('sedes')
      .update(payload)
      .eq('id', params.sedeId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

// ============================================================
// HOOK
// ============================================================

export interface UseSedesReturn {
  sedes: Sede[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateHorario: (params: UpdateSedeHorarioParams) => Promise<{ success: boolean; error?: string }>;
  updateInfo: (params: UpdateSedeInfoParams) => Promise<{ success: boolean; error?: string }>;
}

export function useSedes(): UseSedesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'sedes-list',
    fetchSedes,
    SWR_CONFIG_READONLY
  );

  const handleUpdateHorario = async (params: UpdateSedeHorarioParams) => {
    const result = await updateSedeHorario(params);
    if (result.success) {
      await mutate();
    }
    return result;
  };

  const handleUpdateInfo = async (params: UpdateSedeInfoParams) => {
    const result = await updateSedeInfo(params);
    if (result.success) {
      await mutate();
    }
    return result;
  };

  return {
    sedes: data || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate(); },
    updateHorario: handleUpdateHorario,
    updateInfo: handleUpdateInfo,
  };
}
