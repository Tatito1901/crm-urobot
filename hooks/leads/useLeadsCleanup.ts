/**
 * ============================================================
 * HOOK: useLeadsCleanup
 * ============================================================
 * Limpia leads que ya son pacientes o tienen citas programadas
 * - Identifica leads duplicados por teléfono en pacientes
 * - Actualiza leads con citas a estado Convertido
 * - Vincula paciente_id cuando corresponde
 */

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { invalidateDomain } from '@/lib/swr-config';

const supabase = createClient();

export interface LeadToClean {
  id: string;
  telefono: string;
  nombreLead: string | null;
  estado: string;
  // Datos del paciente encontrado
  pacienteId: string | null;
  nombrePaciente: string | null;
  // Citas encontradas
  tieneCitas: boolean;
  totalCitas: number;
  ultimaCita: string | null;
  // Razón de limpieza
  razon: 'paciente_existente' | 'tiene_citas' | 'tiene_nombre';
}

export interface CleanupResult {
  leadsAnalizados: number;
  leadsActualizados: number;
  leadsEliminados: number;
  errores: string[];
}

interface UseLeadsCleanupReturn {
  // Estado
  isScanning: boolean;
  isCleaning: boolean;
  leadsPendientes: LeadToClean[];
  lastResult: CleanupResult | null;
  error: string | null;
  
  // Acciones
  escanearLeads: () => Promise<LeadToClean[]>;
  limpiarLeads: (mode: 'actualizar' | 'eliminar') => Promise<CleanupResult>;
  limpiarUno: (leadId: string, mode: 'actualizar' | 'eliminar') => Promise<boolean>;
  reset: () => void;
}

export function useLeadsCleanup(): UseLeadsCleanupReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [leadsPendientes, setLeadsPendientes] = useState<LeadToClean[]>([]);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Normaliza teléfono a 10 dígitos
   */
  const normalizarTelefono = (tel: string): string => {
    return tel.replace(/\D/g, '').slice(-10);
  };

  /**
   * Escanea leads para identificar cuáles deben ser limpiados
   */
  const escanearLeads = useCallback(async (): Promise<LeadToClean[]> => {
    setIsScanning(true);
    setError(null);
    
    try {
      // 1. Obtener todos los leads que NO están convertidos
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, telefono, nombre, estado, convertido_a_paciente_id')
        .neq('estado', 'convertido')
        .is('convertido_a_paciente_id', null);

      if (leadsError) throw leadsError;
      if (!leadsData || leadsData.length === 0) {
        setLeadsPendientes([]);
        return [];
      }

      // 2. Extraer teléfonos únicos para buscar
      const telefonosLeads = leadsData.map(l => normalizarTelefono(l.telefono));
      
      // 3. Buscar pacientes por teléfono
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('id, telefono, nombre')
        .filter('telefono', 'in', `(${telefonosLeads.join(',')})`);

      // Crear mapa de teléfono -> paciente
      const pacientesMap = new Map<string, { id: string; nombre: string | null }>();
      for (const p of pacientesData || []) {
        const tel10 = normalizarTelefono(p.telefono);
        pacientesMap.set(tel10, { id: p.id, nombre: p.nombre });
      }

      // 4. Buscar consultas por teléfono (a través de pacientes)
      const pacienteIds = Array.from(pacientesMap.values()).map(p => p.id);
      
      let citasMap = new Map<string, { total: number; ultima: string | null }>();
      
      if (pacienteIds.length > 0) {
        const { data: citasData } = await supabase
          .from('consultas')
          .select('paciente_id, fecha_hora_inicio, estado_cita')
          .in('paciente_id', pacienteIds)
          .order('fecha_hora_inicio', { ascending: false });

        // Agrupar citas por paciente
        for (const cita of citasData || []) {
          if (!cita.paciente_id) continue;
          
          const existing = citasMap.get(cita.paciente_id);
          if (existing) {
            existing.total++;
          } else {
            citasMap.set(cita.paciente_id, {
              total: 1,
              ultima: cita.fecha_hora_inicio
            });
          }
        }
      }

      // 5. Identificar leads que necesitan limpieza
      const leadsToClean: LeadToClean[] = [];
      
      for (const lead of leadsData) {
        const tel10 = normalizarTelefono(lead.telefono);
        const paciente = pacientesMap.get(tel10);
        
        // Si tiene paciente asociado
        if (paciente) {
          const citas = citasMap.get(paciente.id);
          
          leadsToClean.push({
            id: lead.id,
            telefono: lead.telefono,
            nombreLead: lead.nombre,
            estado: lead.estado || 'nuevo',
            pacienteId: paciente.id,
            nombrePaciente: paciente.nombre,
            tieneCitas: (citas?.total || 0) > 0,
            totalCitas: citas?.total || 0,
            ultimaCita: citas?.ultima || null,
            razon: (citas?.total || 0) > 0 ? 'tiene_citas' : 'paciente_existente'
          });
        }
        // Si el lead tiene nombre pero no está en pacientes (caso raro)
        else if (lead.nombre && lead.nombre.trim().length > 3) {
          // Este lead tiene nombre pero no es paciente aún
          // Podría ser un lead que debería actualizarse
          leadsToClean.push({
            id: lead.id,
            telefono: lead.telefono,
            nombreLead: lead.nombre,
            estado: lead.estado || 'nuevo',
            pacienteId: null,
            nombrePaciente: null,
            tieneCitas: false,
            totalCitas: 0,
            ultimaCita: null,
            razon: 'tiene_nombre'
          });
        }
      }

      // Ordenar por prioridad (con citas primero, luego pacientes existentes)
      leadsToClean.sort((a, b) => {
        if (a.tieneCitas && !b.tieneCitas) return -1;
        if (!a.tieneCitas && b.tieneCitas) return 1;
        if (a.pacienteId && !b.pacienteId) return -1;
        if (!a.pacienteId && b.pacienteId) return 1;
        return 0;
      });

      setLeadsPendientes(leadsToClean);
      return leadsToClean;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return [];
    } finally {
      setIsScanning(false);
    }
  }, []);

  /**
   * Limpia un lead individual
   */
  const limpiarUno = useCallback(async (
    leadId: string, 
    mode: 'actualizar' | 'eliminar'
  ): Promise<boolean> => {
    try {
      const lead = leadsPendientes.find(l => l.id === leadId);
      if (!lead) return false;

      if (mode === 'eliminar') {
        // Eliminar el lead
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', leadId);
        
        if (error) throw error;
      } else {
        // Actualizar a convertido y vincular paciente_id
        const updateData: Record<string, unknown> = {
          estado: 'convertido',
          updated_at: new Date().toISOString(),
        };
        
        // Si hay paciente_id, vincularlo
        if (lead.pacienteId) {
          updateData.convertido_a_paciente_id = lead.pacienteId;
        }
        
        // Si el paciente tiene nombre y el lead no, actualizar
        if (lead.nombrePaciente && !lead.nombreLead) {
          updateData.nombre = lead.nombrePaciente;
        }
        
        const { error } = await supabase
          .from('leads')
          .update(updateData)
          .eq('id', leadId);
        
        if (error) throw error;
      }

      // Remover de la lista e invalidar caches
      setLeadsPendientes(prev => prev.filter(l => l.id !== leadId));
      await invalidateDomain('leads');
      return true;
      
    } catch (err) {
      console.error('Error limpiando lead:', err);
      return false;
    }
  }, [leadsPendientes]);

  /**
   * Limpia todos los leads pendientes
   */
  const limpiarLeads = useCallback(async (
    mode: 'actualizar' | 'eliminar'
  ): Promise<CleanupResult> => {
    setIsCleaning(true);
    setError(null);
    
    const result: CleanupResult = {
      leadsAnalizados: leadsPendientes.length,
      leadsActualizados: 0,
      leadsEliminados: 0,
      errores: [],
    };

    try {
      for (const lead of leadsPendientes) {
        try {
          if (mode === 'eliminar') {
            const { error } = await supabase
              .from('leads')
              .delete()
              .eq('id', lead.id);
            
            if (error) throw error;
            result.leadsEliminados++;
          } else {
            const updateData: Record<string, unknown> = {
              estado: 'convertido',
              updated_at: new Date().toISOString(),
            };
            
            if (lead.pacienteId) {
              updateData.convertido_a_paciente_id = lead.pacienteId;
            }
            
            if (lead.nombrePaciente && !lead.nombreLead) {
              updateData.nombre = lead.nombrePaciente;
            }
            
            const { error } = await supabase
              .from('leads')
              .update(updateData)
              .eq('id', lead.id);
            
            if (error) throw error;
            result.leadsActualizados++;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error';
          result.errores.push(`Lead ${lead.telefono}: ${message}`);
        }
      }

      setLeadsPendientes([]);
      setLastResult(result);
      // ✅ Invalidar caches después de limpieza masiva
      await invalidateDomain('leads');
      return result;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return result;
    } finally {
      setIsCleaning(false);
    }
  }, [leadsPendientes]);

  /**
   * Resetea el estado
   */
  const reset = useCallback(() => {
    setLeadsPendientes([]);
    setLastResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    isCleaning,
    leadsPendientes,
    lastResult,
    error,
    escanearLeads,
    limpiarLeads,
    limpiarUno,
    reset,
  };
}

export default useLeadsCleanup;
