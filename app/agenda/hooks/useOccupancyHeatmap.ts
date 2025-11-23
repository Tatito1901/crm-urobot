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

export interface WeekdayStats {
  dayIndex: number; // 0=Sunday
  avgCount: number;
  totalCount: number;
  label: string;
}

export interface PredictionStats {
  busiestDay: WeekdayStats;
  quietestDay: WeekdayStats;
  monthlyGrowth: number; // percentage
  predictedNextWeekCount: number;
}

export interface HourlyPattern {
  hour: number; // 0-23
  countsByDay: number[]; // Array de 7 elementos (Dom-Sab) con conteo de citas
  total: number;
}

interface UseOccupancyHeatmapReturn {
  getOccupancyForDate: (date: Date) => DayOccupancy;
  getOccupancyForRange: (startDate: Date, endDate: Date) => Map<string, DayOccupancy>;
  stats: OccupancyStats;
  predictions: PredictionStats;
  hourlyPatterns: HourlyPattern[]; // Patrones por hora y día
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

  // Calcular predicciones y estadísticas avanzadas
  const predictions = useMemo((): PredictionStats => {
    const weekdayCounts = Array(7).fill(0);
    const weekdayOccurrences = Array(7).fill(0);
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    let last30DaysCount = 0;
    let previous30DaysCount = 0;

    consultas.forEach(c => {
      if (c.estado === 'Cancelada') return;
      const date = new Date(c.fechaConsulta);
      const dayIndex = date.getDay(); // 0 = Sunday
      
      // Solo considerar datos históricos para promedios semanales (últimos 12 meses)
      // para evitar sesgo por fechas futuras vacías
      if (date <= now) {
        weekdayCounts[dayIndex]++;
        weekdayOccurrences[dayIndex]++; // Aproximación simple, idealmente contaríamos semanas exactas
      }

      // Conteo para crecimiento mensual
      if (date >= thirtyDaysAgo && date <= now) {
        last30DaysCount++;
      } else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) {
        previous30DaysCount++;
      }
    });

    // Calcular promedios por día
    const weekdayStats: WeekdayStats[] = weekdayCounts.map((count, index) => ({
      dayIndex: index,
      totalCount: count,
      avgCount: weekdayOccurrences[index] > 0 ? count / (weekdayOccurrences[index] || 1) : 0, // Simplificación: asumimos distribución uniforme de semanas
      label: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][index],
    }));

    // Encontrar día más y menos ocupado (excluyendo Domingo si es 0 o muy bajo, común en consultorios)
    const activeDays = weekdayStats.filter(d => d.totalCount > 0);
    const sortedDays = [...activeDays].sort((a, b) => b.totalCount - a.totalCount);
    
    const busiestDay = sortedDays[0] || weekdayStats[1]; // Fallback a Lunes
    const quietestDay = sortedDays[sortedDays.length - 1] || weekdayStats[0];

    // Crecimiento mensual
    const monthlyGrowth = previous30DaysCount > 0 
      ? ((last30DaysCount - previous30DaysCount) / previous30DaysCount) * 100 
      : 0;

    // Predicción próxima semana (simple: suma de promedios diarios)
    const predictedNextWeekCount = Math.round(activeDays.reduce((acc, day) => acc + (day.totalCount / 12), 0)); // Aprox. promedio de 12 semanas

    return {
      busiestDay,
      quietestDay,
      monthlyGrowth,
      predictedNextWeekCount
    };
  }, [consultas]);

  // Calcular patrones horarios (Heatmap Semanal)
  const hourlyPatterns = useMemo(() => {
    // Inicializar matriz 24h x 7d
    const patterns: HourlyPattern[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      countsByDay: Array(7).fill(0),
      total: 0
    }));

    consultas.forEach(c => {
      if (c.estado === 'Cancelada') return;
      
      // Parsear hora "HH:mm:ss" o "HH:mm"
      const [hourStr] = c.horaConsulta.split(':');
      const hour = parseInt(hourStr, 10);
      
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        const date = new Date(c.fechaConsulta);
        const dayIndex = date.getDay(); // 0=Dom, 1=Lun...
        
        patterns[hour].countsByDay[dayIndex]++;
        patterns[hour].total++;
      }
    });

    // Filtrar horas sin actividad para compactar la vista (ej. 00:00 - 06:00)
    // Opcional: mantener rango fijo operativo (ej. 8-20) si se prefiere consistencia
    const startHour = 7; // 7 AM
    const endHour = 21;  // 9 PM
    
    return patterns.filter(p => p.hour >= startHour && p.hour <= endHour);
  }, [consultas]);

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
    predictions,
    hourlyPatterns,
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
        bg: 'bg-muted/50',
        border: 'border-border',
        text: 'text-muted-foreground',
        indicator: 'bg-muted hover:bg-muted/80',
      };
    case 'low':
      return {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        border: 'border-blue-200 dark:border-blue-500/30',
        text: 'text-blue-600 dark:text-blue-400',
        indicator: 'bg-blue-200 dark:bg-blue-500/40 hover:bg-blue-300 dark:hover:bg-blue-500/50',
      };
    case 'medium':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        indicator: 'bg-emerald-300 dark:bg-emerald-500/50 hover:bg-emerald-400 dark:hover:bg-emerald-500/60',
      };
    case 'high':
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/30',
        text: 'text-amber-600 dark:text-amber-400',
        indicator: 'bg-amber-400 dark:bg-amber-500/60 hover:bg-amber-500 dark:hover:bg-amber-500/70',
      };
    case 'very-high':
      return {
        bg: 'bg-red-50 dark:bg-red-500/10',
        border: 'border-red-200 dark:border-red-500/30',
        text: 'text-red-600 dark:text-red-400',
        indicator: 'bg-red-500 dark:bg-red-500/70 hover:bg-red-600 dark:hover:bg-red-500/80',
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
