/**
 * ============================================================
 * DASHBOARD HEATMAP - Vista compacta de ocupación anual
 * ============================================================
 * Heatmap estilo GitHub contributions para el dashboard de estadísticas
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { getOccupancyColors, type OccupancyLevel } from '@/hooks/estadisticas/useOccupancyHeatmap';
import { useConsultas } from '@/hooks/consultas/useConsultas';
import { getMonthName, isToday } from '@/lib/date-utils';

interface DashboardHeatmapProps {
  monthsToShow?: number;
}

export function DashboardHeatmap({ monthsToShow = 6 }: DashboardHeatmapProps) {
  const { consultas } = useConsultas();
  const [today, setToday] = useState(() => new Date());

  // Evitar hydration mismatch
  useEffect(() => {
    setToday(new Date());
  }, []);

  // Calcular ocupación por día
  const getDayOccupancyMap = useMemo(() => {
    const map = new Map<string, number>();
    consultas.forEach((consulta) => {
      if (consulta.estadoCita === 'Cancelada') return;
      const dateKey = consulta.fechaConsulta;
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [consultas]);

  // Calcular fecha de inicio
  const startDate = useMemo(() => {
    const date = new Date(today);
    date.setMonth(date.getMonth() - monthsToShow);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
  }, [today, monthsToShow]);

  // Generar matriz de semanas
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    const current = new Date(startDate);
    const end = new Date(today);
    
    while (current <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      result.push(week);
    }
    
    return result;
  }, [startDate, today]);

  // Headers de meses
  const monthHeaders = useMemo(() => {
    const headers: { month: string; weekIndex: number; span: number }[] = [];
    let currentMonth = -1;
    let currentSpan = 0;
    let startIndex = 0;

    weeks.forEach((week, index) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();

      if (month !== currentMonth) {
        if (currentSpan > 0) {
          headers.push({
            month: getMonthName(currentMonth).slice(0, 3),
            weekIndex: startIndex,
            span: currentSpan,
          });
        }
        currentMonth = month;
        currentSpan = 1;
        startIndex = index;
      } else {
        currentSpan++;
      }
    });

    if (currentSpan > 0) {
      headers.push({
        month: getMonthName(currentMonth).slice(0, 3),
        weekIndex: startIndex,
        span: currentSpan,
      });
    }

    return headers;
  }, [weeks]);

  // Obtener conteo del día
  const getDayCount = (date: Date): number => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return getDayOccupancyMap.get(dateKey) || 0;
  };

  // Calcular max
  const maxCount = useMemo(() => {
    return Math.max(...Array.from(getDayOccupancyMap.values()), 1);
  }, [getDayOccupancyMap]);

  // Total de consultas en el período
  const totalConsultas = useMemo(() => {
    return consultas.filter(c => c.estadoCita !== 'Cancelada').length;
  }, [consultas]);

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-foreground">{totalConsultas.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground ml-2">consultas en {monthsToShow} meses</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="inline-block min-w-0">
          {/* Headers de meses */}
          <div className="flex mb-1.5 text-[10px] text-muted-foreground relative h-4">
            {monthHeaders.map((header, idx) => (
              <div
                key={idx}
                className="absolute font-medium"
                style={{ 
                  left: `${(header.weekIndex * 11) + (header.span * 11) / 2}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                {header.month}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Labels días */}
            <div className="flex flex-col gap-[2px] pr-1">
              {['', 'L', '', 'M', '', 'V', ''].map((day, idx) => (
                <div key={idx} className="text-[9px] text-muted-foreground h-[10px] flex items-center justify-end w-3">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de semanas */}
            <div className="flex gap-[2px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[2px]">
                  {week.map((date, dayIdx) => {
                    const dayCount = getDayCount(date);
                    const percentage = maxCount > 0 ? (dayCount / maxCount) * 100 : 0;
                    const level: OccupancyLevel = percentage === 0 ? 'empty' : 
                                  percentage <= 25 ? 'low' :
                                  percentage <= 50 ? 'medium' :
                                  percentage <= 75 ? 'high' : 'very-high';
                    const colors = getOccupancyColors(level);
                    const isTodayDate = isToday(date);
                    
                    return (
                      <div
                        key={dayIdx}
                        className={`
                          w-[10px] h-[10px] rounded-[2px] transition-all cursor-pointer group relative
                          ${isTodayDate ? 'ring-1 ring-emerald-500' : ''}
                          ${dayCount > 0 ? colors.indicator : 'bg-muted/50 hover:bg-muted'}
                        `}
                        title={`${date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}: ${dayCount} citas`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-[2px]">
          {['empty', 'low', 'medium', 'high', 'very-high'].map((levelStr) => {
            const level = levelStr as OccupancyLevel;
            const colors = getOccupancyColors(level);
            return (
              <div 
                key={level}
                className={`w-[10px] h-[10px] rounded-[2px] ${colors.indicator}`}
              />
            );
          })}
        </div>
        <span>Más</span>
      </div>
    </div>
  );
}
