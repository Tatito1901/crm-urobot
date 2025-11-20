/**
 * ============================================================
 * HEATMAP VIEW - Mapa de calor de ocupación mensual
 * ============================================================
 * Visualización tipo GitHub contributions para ver ocupación
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '@/types/agenda';
import { Temporal } from '@js-temporal/polyfill';

interface HeatmapViewProps {
  appointments: Appointment[];
}

// Niveles de ocupación
type OccupancyLevel = 'none' | 'low' | 'medium' | 'high' | 'very-high';

interface DayData {
  date: Temporal.PlainDate;
  count: number;
  level: OccupancyLevel;
  appointments: Appointment[];
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ appointments }) => {
  const [currentMonth, setCurrentMonth] = useState(() => 
    Temporal.Now.plainDateISO('America/Mexico_City')
  );

  // Calcular ocupación por día
  const heatmapData = useMemo(() => {
    const year = currentMonth.year;
    const month = currentMonth.month;
    const daysInMonth = currentMonth.daysInMonth;
    
    // Crear array de todos los días del mes
    const days: DayData[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = Temporal.PlainDate.from({ year, month, day });
      
      // Filtrar citas de este día
      const dayAppointments = appointments.filter(apt => {
        const aptDate = apt.start.toPlainDate();
        return aptDate.equals(date);
      });
      
      const count = dayAppointments.length;
      
      // Determinar nivel de ocupación
      let level: OccupancyLevel;
      if (count === 0) level = 'none';
      else if (count <= 3) level = 'low';
      else if (count <= 6) level = 'medium';
      else if (count <= 10) level = 'high';
      else level = 'very-high';
      
      days.push({
        date,
        count,
        level,
        appointments: dayAppointments,
      });
    }
    
    return days;
  }, [appointments, currentMonth]);

  // Organizar días en semanas (lunes a domingo)
  const weeks = useMemo(() => {
    const weeksArray: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    // Agregar días vacíos al inicio si el mes no empieza en lunes
    const firstDay = heatmapData[0].date.dayOfWeek; // 1=Lun, 7=Dom
    for (let i = 1; i < firstDay; i++) {
      currentWeek.push(null as any); // Placeholder
    }
    
    // Agregar todos los días
    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      
      // Si es domingo o último día, cerrar semana
      if (day.date.dayOfWeek === 7 || index === heatmapData.length - 1) {
        // Completar semana con nulls si es necesario
        while (currentWeek.length < 7) {
          currentWeek.push(null as any);
        }
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return weeksArray;
  }, [heatmapData]);

  // Navegación de meses
  const goToPrevMonth = () => {
    setCurrentMonth(prev => prev.subtract({ months: 1 }));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => prev.add({ months: 1 }));
  };

  const goToToday = () => {
    setCurrentMonth(Temporal.Now.plainDateISO('America/Mexico_City'));
  };

  // Colores por nivel
  const getLevelColor = (level: OccupancyLevel) => {
    switch (level) {
      case 'none': return 'bg-slate-800/30 border-slate-700';
      case 'low': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'medium': return 'bg-amber-500/30 border-amber-500/40';
      case 'high': return 'bg-orange-500/40 border-orange-500/50';
      case 'very-high': return 'bg-red-500/50 border-red-500/60';
    }
  };

  const getLevelLabel = (level: OccupancyLevel) => {
    switch (level) {
      case 'none': return 'Sin citas';
      case 'low': return 'Baja ocupación';
      case 'medium': return 'Ocupación media';
      case 'high': return 'Alta ocupación';
      case 'very-high': return 'Muy ocupado';
    }
  };

  const monthName = currentMonth.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
  const today = Temporal.Now.plainDateISO('America/Mexico_City');

  return (
    <div className="flex-1 overflow-auto bg-slate-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white capitalize">
            Ocupación de {monthName}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-300" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={index} className="text-center text-xs font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} className="aspect-square" />;
                }

                const isToday = day.date.equals(today);
                const isWeekend = day.date.dayOfWeek === 6 || day.date.dayOfWeek === 7;

                return (
                  <div
                    key={dayIndex}
                    className={`
                      aspect-square rounded-lg border-2 transition-all cursor-pointer
                      ${getLevelColor(day.level)}
                      ${isToday ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}
                      ${isWeekend ? 'opacity-60' : ''}
                      hover:scale-110 hover:z-10 group relative
                    `}
                    title={`${day.date.toLocaleString('es-MX', { day: 'numeric', month: 'short' })}: ${day.count} citas`}
                  >
                    {/* Número del día */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-xs font-bold ${day.level === 'none' ? 'text-slate-500' : 'text-white'}`}>
                        {day.date.day}
                      </span>
                      {day.count > 0 && (
                        <span className="text-[10px] font-medium text-white/80">
                          {day.count}
                        </span>
                      )}
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        <p className="text-xs font-semibold text-white mb-1">
                          {day.date.toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-xs text-slate-300">
                          {day.count} {day.count === 1 ? 'cita' : 'citas'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {getLevelLabel(day.level)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs">
          <span className="text-slate-400 font-medium">Ocupación:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-800/30 border border-slate-700" />
            <span className="text-slate-400">Ninguna</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span className="text-slate-400">Baja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/40" />
            <span className="text-slate-400">Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500/40 border border-orange-500/50" />
            <span className="text-slate-400">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/50 border border-red-500/60" />
            <span className="text-slate-400">Muy alta</span>
          </div>
        </div>

        {/* Estadísticas del mes */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Total citas</p>
            <p className="text-2xl font-bold text-white">
              {heatmapData.reduce((sum, day) => sum + day.count, 0)}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Días con citas</p>
            <p className="text-2xl font-bold text-white">
              {heatmapData.filter(day => day.count > 0).length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Promedio/día</p>
            <p className="text-2xl font-bold text-white">
              {(heatmapData.reduce((sum, day) => sum + day.count, 0) / heatmapData.length).toFixed(1)}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Día más ocupado</p>
            <p className="text-2xl font-bold text-white">
              {Math.max(...heatmapData.map(day => day.count))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
