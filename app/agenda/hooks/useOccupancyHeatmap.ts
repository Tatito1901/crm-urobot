/**
 * ============================================================
 * HOOK: useOccupancyHeatmap
 * ============================================================
 * Hook para calcular niveles de ocupación histórica del calendario
 * Permite identificar días de alta/baja demanda para mejor planeación
 */

import { useMemo } from 'react';
import { useConsultas } from '@/hooks/useConsultas';

export type OccupancyLevel = 'empty' | 'low' | 'medium' | 'high' | 'very-high';

export interface DayOccupancy {
  date: string; // YYYY-MM-DD
  count: number;
  level: OccupancyLevel;
  percentage: number; // 0-100
}

export interface OccupancyStats {
  min: number;
  max: number;
  avg: number;
  total: number;
}

interface UseOccupancyHeatmapReturn {
  getOccupancyForDate: (date: Date) => DayOccupancy;
  getOccupancyForRange: (startDate: Date, endDate: Date) => Map<string, DayOccupancy>;
  stats: OccupancyStats;
  loading: boolean;
}

/**
 * Determina el nivel de ocupación basado en el porcentaje
 */
function getOccupancyLevel(percentage: number): OccupancyLevel {
  if (percentage === 0) return 'empty';
  if (percentage <= 25) return 'low';
  if (percentage <= 50) return 'medium';
  if (percentage <= 75) return 'high';
  return 'very-high';
}

/**
 * Formatea fecha a string YYYY-MM-DD
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Hook para obtener datos de ocupación histórica
 */
export function useOccupancyHeatmap(): UseOccupancyHeatmapReturn {
  const { consultas, loading } = useConsultas();

  // Calcular estadísticas de ocupación por día
  const occupancyMap = useMemo(() => {
    const map = new Map<string, number>();

    // Contar consultas por día (solo consultas confirmadas/completadas)
    consultas.forEach((consulta) => {
      // Solo contar consultas que no fueron canceladas
      if (consulta.estado === 'Cancelada') return;
      
      const dateKey = consulta.fechaConsulta;
      const current = map.get(dateKey) || 0;
      map.set(dateKey, current + 1);
    });

    return map;
  }, [consultas]);

  // Calcular estadísticas globales
  const stats = useMemo((): OccupancyStats => {
    const counts = Array.from(occupancyMap.values());
    
    if (counts.length === 0) {
      return { min: 0, max: 0, avg: 0, total: 0 };
    }

    const total = counts.reduce((sum, count) => sum + count, 0);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const avg = total / counts.length;

    return { min, max, avg, total };
  }, [occupancyMap]);

  // Función para obtener ocupación de una fecha específica
  const getOccupancyForDate = (date: Date): DayOccupancy => {
    const dateKey = formatDateKey(date);
    const count = occupancyMap.get(dateKey) || 0;
    
    // Calcular porcentaje basado en el máximo histórico
    const percentage = stats.max > 0 ? (count / stats.max) * 100 : 0;
    const level = getOccupancyLevel(percentage);

    return {
      date: dateKey,
      count,
      level,
      percentage,
    };
  };

  // Función para obtener ocupación de un rango de fechas
  const getOccupancyForRange = (startDate: Date, endDate: Date): Map<string, DayOccupancy> => {
    const result = new Map<string, DayOccupancy>();
    const current = new Date(startDate);

    while (current <= endDate) {
      const occupancy = getOccupancyForDate(current);
      result.set(occupancy.date, occupancy);
      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  return {
    getOccupancyForDate,
    getOccupancyForRange,
    stats,
    loading,
  };
}

/**
 * Obtiene colores del heatmap según el nivel de ocupación
 */
export function getOccupancyColors(level: OccupancyLevel): {
  bg: string;
  border: string;
  text: string;
  indicator: string;
} {
  switch (level) {
    case 'empty':
      return {
        bg: 'bg-slate-900/50',
        border: 'border-slate-700/30',
        text: 'text-slate-500',
        indicator: 'bg-slate-600/20',
      };
    case 'low':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        indicator: 'bg-blue-500/40',
      };
    case 'medium':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        indicator: 'bg-emerald-500/50',
      };
    case 'high':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        indicator: 'bg-amber-500/60',
      };
    case 'very-high':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        indicator: 'bg-red-500/70',
      };
  }
}

/**
 * Obtiene descripción legible del nivel de ocupación
 */
export function getOccupancyLabel(level: OccupancyLevel): string {
  switch (level) {
    case 'empty':
      return 'Sin citas';
    case 'low':
      return 'Baja demanda';
    case 'medium':
      return 'Demanda media';
    case 'high':
      return 'Alta demanda';
    case 'very-high':
      return 'Muy alta demanda';
  }
}
