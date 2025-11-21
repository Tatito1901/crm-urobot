/**
 * ============================================================
 * LIST VIEW - Vista de lista de consultas
 * ============================================================
 * Vista en lista para mejor visualización y búsqueda
 */

'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { formatTimeRange, getStatusConfig } from '../../lib/agenda-utils';
import { useAgendaState } from '../../hooks/useAgendaState';
import { useAppointmentColor } from '../../hooks/useColorPreferences';
import type { Appointment } from '@/types/agenda';

interface ListViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  dateRange: { start: Date; end: Date };
}

export const ListView: React.FC<ListViewProps> = ({
  appointments,
  onAppointmentClick,
  dateRange,
}) => {
  const todayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Agrupar citas por fecha
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: Appointment[] } = {};

    appointments.forEach((apt) => {
      const date = apt.start.toPlainDate().toString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(apt);
    });

    // Ordenar por fecha y luego por hora dentro de cada grupo
    Object.keys(groups).forEach((date) => {
      groups[date].sort((a, b) => {
        return a.start.epochMilliseconds - b.start.epochMilliseconds;
      });
    });

    return groups;
  }, [appointments]);

  const sortedDates = Object.keys(groupedAppointments).sort();
  
  // Obtener fecha de hoy en formato string
  const todayStr = Temporal.Now.plainDateISO('America/Mexico_City').toString();
  const hasTodayAppointments = sortedDates.includes(todayStr);
  
  // Auto-scroll al día de hoy
  useEffect(() => {
    if (hasTodayAppointments && todayRef.current && containerRef.current) {
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasTodayAppointments, sortedDates.join(',')]);

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg
          className="h-16 w-16 text-slate-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-lg text-slate-400 font-medium">No hay consultas en este rango</p>
        <p className="text-sm text-slate-500 mt-1">
          {new Date(dateRange.start).toLocaleDateString('es-MX')} -{' '}
          {new Date(dateRange.end).toLocaleDateString('es-MX')}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth">
      {sortedDates.map((dateStr) => {
        const appointments = groupedAppointments[dateStr];
        const firstApt = appointments[0];
        const date = firstApt.start.toPlainDate();

        // Formatear fecha
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const monthNames = [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ];

        const dateLabel = `${dayNames[date.dayOfWeek % 7]}, ${date.day} de ${
          monthNames[date.month - 1]
        } de ${date.year}`;
        
        // Verificar si es hoy
        const today = new Date();
        const isToday = date.year === today.getFullYear() && 
                       date.month === (today.getMonth() + 1) && 
                       date.day === today.getDate();

        // Verificar si es hoy
        const isToday = dateStr === todayStr;
        
        return (
          <div 
            key={dateStr} 
            ref={isToday ? todayRef : null}
            className={isToday ? 'scroll-mt-4' : ''}
          >
            {/* Header de fecha */}
            <div className={`flex items-center gap-3 mb-3 ${isToday ? 'bg-gradient-to-r from-emerald-500/10 to-transparent -mx-4 px-4 py-2 rounded-lg' : ''}`}>
              <h3 className="text-sm font-semibold text-slate-300">{dateLabel}</h3>
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-500">{appointments.length} consultas</span>
            </div>

            {/* Lista de citas */}
            <div className={viewDensity === 'compact' ? 'space-y-1.5' : viewDensity === 'comfortable' ? 'space-y-2' : 'space-y-3'}>
              {appointments.map((apt) => {
                const status = getStatusConfig(apt.estado);
                const paddingClass = viewDensity === 'compact' ? 'p-3' : viewDensity === 'comfortable' ? 'p-4' : 'p-5';
                // Obtener color personalizado
                const customColor = useAppointmentColor(apt.sede);

                return (
                  <button
                    key={apt.id}
                    onClick={() => onAppointmentClick(apt)}
                    className={`w-full text-left ${paddingClass} rounded-lg bg-slate-900/80 border-l-4 border-r border-t border-b border-slate-700/70 shadow-sm shadow-black/40 hover:bg-slate-900 hover:border-slate-300/40 hover:shadow-md hover:shadow-black/60 transition-all group`}
                    style={{
                      borderLeftColor: customColor,
                      backgroundColor: `${customColor}08`, // 8% opacity
                    }}
                  >
                    <div className={`flex items-start ${viewDensity === 'compact' ? 'gap-2' : viewDensity === 'comfortable' ? 'gap-4' : 'gap-5'}`}>
                      {/* Hora */}
                      <div className={`flex-shrink-0 ${viewDensity === 'compact' ? 'w-16' : viewDensity === 'comfortable' ? 'w-24' : 'w-28'}`}>
                        <p className={`font-semibold text-slate-200 ${viewDensity === 'compact' ? 'text-xs' : viewDensity === 'comfortable' ? 'text-sm' : 'text-base'}`}>
                          {formatTimeRange(apt.start, apt.end).split(' - ')[0]}
                        </p>
                        <p className={`text-slate-400 ${viewDensity === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
                          {apt.duracionMinutos} min
                        </p>
                      </div>

                      {/* Información principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-100 truncate">
                              {apt.paciente}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">
                              {apt.tipo.replace(/_/g, ' ')}
                            </p>
                          </div>

                          {/* Estado */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${status.bgClass} ${status.borderClass} border flex-shrink-0`}
                          >
                            <span>{status.icon}</span>
                            <span className={status.textClass}>{status.label}</span>
                          </span>
                        </div>

                        {/* Motivo de consulta */}
                        {apt.motivoConsulta && (
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {apt.motivoConsulta}
                          </p>
                        )}

                        {/* Meta información */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {/* Sede */}
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {apt.sede}
                          </span>

                          {/* Modalidad */}
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 capitalize">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {apt.modalidad}
                          </span>

                          {/* Teléfono */}
                          {apt.telefono && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {apt.telefono}
                            </span>
                          )}

                          {/* Prioridad alta/urgente */}
                          {apt.prioridad !== 'normal' && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                apt.prioridad === 'urgente'
                                  ? 'bg-red-600/10 text-red-400'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {apt.prioridad === 'urgente' ? 'Urgente' : 'Alta'}
                            </span>
                          )}

                          {/* Confirmación */}
                          {!apt.confirmadoPaciente && apt.estado !== 'Cancelada' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                              Sin confirmar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Icono de navegación */}
                      <svg
                        className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
