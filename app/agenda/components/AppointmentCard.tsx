/**
 * ============================================================
 * APPOINTMENT CARD - Tarjeta de cita mejorada
 * ============================================================
 */

import React from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { StatusBadge } from './StatusBadge';
import {
  formatTimeRange,
  formatLongDate,
  getTimeUntil,
  URGENCY_CONFIG,
  getShortName,
  getInitials
} from '../lib/agenda-utils';
import type { Consulta } from '@/types/consultas';

interface AppointmentCardProps {
  consulta: Consulta;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

export const AppointmentCard: React.FC<AppointmentCardProps> = React.memo(({
  consulta,
  onClick,
  variant = 'default'
}) => {
  const timezone = consulta.timezone ?? 'America/Mexico_City';
  const fechaConsulta = consulta.fechaConsulta ?? Temporal.Now.plainDateISO(timezone).toString();
  const horaConsulta = consulta.horaConsulta ?? '00:00:00';

  const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
  const fechaInicio = fechaBase.toZonedDateTime(timezone);
  const fechaFin = fechaInicio.add({ minutes: consulta.duracionMinutos ?? 45 });

  const timeInfo = getTimeUntil(fechaInicio);
  const urgencyConfig = URGENCY_CONFIG[timeInfo.urgency];

  const nombrePaciente = getShortName(consulta.paciente);
  const iniciales = getInitials(consulta.paciente);
  const motivo = consulta.motivoConsulta ?? consulta.tipo ?? 'Consulta';

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left rounded-lg border ${urgencyConfig.borderClass} bg-slate-900/40 px-3 py-2.5 transition-all hover:bg-slate-900/60 hover:border-slate-600`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
              {iniciales}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{nombrePaciente}</p>
              <p className="text-xs text-slate-500 truncate">
                {formatTimeRange(fechaInicio, fechaFin)} · {consulta.sede}
              </p>
            </div>
          </div>

          {/* Badge */}
          <StatusBadge status={consulta.estado} variant="compact" className="flex-shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border ${urgencyConfig.borderClass} bg-[#0d1118] p-4 transition-all hover:bg-[#111820] hover:shadow-lg hover:shadow-blue-500/10`}
    >
      {/* Header con hora y badge de urgencia */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {timeInfo.isToday ? 'HOY' : timeInfo.isTomorrow ? 'MAÑANA' : formatLongDate(fechaInicio)}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-100">
            {formatTimeRange(fechaInicio, fechaFin)}
          </p>
          <p className="text-xs text-slate-400">{consulta.duracionMinutos} minutos</p>
        </div>

        {timeInfo.urgency !== 'normal' && timeInfo.urgency !== 'past' && (
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${urgencyConfig.badgeClass}`}>
            {timeInfo.text}
          </span>
        )}
      </div>

      {/* Paciente */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-lg">
          {iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-100 truncate">{nombrePaciente}</p>
          <p className="text-sm text-slate-400 truncate">{motivo}</p>
        </div>
      </div>

      {/* Footer con ubicación y estado */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{consulta.sede}</span>
          </span>

          {consulta.tipo && (
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{consulta.tipo}</span>
            </span>
          )}
        </div>

        <StatusBadge status={consulta.estado} variant="compact" />
      </div>

      {/* Indicador de no confirmada */}
      {consulta.estado.toLowerCase() === 'programada' && !consulta.confirmadoPaciente && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2">
          <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-yellow-200">Pendiente de confirmación</p>
        </div>
      )}
    </button>
  );
});

AppointmentCard.displayName = 'AppointmentCard';
