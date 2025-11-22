/**
 * ============================================================
 * HEATMAP VIEW - Vista de calendario con mapa de calor
 * ============================================================
 * Visualización profesional de ocupación histórica tipo GitHub contributions
 * Con análisis por sede (Polanco vs Satélite) para decisiones médicas
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useOccupancyHeatmap, getOccupancyColors, getOccupancyLabel, type OccupancyLevel, type DayOccupancy } from '../../hooks/useOccupancyHeatmap';
import { addDays, getMonthName, isSameDay, isToday } from '@/lib/date-utils';
import { TrendingUp, Calendar, BarChart3, MapPin, Clock, Award } from 'lucide-react';
import { useConsultas } from '@/hooks/useConsultas';
import type { Consulta } from '@/types/consultas';

interface HeatmapViewProps {
  monthsToShow?: number;
}

type SedeFilter = 'ALL' | 'POLANCO' | 'SATELITE';

export const HeatmapView: React.FC<HeatmapViewProps> = ({ monthsToShow = 12 }) => {
  const [sedeFilter, setSedeFilter] = useState<SedeFilter>('ALL');
  const { getOccupancyForDate, stats, predictions, hourlyPatterns } = useOccupancyHeatmap();
  const { consultas } = useConsultas();
  const today = new Date();
  const [viewMode, setViewMode] = useState<'annual' | 'hourly'>('annual');

  // Filtrar consultas por sede
  const filteredConsultas = useMemo(() => {
    if (sedeFilter === 'ALL') return consultas;
    return consultas.filter(c => c.sede === sedeFilter && c.estado !== 'Cancelada');
  }, [consultas, sedeFilter]);

  // Calcular ocupación por día para la sede seleccionada
  const getDayOccupancyForSede = useMemo(() => {
    const map = new Map<string, number>();
    filteredConsultas.forEach((consulta) => {
      if (consulta.estado === 'Cancelada') return;
      const dateKey = consulta.fechaConsulta;
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [filteredConsultas]);

  // Calcular fecha de inicio (hace N meses, desde inicio de semana)
  const startDate = useMemo(() => {
    const date = new Date(today);
    date.setMonth(date.getMonth() - monthsToShow);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
  }, [today, monthsToShow]);

  // Generar matriz de semanas completas
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

  // Agrupar semanas por mes para headers
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
            month: getMonthName(currentMonth),
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

    // Agregar último mes
    if (currentSpan > 0) {
      headers.push({
        month: getMonthName(currentMonth),
        weekIndex: startIndex,
        span: currentSpan,
      });
    }

    return headers;
  }, [weeks]);

  // Calcular distribución de niveles
  const distribution = useMemo(() => {
    const dist = { empty: 0, low: 0, medium: 0, high: 0, 'very-high': 0 };
    
    weeks.forEach(week => {
      week.forEach(date => {
        const occupancy = getOccupancyForDate(date);
        dist[occupancy.level]++;
      });
    });

    return dist;
  }, [weeks, getOccupancyForDate]);

  const totalDays = weeks.length * 7;

  // Calcular rachas (streaks) de días consecutivos con citas
  const streaks = useMemo(() => {
    const sortedDates = Array.from(getDayOccupancyForSede.keys()).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate: Date | null = null;

    sortedDates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (lastDate) {
        const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      lastDate = currentDate;
    });

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return {
      current: currentStreak,
      longest: longestStreak,
    };
  }, [getDayOccupancyForSede]);

  // Análisis comparativo por sede
  const sedeComparison = useMemo(() => {
    const polanco = consultas.filter(c => c.sede === 'POLANCO' && c.estado !== 'Cancelada');
    const satelite = consultas.filter(c => c.sede === 'SATELITE' && c.estado !== 'Cancelada');

    return {
      polanco: {
        total: polanco.length,
        promedio: polanco.length > 0 ? polanco.reduce((sum, c) => sum + c.duracionMinutos, 0) / polanco.length : 0,
      },
      satelite: {
        total: satelite.length,
        promedio: satelite.length > 0 ? satelite.reduce((sum, c) => sum + c.duracionMinutos, 0) / satelite.length : 0,
      },
    };
  }, [consultas]);

  // Obtener conteo del día para sede filtrada
  const getDayCountForSede = (date: Date): number => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return getDayOccupancyForSede.get(dateKey) || 0;
  };

  // Calcular max para la sede filtrada
  const maxForSede = useMemo(() => {
    return Math.max(...Array.from(getDayOccupancyForSede.values()), 0);
  }, [getDayOccupancyForSede]);

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-slate-950 to-[#050b18] p-4 md:p-6">
      {/* Header con contador estilo GitHub */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">
              {filteredConsultas.length.toLocaleString()} consultas en el último año
            </h2>
            <p className="text-slate-400 text-sm">
              Análisis de ocupación histórica por consultorio
            </p>
          </div>

          {/* Filtro de sede */}
          <div className="flex gap-2">
            <button
              onClick={() => setSedeFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sedeFilter === 'ALL'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Ambas Sedes
            </button>
            <button
              onClick={() => setSedeFilter('POLANCO')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sedeFilter === 'POLANCO'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏢 Polanco
            </button>
            <button
              onClick={() => setSedeFilter('SATELITE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sedeFilter === 'SATELITE'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏥 Satélite
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-800">
          <button
            onClick={() => setViewMode('annual')}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              viewMode === 'annual' 
                ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vista Anual (Tendencias)
          </button>
          <button
            onClick={() => setViewMode('hourly')}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              viewMode === 'hourly' 
                ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mapa de Horarios (Patrones)
          </button>
        </div>
      </div>

      {viewMode === 'annual' ? (
        <>
          {/* Métricas estilo GitHub */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* ... cards existentes ... */}
            <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-5">
              <div className="text-sm text-slate-400 mb-2">Año de consultas</div>
              <div className="text-3xl font-bold text-slate-100 mb-1">
                {filteredConsultas.length.toLocaleString()} <span className="text-lg text-slate-400">total</span>
              </div>
              <div className="text-xs text-slate-500">
                Últimos 12 meses
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-5">
              <div className="text-sm text-slate-400 mb-2">Racha más larga</div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                {streaks.longest} <span className="text-lg text-slate-400">días</span>
              </div>
              <div className="text-xs text-slate-500">
                Días consecutivos con citas
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-5">
              <div className="text-sm text-slate-400 mb-2">Racha actual</div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {streaks.current} <span className="text-lg text-slate-400">días</span>
              </div>
              <div className="text-xs text-slate-500">
                Días consecutivos recientes
              </div>
            </div>
          </div>

          {/* Calendario Heatmap (Estilo GitHub mejorado) */}
          {/* ... código existente del heatmap anual ... */}
          <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-6 mb-6 overflow-hidden">
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/30">
              <div className="min-w-[800px]">
                {/* Headers de meses */}
                <div className="flex mb-2 text-xs text-slate-400 relative h-6">
                  {monthHeaders.map((header, idx) => (
                    <div
                      key={idx}
                      className="absolute transform -translate-x-1/2 font-medium"
                      style={{ 
                        left: `${(header.weekIndex * 16) + (header.span * 16) / 2}px` 
                      }}
                    >
                      {header.month}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {/* Labels de días de la semana */}
                  <div className="flex flex-col gap-[3px] pr-2 pt-[1px]">
                    {['', 'L', '', 'M', '', 'V', ''].map((day, idx) => (
                      <div
                        key={idx}
                        className="text-[10px] text-slate-500 h-3 flex items-center justify-end w-4"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grid de semanas */}
                  <div className="flex gap-[3px]">
                    {weeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[3px]">
                        {week.map((date, dayIdx) => {
                          const dayCount = getDayCountForSede(date);
                          const percentage = maxForSede > 0 ? (dayCount / maxForSede) * 100 : 0;
                          const level = percentage === 0 ? 'empty' : 
                                        percentage <= 25 ? 'low' :
                                        percentage <= 50 ? 'medium' :
                                        percentage <= 75 ? 'high' : 'very-high';
                          const colors = getOccupancyColors(level);
                          const isTodayDate = isToday(date);
                          
                          return (
                            <div
                              key={dayIdx}
                              className={`
                                w-3 h-3 rounded-sm transition-all cursor-pointer group relative
                                ${isTodayDate ? 'ring-1 ring-emerald-400 z-10' : ''}
                                ${dayCount > 0 ? colors.indicator : 'bg-slate-800/40 hover:bg-slate-700/50'}
                                hover:scale-125 hover:z-20 hover:ring-1 hover:ring-slate-400
                              `}
                            >
                              {/* Tooltip mejorado */}
                              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max min-w-[120px] p-2 bg-slate-900/95 border border-slate-700 rounded shadow-xl pointer-events-none backdrop-blur-sm">
                                <div className="text-[10px] text-slate-400 font-medium text-center mb-1 border-b border-slate-800 pb-1">
                                  {date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                                <div className="text-center">
                                  <span className={`text-sm font-bold ${dayCount > 0 ? 'text-white' : 'text-slate-500'}`}>
                                    {dayCount}
                                  </span>
                                  <span className="text-[10px] text-slate-500 ml-1">citas</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Leyenda */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
              <span>Menos</span>
              <div className="flex gap-1">
                {['empty', 'low', 'medium', 'high', 'very-high'].map((levelStr) => {
                  const level = levelStr as OccupancyLevel;
                  const colors = getOccupancyColors(level);
                  return (
                    <div 
                      key={level}
                      className={`w-3 h-3 rounded-sm ${colors.indicator}`}
                      title={getOccupancyLabel(level)}
                    />
                  );
                })}
              </div>
              <span>Más</span>
            </div>
          </div>

          {/* Calendario Mensual */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <MonthlyHeatmap 
              title="Este Mes" 
              date={today} 
              getOccupancy={getOccupancyForDate} 
            />
            <MonthlyHeatmap 
              title="Próximo Mes" 
              date={addDays(today, 30)} 
              getOccupancy={getOccupancyForDate} 
            />
          </div>
        </>
      ) : (
        <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-6 mb-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Patrones de Horarios
              </h3>
              <p className="text-sm text-slate-400">
                Intensidad de citas por día y hora. Identifica tus horas pico recurrentes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Headers Días */}
              <div className="grid grid-cols-8 mb-2">
                <div className="text-xs font-medium text-slate-500 text-right pr-4">Hora</div>
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="text-xs font-semibold text-slate-300 text-center">{day}</div>
                ))}
              </div>

              {/* Filas Horas */}
              <div className="space-y-1">
                {hourlyPatterns.map((pattern) => (
                  <div key={pattern.hour} className="grid grid-cols-8 items-center group hover:bg-white/5 rounded-md transition-colors">
                    {/* Label Hora */}
                    <div className="text-xs font-medium text-slate-500 text-right pr-4 py-2">
                      {pattern.hour}:00
                    </div>
                    
                    {/* Celdas Días */}
                    {pattern.countsByDay.map((count, dayIndex) => {
                      // Calcular intensidad relativa para esta hora
                      // Normalizar vs el max global o max de la fila? Global es mejor para comparar.
                      // Usaremos un max aproximado para visualización (ej. 10 citas es muy alto para una hora específica)
                      const intensity = Math.min(count / 5, 1); // Asumiendo 5 como saturación alta por hora
                      
                      // Escala de azules/indigo
                      const bgStyle = count === 0 
                        ? 'bg-slate-800/30' 
                        : `bg-indigo-500`;
                      
                      const opacity = count === 0 ? 1 : 0.2 + (intensity * 0.8);

                      return (
                        <div key={dayIndex} className="flex justify-center p-1 h-full">
                          <div 
                            className={`
                              w-full h-8 rounded flex items-center justify-center text-xs font-bold transition-all relative group/cell
                              ${bgStyle}
                            `}
                            style={{ opacity: count > 0 ? opacity : 1 }}
                          >
                            {count > 0 && (
                              <span className="text-white drop-shadow-md opacity-90">{count}</span>
                            )}
                            
                            {/* Tooltip */}
                            {count > 0 && (
                              <div className="hidden group-hover/cell:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap px-2 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded shadow-lg pointer-events-none">
                                {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayIndex]} {pattern.hour}:00 - {count} citas históricas
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-slate-500 flex justify-end items-center gap-2">
            <span>Baja intensidad</span>
            <div className="w-16 h-2 bg-gradient-to-r from-indigo-500/20 to-indigo-500 rounded-full" />
            <span>Alta intensidad</span>
          </div>
        </div>
      )}

      {/* Análisis Comparativo por Sede */}
      {sedeFilter === 'ALL' && (
        <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Comparativa de Consultorios
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Polanco */}
            <div className="bg-slate-800/30 border border-blue-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h4 className="text-sm font-semibold text-blue-400">🏢 Consultorio Polanco</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Total de consultas</span>
                    <span className="text-xl font-bold text-slate-100">
                      {sedeComparison.polanco.total}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Duración promedio</span>
                    <span className="text-lg font-semibold text-blue-400">
                      {Math.round(sedeComparison.polanco.promedio)} min
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">% del total</span>
                    <span className="text-lg font-semibold text-slate-300">
                      {((sedeComparison.polanco.total / consultas.filter(c => c.estado !== 'Cancelada').length) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Satélite */}
            <div className="bg-slate-800/30 border border-emerald-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-semibold text-emerald-400">🏥 Consultorio Satélite</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Total de consultas</span>
                    <span className="text-xl font-bold text-slate-100">
                      {sedeComparison.satelite.total}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Duración promedio</span>
                    <span className="text-lg font-semibold text-emerald-400">
                      {Math.round(sedeComparison.satelite.promedio)} min
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">% del total</span>
                    <span className="text-lg font-semibold text-slate-300">
                      {((sedeComparison.satelite.total / consultas.filter(c => c.estado !== 'Cancelada').length) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de barras comparativo */}
          <div className="mt-6">
            <div className="text-xs text-slate-400 mb-2">Distribución de consultas por sede</div>
            <div className="flex gap-1 h-8">
              <div 
                className="bg-blue-500 rounded-l flex items-center justify-center text-xs font-semibold text-white"
                style={{ width: `${(sedeComparison.polanco.total / (sedeComparison.polanco.total + sedeComparison.satelite.total)) * 100}%` }}
              >
                {sedeComparison.polanco.total > 0 && `${Math.round((sedeComparison.polanco.total / (sedeComparison.polanco.total + sedeComparison.satelite.total)) * 100)}%`}
              </div>
              <div 
                className="bg-emerald-500 rounded-r flex items-center justify-center text-xs font-semibold text-white"
                style={{ width: `${(sedeComparison.satelite.total / (sedeComparison.polanco.total + sedeComparison.satelite.total)) * 100}%` }}
              >
                {sedeComparison.satelite.total > 0 && `${Math.round((sedeComparison.satelite.total / (sedeComparison.polanco.total + sedeComparison.satelite.total)) * 100)}%`}
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Polanco</span>
              <span>Satélite</span>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Análisis Predictivo (IA) */}
      {sedeFilter === 'ALL' && predictions && (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Análisis Predictivo de Demanda (IA)
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Día Pico */}
            <div className="bg-slate-900/40 border border-indigo-500/30 rounded-lg p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-12 h-12 text-indigo-400" />
              </div>
              <div className="text-sm text-indigo-300 mb-2 font-medium">Día Pico Histórico</div>
              <div className="text-3xl font-bold text-slate-100 mb-1 capitalize">
                {predictions.busiestDay.label}
              </div>
              <div className="text-xs text-slate-400">
                Promedio de <span className="text-indigo-300 font-semibold">{predictions.busiestDay.avgCount.toFixed(1)}</span> citas
              </div>
            </div>

            {/* Tendencia Mensual */}
            <div className="bg-slate-900/40 border border-indigo-500/30 rounded-lg p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-12 h-12 text-indigo-400" />
              </div>
              <div className="text-sm text-indigo-300 mb-2 font-medium">Tendencia Mensual</div>
              <div className={`text-3xl font-bold mb-1 flex items-center gap-2 ${predictions.monthlyGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {predictions.monthlyGrowth > 0 ? '+' : ''}{predictions.monthlyGrowth.toFixed(1)}%
                <span className="text-lg text-slate-500">vs mes anterior</span>
              </div>
              <div className="text-xs text-slate-400">
                Crecimiento de demanda últimos 30 días
              </div>
            </div>

            {/* Proyección Semanal */}
            <div className="bg-slate-900/40 border border-indigo-500/30 rounded-lg p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-12 h-12 text-indigo-400" />
              </div>
              <div className="text-sm text-indigo-300 mb-2 font-medium">Proyección Semanal</div>
              <div className="text-3xl font-bold text-slate-100 mb-1">
                ~{predictions.predictedNextWeekCount} <span className="text-lg text-slate-500">citas</span>
              </div>
              <div className="text-xs text-slate-400">
                Estimación para la próxima semana
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente auxiliar para Calendario Mensual de Intensidad
 */
const MonthlyHeatmap = ({ 
  title, 
  date, 
  getOccupancy 
}: { 
  title: string; 
  date: Date; 
  getOccupancy: (d: Date) => DayOccupancy 
}) => {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  
  // Generar días del mes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  
  // Ajustar para empezar en Lunes (L=0, D=6 en nuestra UI, pero JS: D=0, L=1)
  // Queremos L=0, M=1... D=6. JS da D=0.
  // Transform: D(0)->6, L(1)->0, M(2)->1...
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startOffset }, (_, i) => i);

  return (
    <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-200">{title}</h4>
        <span className="text-xs font-medium text-slate-400 uppercase">
          {getMonthName(currentMonth)} {currentYear}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => (
          <div key={`${d}-${idx}`} className="text-[10px] text-slate-500 font-medium">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => <div key={`blank-${b}`} className="aspect-square" />)}
        
        {days.map(day => {
          const currentDayDate = new Date(currentYear, currentMonth, day);
          const occupancy = getOccupancy(currentDayDate);
          const colors = getOccupancyColors(occupancy.level);
          const isTodayDate = isToday(currentDayDate);
          
          return (
            <div 
              key={day}
              className={`
                aspect-square rounded-md flex items-center justify-center text-xs font-medium relative group cursor-default
                ${colors.indicator} ${occupancy.count > 0 ? colors.text : 'text-slate-600'}
                ${isTodayDate ? 'ring-1 ring-emerald-400 ring-offset-1 ring-offset-slate-900' : ''}
              `}
            >
              {day}
              {occupancy.count > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-50" />
              )}
              
              {/* Tooltip simple */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-lg pointer-events-none">
                {occupancy.count} citas
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
