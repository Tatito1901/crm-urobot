/**
 * ============================================================
 * HEATMAP VIEW - Vista de calendario con mapa de calor
 * ============================================================
 * Visualización profesional de ocupación histórica tipo GitHub contributions
 * Con análisis por sede (Polanco vs Satélite) para decisiones médicas
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useOccupancyHeatmap, getOccupancyColors, getOccupancyLabel } from '../../hooks/useOccupancyHeatmap';
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
  const { getOccupancyForDate, stats } = useOccupancyHeatmap();
  const { consultas } = useConsultas();
  const today = new Date();

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
    let longestStreakStart = '';
    let longestStreakEnd = '';
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
      </div>

      {/* Métricas estilo GitHub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card de total */}
        <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-5">
          <div className="text-sm text-slate-400 mb-2">Año de consultas</div>
          <div className="text-3xl font-bold text-slate-100 mb-1">
            {filteredConsultas.length.toLocaleString()} <span className="text-lg text-slate-400">total</span>
          </div>
          <div className="text-xs text-slate-500">
            Últimos 12 meses
          </div>
        </div>

        {/* Card de racha máxima */}
        <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-5">
          <div className="text-sm text-slate-400 mb-2">Racha más larga</div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            {streaks.longest} <span className="text-lg text-slate-400">días</span>
          </div>
          <div className="text-xs text-slate-500">
            Días consecutivos con citas
          </div>
        </div>

        {/* Card de racha actual */}
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

      {/* Calendario Heatmap */}
      <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-6 mb-6">
        {/* Headers de meses */}
        <div className="grid mb-3" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
          {monthHeaders.map((header, idx) => (
            <div
              key={idx}
              className="text-xs font-semibold text-slate-300 text-center"
              style={{ gridColumnStart: header.weekIndex + 1, gridColumnEnd: header.weekIndex + header.span + 1 }}
            >
              {header.month}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="flex gap-1">
          {/* Labels de días de la semana */}
          <div className="flex flex-col gap-1 pr-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
              <div
                key={idx}
                className="text-[10px] text-slate-500 font-medium flex items-center justify-end h-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid de semanas */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
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
                        w-2.5 h-2.5 rounded-[2px] transition-all cursor-pointer group relative
                        ${isTodayDate ? 'ring-1 ring-emerald-400' : ''}
                        ${dayCount > 0 ? colors.indicator : 'bg-slate-800/40'}
                        hover:scale-[2] hover:z-10 hover:ring-2 hover:ring-slate-500
                      `}
                      title={`${date.toLocaleDateString('es-MX')} - ${dayCount} citas`}
                    >
                      {/* Tooltip detallado */}
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-48 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl pointer-events-none">
                        <p className="text-xs font-semibold text-slate-200 mb-2">
                          {date.toLocaleDateString('es-MX', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long'
                          })}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Citas:</span>
                            <span className={`font-bold ${colors.text}`}>{dayCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Nivel:</span>
                            <span className={`font-medium ${colors.text}`}>
                              {getOccupancyLabel(level)}
                            </span>
                          </div>
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

      {/* Leyenda compacta estilo GitHub */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>Menos</span>
          <div className="flex items-center gap-0.5">
            {['empty', 'low', 'medium', 'high', 'very-high'].map((level) => {
              const colors = getOccupancyColors(level as any);
              return (
                <div 
                  key={level}
                  className={`w-2.5 h-2.5 rounded-[2px] ${colors.indicator}`}
                  title={getOccupancyLabel(level as any)}
                />
              );
            })}
          </div>
          <span>Más</span>
        </div>
      </div>

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
    </div>
  );
};
