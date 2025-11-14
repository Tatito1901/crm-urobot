/**
 * ============================================================
 * LIST VIEW - Vista de lista de consultas
 * ============================================================
 * Vista en lista para mejor visualización y búsqueda
 */

'use client';

import React, { useMemo } from 'react';
import { formatTimeRange, getStatusConfig } from '../../lib/agenda-utils';
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
    <div className="h-full overflow-y-auto p-6 space-y-6">
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

        return (
          <div key={dateStr}>
            {/* Header de fecha */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-slate-300">{dateLabel}</h3>
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-500">{appointments.length} consultas</span>
            </div>

            {/* Lista de citas */}
            <div className="space-y-2">
              {appointments.map((apt) => {
                const status = getStatusConfig(apt.estado);

                return (
                  <button
                    key={apt.id}
                    onClick={() => onAppointmentClick(apt)}
                    className="w-full text-left p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Hora */}
                      <div className="flex-shrink-0 w-24">
                        <p className="text-sm font-semibold text-slate-200">
                          {formatTimeRange(apt.start, apt.end).split(' - ')[0]}
                        </p>
                        <p className="text-xs text-slate-400">{apt.duracionMinutos} min</p>
                      </div>

                      {/* Indicador de color por tipo/prioridad */}
                      <div
                        className={`w-1 rounded-full self-stretch ${
                          apt.prioridad === 'urgente'
                            ? 'bg-red-600'
                            : apt.prioridad === 'alta'
                            ? 'bg-amber-500'
                            : apt.tipo === 'primera_vez'
                            ? 'bg-blue-600'
                            : apt.tipo === 'subsecuente'
                            ? 'bg-blue-500'
                            : apt.tipo === 'control_post_op'
                            ? 'bg-emerald-600'
                            : apt.tipo === 'urgencia'
                            ? 'bg-red-600'
                            : apt.tipo === 'teleconsulta'
                            ? 'bg-cyan-600'
                            : 'bg-slate-500'
                        }`}
                      />

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
                              {apt.prioridad === 'urgente' ? '🔴 Urgente' : '⚠️ Alta'}
                            </span>
                          )}

                          {/* Confirmación */}
                          {!apt.confirmadoPaciente && apt.estado !== 'Cancelada' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                              ⏳ Sin confirmar
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
