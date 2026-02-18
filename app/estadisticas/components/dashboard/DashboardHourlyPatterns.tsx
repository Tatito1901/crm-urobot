/**
 * ============================================================
 * DASHBOARD HOURLY PATTERNS - Patrones de horarios
 * ============================================================
 * Heatmap de horas x días para identificar patrones de demanda
 */

'use client';

import React from 'react';
import { useOccupancyHeatmap } from '@/hooks/estadisticas/useOccupancyHeatmap';
import { Clock } from 'lucide-react';

export function DashboardHourlyPatterns() {
  const { hourlyPatterns } = useOccupancyHeatmap();

  // Filtrar solo horas laborales principales (8-19)
  const filteredPatterns = React.useMemo(() => {
    return hourlyPatterns.filter(p => p.hour >= 8 && p.hour <= 19);
  }, [hourlyPatterns]);

  // Calcular max para normalizar colores
  const maxCount = React.useMemo(() => {
    let max = 0;
    filteredPatterns.forEach(pattern => {
      pattern.countsByDay.forEach(count => {
        if (count > max) max = count;
      });
    });
    return max || 1;
  }, [filteredPatterns]);

  // Días de la semana (solo L-V para vista compacta)
  const days = ['L', 'M', 'M', 'J', 'V'];
  const dayIndices = [1, 2, 3, 4, 5]; // Lun-Vie en índices JS (0=Dom)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-medium text-foreground">Patrones de Horario</span>
        <span className="text-[10px] text-muted-foreground ml-auto">Lun - Vie</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[280px]">
          {/* Headers Días */}
          <div className="grid grid-cols-6 gap-1 mb-1">
            <div className="text-[10px] text-muted-foreground text-right pr-1">Hora</div>
            {days.map((day, idx) => (
              <div key={idx} className="text-[10px] font-medium text-center text-muted-foreground">{day}</div>
            ))}
          </div>

          {/* Filas Horas */}
          <div className="space-y-[2px]">
            {filteredPatterns.map((pattern) => (
              <div key={pattern.hour} className="grid grid-cols-6 gap-1 items-center">
                {/* Label Hora */}
                <div className="text-[10px] text-muted-foreground text-right pr-1">
                  {pattern.hour}:00
                </div>
                
                {/* Celdas Días (solo L-V) */}
                {dayIndices.map((dayIndex) => {
                  const count = pattern.countsByDay[dayIndex] || 0;
                  const intensity = count / maxCount;
                  
                  return (
                    <div 
                      key={dayIndex}
                      className="h-5 rounded-[3px] flex items-center justify-center transition-all cursor-default group relative"
                      style={{ 
                        backgroundColor: count === 0 
                          ? 'var(--muted)' 
                          : `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`,
                        opacity: count === 0 ? 0.3 : 1
                      }}
                      title={`${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayIndex]} ${pattern.hour}:00 - ${count} citas`}
                    >
                      {count > 0 && (
                        <span className="text-[9px] font-bold text-white drop-shadow-sm">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-end gap-1.5 pt-2 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="w-12 h-2 bg-gradient-to-r from-indigo-500/15 to-indigo-500 rounded-full" />
        <span>Más</span>
      </div>
    </div>
  );
}
